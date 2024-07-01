import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_preference_model.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/auth/auth_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/api/wallet/models/gg_user_balance.dart';
import 'package:gogaming_app/common/api/wallet/wallet_api.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/biometric_service.dart';
import 'package:gogaming_app/common/service/coupon_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/im/im_file_cache_manager.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/global_setting.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/sentry_util.dart';
import 'package:gogaming_app/pages/chat/chat_presenter.dart';
import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/socket/gaming_signalr_provider.dart';
import 'package:launch_queue/launch_queue.dart';

import '../utils/util.dart';
import 'im/datebase/im_database_service.dart';

class AccountService {
  // 如果一个函数的构造方法并不总是返回一个新的对象的时候，可以使用factory，
  // 比如从缓存中获取一个实例并返回或者返回一个子类型的实例

  // 工厂方法构造函数
  factory AccountService() => _getInstance();

  // instance的getter方法，通过AccountService.instance获取对象
  static AccountService get sharedInstance => _getInstance();

  // 静态变量_instance，存储唯一对象
  static AccountService? _instance;

  // 用户在原创游戏中，余额更新不及时，所以直接和原创游戏交互。不通过后台的接口获取
  bool updateBalanceLock = false;

  // 私有的命名式构造方法，通过它可以实现一个类可以有多个构造函数，
  // 子类不能继承internal不是关键字，可定义其他名字
  AccountService._internal() {
    // 初始化
    ever<List<GGUserBalance>>(userBalances, (list) {
      cacheUserBalances.val =
          list.map((e) => Map<String, dynamic>.from(e.toJson())).toList();
    });

    GamingEvent.signalrUpdateBalance.subscribe(() {
      fetchUserBalance().listen((event) {}, onError: (error) {});
    });

    GamingEvent.updateBalanceByApp.subscribe((dynamic v) {
      _updateBalanceByApp(v);
    });
    GamingEvent.onDeposit.subscribe(onDeposit);
  }

  // 获取对象
  static AccountService _getInstance() {
    _instance ??= AccountService._internal();
    return _instance!;
  }

  GoGamingResponse<dynamic>? tokenExpiredData;

  final cacheUser = ReadWriteValue<Map<String, dynamic>?>(
    'CacheGamingUserModel',
    null,
    () => GetStorage(),
  );

  late GamingUserModel? gamingUser = () {
    final user =
        cacheUser.val == null ? null : GamingUserModel.fromJson(cacheUser.val!);
    if (user?.token != null) {
      GoGamingService.sharedInstance.updateToken(user?.token, isUser: true);
      debugPrint('read cached user: ${cacheUser.val}');
    }
    return user;
  }();

  late final _curGamingUser = gamingUser.obs;
  GamingUserModel? get curGamingUser => _curGamingUser.value;
  int? get lastLoginTime => _curGamingUser.value?.lastLoginTime;
  String? get _avatar => _curGamingUser.value?.avater;

  bool get isVip => curGamingUser?.isVip ?? false;
  bool get isSVip => curGamingUser?.isSVip ?? false;
  int get vipLevel => curGamingUser?.vipGrade ?? 0;
  String? get kycLevel => curGamingUser?.kycGrade;
  String? get kycName => curGamingUser?.kycName;

  bool get isLogin =>
      gamingUser is GamingUserModel && gamingUser?.token?.isNotEmpty == true;

