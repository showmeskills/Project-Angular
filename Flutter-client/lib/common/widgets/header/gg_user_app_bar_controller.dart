import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/gg_failed_request_desc.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_provider_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gg_user_balance.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/common/service/im/im_manager.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/service/upgrade_app_service.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/pages/manager_currency/manager_currency_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../config/environment.dart';

class GGUserAppBarController extends GetxController {
  GGUserAppBarController(this.context);

  BuildContext context;
  late final isLogin = AccountService.sharedInstance.isLogin.obs;
  late Function disposeListen;
  late Worker userBalancesWorker;
  ManagerCurrencyLogic? managerCurrencyLogic;

  /// 游戏试用中
  final isPlaying = false.obs;
  final RxnString _appLogo = RxnString();
  String? get appLogo => _appLogo.value;

  bool get chatEnabled => IMManager().access.value;

  /// 后端版本号，只有在非正式环境下展示
  final RxnString backendVersion = RxnString();

  @override
  void onInit() {
    super.onInit();
    disposeListen = AccountService.sharedInstance.cacheUser.getBox!()
        .listenKey(AccountService.sharedInstance.cacheUser.key, (value) {
      _userDidUpdate();
    });
    userBalancesWorker = ever<List<GGUserBalance>>(
        AccountService.sharedInstance.userBalances, (callback) {
      update();
    });
    MerchantService.sharedInstance.getMerchantConfig().listen((event) {
      if (event != null) {
        _appLogo.value = event.appLogo;
      }
    });
    _initDefaultCurrency();
    _loadBackendVersion();

    GamingEvent.showGamePlaying.subscribe(setPlaying);
    GamingEvent.showNoGamePlaying.subscribe(setNoPlaying);
    GamingEvent.loggedOut.subscribe(loggedOut);
  }

  void setPlaying() {
    _setPlaying(true);
  }

  void setNoPlaying() {
    _setPlaying(false);
  }

  void loggedOut() {
    CurrencyService.sharedInstance.logoutRefreshSelectedCurrecy();
  }

  void _userDidUpdate() {
    isLogin.value = AccountService.sharedInstance.isLogin;
    _initDefaultCurrency();
  }

  void _initDefaultCurrency() {
    if (isLogin.value) {
      managerCurrencyLogic = Get.put(
        ManagerCurrencyLogic(),
        permanent: true,
        tag: AccountService.sharedInstance.gamingUser?.uid,
      );
    }
  }

  void _loadBackendVersion() {
    /// 正式环境不请求后端版本号
    if (Config.currentConfig.environment == Environment.product) {
      return;
    }
    String url = "${Config.currentConfig.apiUrl}version";
    final dio = Dio(
      BaseOptions(
        connectTimeout: 10000,
        receiveTimeout: 5000,
        contentType: Headers.jsonContentType,
        responseType: ResponseType.plain,
      ),
    );
    dio.interceptors.add(GGFailedInterceptor(
      errorCode: SpecialApiErrorCode.version.code,
    ));
    dio.get<String>(url).then((value) {
      if (value.data != null) {
        backendVersion.value = value.data;
      }
    });
  }

  GamingCurrencyModel get selectedCurrency =>
      CurrencyService.sharedInstance.selectedCurrency;

  String get selectedIconUrl => selectedCurrency.iconUrl;

  String get selectedBalanceText {
    if (isPlaying.value == true) {
      return '(${localized('play_in')})';
    }
    NumberPrecision balance = NumberPrecision(0);
    if (AccountService.sharedInstance.isLogin) {
      final userBalance = AccountService.sharedInstance.userBalances
          .where((p0) {
            return p0.walletCategory.toLowerCase() == 'main';
          })
          .toList()
          .firstWhereOrNull(
              (element) => selectedCurrency.currency == element.currency);

      /// 过滤同币种下非粘性奖金部分
      final nonstickyList =
          AccountService.sharedInstance.userBalances.where((p0) {
        return (p0.walletCategory.toLowerCase() != 'main' &&
                p0.walletCategory.isNotEmpty) &&
            (p0.currency == selectedCurrency.currency);
      }).map((e) {
        return NumberPrecision(e.balance);
      }).toList();
      var nonstickyTotalBalance = NumberPrecision(0);
      for (var element in nonstickyList) {
        nonstickyTotalBalance = nonstickyTotalBalance.plus(element);
      }

      if (userBalance != null) {
        /// 总余额
        /// 添加了非粘性部分
        balance =
            NumberPrecision(userBalance.balance).plus(nonstickyTotalBalance);
      }
    }
    String symbol = selectedCurrency.symbol ?? '';
    String balanceText =
        NumberPrecision(balance).balanceText(selectedCurrency.isDigital);
    if (selectedCurrency.isDigital) {
      symbol = CurrencyService.sharedInstance.displayFiatCurrency?.symbol ?? '';
      balanceText = CurrencyService.sharedInstance
          .cryptoToFiat(
            currency: selectedCurrency.currency!,
            balance: balance.toNumber(),
          )
          .balanceText(!CurrencyService.sharedInstance.diplayInFiat);
    }
    return symbol + balanceText;
  }

  void enterGameDetail(String gameProviderId) {
    final provider = GameService.sharedInstance.provider.firstWhere(
        (element) => element.providerCatId == gameProviderId,
        orElse: () => GamingGameProviderModel());
    if (provider.category != null &&
        Config.sharedInstance.gameConfig.playingProvider
            .contains(provider.category)) {
      _setPlaying(true);
    }
  }

  void leaveGame() {
    Future.delayed(const Duration(milliseconds: 300), () {
      final currentRoute = Get.currentRoute;
      // 转盘和webgame显示“游戏中”
      if (currentRoute != Routes.webGame.route &&
          currentRoute != Routes.gameDetail.route) {
        _setPlaying(false);
      }
    });
  }

  void _setPlaying(bool playing) {
    //防止异常setState() or markNeedsBuild() called during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      isPlaying.value = playing;
    });
  }

  /// 是否显示小红点
  bool showUpdateRedDot() {
    UpdateType needUpdate =
        UpgradeAppService.sharedInstance.checkIfNeedUpdate();

    final updateRedDot = needUpdate == UpdateType.updateTypeForced ||
        needUpdate == UpdateType.updateTypeOptional;

    return updateRedDot;
  }

  @override
  void onClose() {
    super.onClose();
    disposeListen.call();
    userBalancesWorker.dispose();
    GamingEvent.showGamePlaying.unsubscribe(setPlaying);
    GamingEvent.showNoGamePlaying.unsubscribe(setNoPlaying);
    GamingEvent.loggedOut.unsubscribe(loggedOut);
  }
}