  /// 用户的全部资产
  /// 新接口包含了非粘性真人娱乐场、娱乐场钱包金额
  late final userBalances = () {
    final list = cacheUserBalances.val
        .map((e) => GGUserBalance.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    return list.obs;
  }();

  final cacheUserBalances = ReadWriteValue<List<dynamic>>(
    'AccountService.cacheUserBalances',
    [<String, dynamic>{}],
    () => GetStorage(),
  );

  final cacheLastLoginUid = ReadWriteValue<String?>(
    'CacheLastLoginUid',
    null,
    () => GetStorage(),
  );

  late String? lastLoginUid = cacheLastLoginUid.val;

  GamingPreferenceModel? get userSetting => gamingUser?.userSetting;

  // 手动更新余额
  void _updateBalanceByApp(dynamic data) {
    Map<dynamic, dynamic> data2 = data as Map<dynamic, dynamic>;
    String curCurrency = GGUtil.parseStr(data2['currency']);
    double curBalance = GGUtil.parseDouble(data2['balance']);
    final userBalance = userBalances
        .firstWhereOrNull((element) => curCurrency == element.currency);
    if (userBalance != null) {
      userBalances.remove(userBalance);
      userBalance.balance = curBalance;
      userBalances.add(userBalance);
    }
  }

  Stream<bool> fetchUserBalance() {
    if (updateBalanceLock || !isLogin) {
      return Stream.value(false);
    }
    return PGSpi(Wallet.userBalance.toTarget())
        .rxRequest<List<GGUserBalance>?>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) =>
                GGUserBalance.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return null;
      }
    }).flatMap((response) {
      final success = response.success;
      if (success) {
        userBalances.assignAll(response.data ?? []);
      }
      CurrencyService.sharedInstance
          .updateRate()
          .listen((event) {}, onError: (err) {});
      return Stream.value(success == true);
    });
  }

  /// 刷新用户token
  Stream<bool> authRefresh() {
    final apiService = GoGamingService.sharedInstance;
    final isLogin = this.isLogin;
    return PGSpi(Auth.authRefresh.toTarget(input: {
      'token': isLogin ? apiService.userToken : apiService.jwtToken
    })).rxRequest<String?>(asyncHeaders: false, (value) {
      final data = value['data'];
      if (data is String) {
        return data;
      } else {
        return null;
      }
    }).flatMap((userData) {
      final success = userData.success;
      GoGamingService.sharedInstance
          .updateToken(userData.data, isUser: isLogin);
      saveGamingUser(gamingUser);
      SignalrProvider().resetConnectionAndReconection();
      return Stream.value(success == true);
    });
  }

  void setKycName(String name) {
    if (gamingUser != null) {
      gamingUser!.kycName = name;
      cacheUser.val = gamingUser!.toJson();
      _curGamingUser(gamingUser);
    }
  }

  Stream<bool?> updateDefaultLanguage(String language) {
    if (!AccountService.sharedInstance.isLogin) {
      return Stream.value(false);
    }
    return PGSpi(Account.setDefaultLanguage
        .toTarget(inputData: {"language": language})).rxRequest<bool?>((value) {
      return value['data'] is bool ? value['data'] as bool : null;
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<bool> updateGamingUserInfo() {
    return PGSpi(Account.getUserInfo.toTarget())
        .rxRequest<GamingUserModel?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return GamingUserModel.fromJson(data);
      } else {
        return null;
      }
    }).flatMap((userData) {
      final success = userData.success;
      saveGamingUser(userData.data);
      if (success == true) {
        CouponService.sharedInstance
            .refresh()
            .listen((event) {}, onError: (error) {});
        fetchUserBalance().listen((event) {}, onError: (error) {});
        if (KycService.sharedInstance.info.value == null) {
          KycService.sharedInstance
              .updateKycData()
              .listen((event) {}, onError: (_) {});
        }
      }
      return Stream.value(success == true);
    });
  }

  /// 保存用户数据
  void saveGamingUser(GamingUserModel? user) {
    if (user?.uid == null) return;
    // 登录时记录最后一次登录uid
    if (cacheUser.val == null) {
      cacheLastLoginUid.val = user?.uid;
      lastLoginUid = user?.uid;
    }
    // 同步当前用户的生物识别key
    if (user?.appBiometricKey != null) {
      BiometricService.sharedInstance.storeKey(user!.appBiometricKey!);
    } else {
      BiometricService.sharedInstance.removeKey();
    }
    //替换userInfo的数据
    user?.token = GoGamingService.sharedInstance.userToken;
    gamingUser = user;
    cacheUser.val = user!.toJson();
    _curGamingUser(user);
    SentryUtil.initUser();
  }

  void logout() {
    PGSpi(Account.logout.toTarget()).rxRequest<bool>((value) {
      final data = value['data'];
      return data == true;
    }).listen((event) {}, onError: (e) {});

    //需要延迟删除用户数据 不然logout接口会报错
    Future.delayed(const Duration(milliseconds: 10), () async {
      // Future.delayed(const Duration(), () {
      VipService.sharedInstance.reInit();
      CouponService.sharedInstance.reInit();
      KycService.sharedInstance.reInit();
      IMImageCacheManager.sharedInstance.close();
      IMFileCacheManager().close();
      removeGamingUserInfo();
      GamingEvent.loggedOut.notify();
      GlobalSetting.sharedInstance.updateRiskState().listen((event) {});
    });
  }

  /// 移除用户数据
  void removeGamingUserInfo() async {
    Get.delete<ChatPresenter>(force: true);
    IMDatabaseService.sharedInstance.reInit();
    GoGamingService.sharedInstance.updateToken(null, isUser: true);
    gamingUser = null;
    cacheUser.val = null;
    _curGamingUser(null);
    userBalances.clear();
    SentryUtil.initUser();
  }
}

extension Logout on AccountService {
  void _onReLogin() {
    GoGamingService.sharedInstance.commonHeader;
    //当前页面不是启动页面就跳转登录
    final mainLogic = Get.findOrNull<MainLogic>();
    if (mainLogic != null) {
      Get.until((route) => Get.currentRoute == Routes.main.route);
      mainLogic.changeSelectIndex(-1);
      Future.delayed(const Duration(milliseconds: 300), () {
        _onLogin();
      });
    }
  }

  void _onLogin() {
    if (BiometricService.sharedInstance.canBiometricLogin()) {
      Get.toNamed<dynamic>(Routes.biometricLogin.route);
    } else {
      Get.toNamed<dynamic>(Routes.login.route);
    }
  }

  void afterJumpMainPage() {
    if (tokenExpiredData != null) {
      Future.delayed(const Duration(seconds: 1), () {
        onTokenExpireEvent(tokenExpiredData!);
      });
    }
  }

  void onDeposit(Map<String, dynamic> data) {
    final res = data['res'] as Map<String, dynamic>;
    final isSuccess = res['status'] == 'Success';
    Toast.showDetail(
      state: isSuccess ? GgToastState.success : GgToastState.fail,
      title: isSuccess ? localized('successful') : localized('failed'),
      message:
          '${localized('notice_header')} ${res['data']['Amount']}${res['data']['Currency']} ${localized('notice_footer')}',
    );
  }

  /// 处理用户登出事件
  void onTokenExpireEvent(GoGamingResponse<dynamic> response) {
    if (!isLogin && tokenExpiredData == null) return;

    removeGamingUserInfo();
    tokenExpiredData = _didInMainPage() ? null : response;
    if (!_didInMainPage()) {
      return;
    }
    GamingEvent.tokenExpireEvent.notify(data: {'res': response});
    LaunchQueue.sharedInstance.clear();
    final context = Get.overlayContext!;
    if (!response.success) {
      final code = response.code;
      if (code == '403' || code == '401') {
        Toast.show(
          context: context,
          state: GgToastState.fail,
          title: localized('hint'),
          // message: response.toString(),
          message: localized('token_expire_hint'),
        );
        _onReLogin();
      } else if (code == '1001') {
        final title = localized('hint');
        final content = localized('rep_log_tip');
        final dialog = DialogUtil(
          context: context,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          title: title,
          content: content,
          rightBtnName: localized('confirm_button'),
          leftBtnName: '',
          onRightBtnPressed: () {
            Get.back<dynamic>();
            _onReLogin();
          },
        );
        dialog.showNoticeDialogWithTwoButtons();
      } else if (code == '1999') {
        final title = localized('hint');
        final content = localized('kicked_out_by_administrator_notice');
        final dialog = DialogUtil(
          context: context,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          title: title,
          content: content,
          rightBtnName: localized('confirm_button'),
          leftBtnName: '',
          onRightBtnPressed: () {
            Get.back<dynamic>();
            _onReLogin();
          },
        );
        dialog.showNoticeDialogWithTwoButtons();
      }
    }
  }
}

bool _didInMainPage() => Get.currentRoute != Routes.splash.route;

extension Build on AccountService {
  Widget buildCustomAvatar(double width, double height) {
    return Obx(() {
      final avatar = gamingUser?.avater;
      debugPrint('_avatar is equal avatar = ${_avatar == avatar}');
      return _buildAvatar(width, height, avatar ?? '');
    });
  }

  Widget _buildAvatar(double width, double height, String avatar) {
    Widget resultWidget = Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius:
            BorderRadius.circular((width > height ? height : width) / 2.0),
        color: GGColors.brand.color.withOpacity(0.3),
      ),
    );
    if (avatar.isEmpty) {
      String char = gamingUser != null &&
              gamingUser?.uid != null &&
              gamingUser!.uid!.isNotEmpty
          ? gamingUser!.uid!.substring(0, 1)
          : "";
      resultWidget = Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          borderRadius:
              BorderRadius.circular((width > height ? height : width) / 2.0),
          color: GGColors.brand.color.withOpacity(0.3),
        ),
        alignment: Alignment.center,
        child: Text(
          char.toUpperCase(),
          style: GGTextStyle(
            fontSize: GGFontSize.smallTitle,
            fontWeight: GGFontWeigh.medium,
            color: GGColors.highlightButton.color.withOpacity(0.3),
            fontFamily: GGFontFamily.dingPro,
          ),
        ),
      );
    } else {
      if (avatar.startsWith("http") == true) {
        resultWidget = GamingImage.network(
          url: avatar,
          width: width,
          height: height,
          radius: (width > height ? height : width) / 2.0,
          fit: BoxFit.fill,
        );
      } else if (avatar.startsWith('avatar-')) {
        final avatarLocalPath = gamingUser!.avatarLocalPath;
        if (avatarLocalPath.contains('http') == true) {
          resultWidget = ClipRRect(
            borderRadius:
                BorderRadius.circular((width > height ? height : width) / 2.0),
            child: GamingImage.network(
              url: avatarLocalPath,
              width: width,
              height: height,
              radius: (width > height ? height : width) / 2.0,
              fit: BoxFit.fill,
            ),
          );
        } else {
          resultWidget = ClipRRect(
            borderRadius:
                BorderRadius.circular((width > height ? height : width) / 2.0),
            child: Image.asset(avatarLocalPath, width: width, height: height),
          );
        }
      }
    }
    return resultWidget;
  }
}
