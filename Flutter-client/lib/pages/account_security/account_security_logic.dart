import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/account/models/member_social_list.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/biometric_service.dart';
import 'package:gogaming_app/common/service/oauth_service/oauth_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/api/account/account_api.dart';
import '../../common/api/auth/models/verify_action.dart';
import '../../common/service/event_service.dart';
import '../../common/service/kyc_service.dart';
import '../../common/service/secure_service.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../base/base_controller.dart';

class AccountSecurityLogic extends BaseController {
  final openBiometric = false.obs;
  final openWhiteList = false.obs;
  final isMobileBind = false.obs;
  final isGoogleBind = false.obs;
  final isEmailBind = false.obs;
  final mobileNumber = ''.obs;
  final emailNumber = ''.obs;
  final hasPassword = false.obs;
  final socialList = MemberSocialList().obs;
  int? get lastLoginTime => AccountService.sharedInstance.lastLoginTime;
  bool get isPrimaryPassed => KycService.sharedInstance.primaryPassed;
  bool get isIntermediatePassed => KycService.sharedInstance.intermediatePassed;
  bool get isAdvancePassed => KycService.sharedInstance.advancePassed;

  final userName =
      (AccountService.sharedInstance.gamingUser?.userName ?? '').obs;

  bool get isPassed =>
      (isPrimaryPassed || isIntermediatePassed || isAdvancePassed);
  final locale = AppLocalizations.of(Get.context!).locale;
  late Function disposeListen;

  @override
  void onClose() {
    super.onClose();
    disposeListen.call();
    GamingEvent.bindGoogleSuccess.unsubscribe(_loadGoogleBind);
    GamingEvent.unBindGoogleSuccess.unsubscribe(_loadGoogleBind);

    GamingEvent.bindEmailSuccess.unsubscribe(_loadEmailBind);
    GamingEvent.unBindEmailSuccess.unsubscribe(_loadEmailBind);

    GamingEvent.bindMobileSuccess.unsubscribe(_loadMobileBind);
    GamingEvent.modifyMobileSuccess.unsubscribe(_loadMobileBind);
    GamingEvent.setPasswordSuccess.unsubscribe(_loadHasPassword);
    GamingEvent.openBiometric.unsubscribe(_checkOpenBiometric);
  }

  @override
  void onInit() {
    _loadGoogleBind();
    _loadEmailBind();
    _loadMobileBind();
    _loadWhiteList();
    _loadHasPassword();
    _checkOpenBiometric();

    GamingEvent.bindGoogleSuccess.subscribe(_loadGoogleBind);
    GamingEvent.unBindGoogleSuccess.subscribe(_loadGoogleBind);
    GamingEvent.bindEmailSuccess.subscribe(_loadEmailBind);
    GamingEvent.unBindEmailSuccess.subscribe(_loadEmailBind);
    GamingEvent.bindMobileSuccess.subscribe(_loadMobileBind);
    GamingEvent.modifyMobileSuccess.subscribe(_loadMobileBind);
    GamingEvent.setPasswordSuccess.subscribe(_loadHasPassword);
    GamingEvent.openBiometric.subscribe(_checkOpenBiometric);

    disposeListen = AccountService.sharedInstance.cacheUser.getBox!()
        .listenKey(AccountService.sharedInstance.cacheUser.key, (value) {
      userName.value = AccountService.sharedInstance.gamingUser?.userName ?? '';
    });
    super.onInit();
  }

  void onVisibilityGained() {
    _loadSocialList();
  }

  void _loadWhiteList() {
    openWhiteList.value =
        AccountService.sharedInstance.gamingUser?.hasWhiteList ?? false;
  }

  void _checkOpenBiometric() {
    BiometricService.sharedInstance.getAvailableBiometrics().then((value) {
      final key = BiometricService.sharedInstance.getKey();
      openBiometric.value = BiometricService.sharedInstance.hardwareSupport &&
          (key?.isNotEmpty ?? false);
    });
  }

  void _loadMobileBind() {
    isMobileBind.value =
        AccountService.sharedInstance.gamingUser?.isBindMobile ?? false;
    if (isMobileBind.value) {
      mobileNumber.value =
          "${AccountService.sharedInstance.gamingUser?.areaCode ?? ""} ${AccountService.sharedInstance.gamingUser?.mobile ?? ""}";
    }
  }

  void _loadGoogleBind() {
    isGoogleBind.value =
        AccountService.sharedInstance.gamingUser?.isBindGoogleValid ?? false;
  }

  void _loadEmailBind() {
    isEmailBind.value =
        AccountService.sharedInstance.gamingUser?.isBindEmail ?? false;
    if (isEmailBind.value) {
      emailNumber.value = AccountService.sharedInstance.gamingUser?.email ?? '';
    }
  }

  // 邮箱加密
  String getEncryptEmail() {
    String email = emailNumber.value;
    if (email.contains('@')) {
      String email1 = email.split('@')[0];
      String email2 = email.split('@')[1];
      String email1Star = '';
      if (email1.length > 2) {
        email1Star = email1.substring(0, 2);
        for (int i = 2; i < email1.length; i++) {
          email1Star += '*';
        }
      } else {
        email1Star = email1;
      }
      return '$email1Star@$email2';
    } else {
      return email;
    }
  }

  void _loadHasPassword() {
    hasPassword.value =
        AccountService.sharedInstance.gamingUser?.hasPassword ?? false;
  }

  void _loadSocialList() {
    PGSpi(Account.getMemberSocialList.toTarget())
        .rxRequest<MemberSocialList?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return MemberSocialList.fromJson(data);
      } else {
        return null;
      }
    }).listen((event) {
      if (event.data != null) {
        socialList(event.data);
        addSocialInfoIfMissing();
      }
    }, onError: (Object error) {
      if (error is GoGamingResponse) {
        Toast.showFailed(error.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  void addSocialInfoIfMissing() {
    bool foundGoogle = false;
    bool foundLine = false;
    if (socialList.value.socialInfoList != null) {
      for (final socialInfo in socialList.value.socialInfoList!) {
        if (socialInfo.socialUserType == SocialType.google.name) {
          foundGoogle = true;
        }

        if (socialInfo.socialUserType == SocialType.line.name) {
          foundLine = true;
        }
      }
    }
    if (!foundGoogle) {
      final newGoogleSocialInfo = SocialInfoList(
        socialUserId: null,
        socialUserName: null,
        socialUserType: SocialType.google.name,
      );
      socialList.value.socialInfoList ??= [];
      socialList.value.socialInfoList!.insert(0, newGoogleSocialInfo);
    }

    if (!foundLine) {
      final newLineSocialInfo = SocialInfoList(
        socialUserId: null,
        socialUserName: null,
        socialUserType: SocialType.line.name,
      );
      socialList.value.socialInfoList ??= [];
      socialList.value.socialInfoList!.add(newLineSocialInfo);
    }
  }

  void unBindSocial(SocialInfoList socialInfo) {
    // 绑定手机去解绑页面
    if (isMobileBind.value) {
      if (hasPassword.value == false) {
        // 未绑定手机去绑定
        final content = localized('not_password');
        final dialog = DialogUtil(
          context: Get.overlayContext!,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          content: content,
          rightBtnName: localized('sure'),
          leftBtnName: localized('cancels'),
          onRightBtnPressed: () {
            setPassword();
          },
          onLeftBtnPressed: () {
            Get.back<dynamic>();
          },
        );
        dialog.showNoticeDialogWithTwoButtons();
        return;
      }

      final content =
          localized('not_ava_social', params: ["${socialInfo.socialUserType}"]);
      final title =
          localized('dis_social', params: ["${socialInfo.socialUserType}"]);
      final dialog = DialogUtil(
        context: Get.overlayContext!,
        iconPath: R.commonDialogErrorBig,
        iconWidth: 80.dp,
        iconHeight: 80.dp,
        content: content,
        title: title,
        onRightBtnPressed: () {
          Get.back<dynamic>();
          Get.toNamed<dynamic>(
            Routes.unbindSocial.route,
            arguments: {"socialInfo": socialInfo},
          );
        },
      );
      dialog.showNoticeDialogWithTwoButtons();
    } else {
      // 未绑定手机去绑定
      final content = localized('acc_not_bind_phone');
      final dialog = DialogUtil(
        context: Get.overlayContext!,
        iconPath: R.commonDialogErrorBig,
        iconWidth: 80.dp,
        iconHeight: 80.dp,
        content: content,
        rightBtnName: localized('binding_button'),
        leftBtnName: localized('cancels'),
        onRightBtnPressed: () {
          Get.back<dynamic>();
          bindMobile();
        },
        onLeftBtnPressed: () {
          Get.back<dynamic>();
        },
      );
      dialog.showNoticeDialogWithTwoButtons();
    }
  }

  void bindSocial(SocialInfoList socialInfo) {
    final content =
        localized('ava_social', params: ["${socialInfo.socialUserType}"]);
    final title =
        localized('bind_social', params: ["${socialInfo.socialUserType}"]);
    if (socialInfo.socialUserType == SocialType.mateMask.name ||
        socialInfo.socialUserType == SocialType.telegram.name) {
      Toast.showFailed(localized('please_go_to_web_h5_to_operate'));
      return;
    }
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      content: content,
      title: title,
      onRightBtnPressed: () {
        Get.back<dynamic>();
        if (socialInfo.socialUserType == SocialType.google.name) {
          onSocialBind(OAuth.google);
        } else if (socialInfo.socialUserType == SocialType.line.name) {
          onSocialBind(OAuth.line);
        }
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  // 绑定社交媒体
  void onSocialBind(OAuth auth) {
    auth.onSocialBind(
      Get.overlayContext!,
      (bindResult) {
        if (bindResult != null && bindResult.success) {
          _loadSocialList();
        }
      },
    );
  }

  void bindMobile() {
    Get.toNamed<dynamic>(Routes.bindMobile.route);
  }

  void changeMobile() {
    Get.toNamed<dynamic>(Routes.modifyMobile.route);
  }

  // 绑定谷歌
  void bindGoogle() {
    Get.toNamed<dynamic>(Routes.bindGoogle.route);
  }

  // 解绑谷歌
  void unBindGoogle() {
    final title = localized('un_google');
    final content = localized('open_act');
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: title,
      content: content,
      titleSize: GGFontSize.bigTitle20,
      rightBtnName: localized('confirm_button'),
      leftBtnName: localized('cancels'),
      onRightBtnPressed: () {
        Get.back<dynamic>();
        Get.toNamed<dynamic>(Routes.unbindGoogle.route);
      },
      onLeftBtnPressed: () {
        Get.back<dynamic>();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  // 绑定邮箱
  void bindEmail() {
    Get.toNamed<dynamic>(Routes.bindEmail.route);
  }

  // 解绑邮箱
  void unBindEmail() {
    // 先判断如果已经绑定手机号就直接解绑。否则就提示先绑定手机号
    if (isMobileBind.value) {
      Get.toNamed<dynamic>(Routes.unbindEmail.route);
    } else {
      final content = localized('un_bind_email_tip');
      final dialog = DialogUtil(
        context: Get.overlayContext!,
        iconPath: R.commonDialogErrorBig,
        iconWidth: 80.dp,
        iconHeight: 80.dp,
        content: content,
        title: localized('safe_hints'),
        rightBtnName: localized('binding'),
        onRightBtnPressed: () {
          Get.back<dynamic>();
          bindMobile();
        },
        onLeftBtnPressed: () {
          Get.back<dynamic>();
        },
      );
      dialog.showNoticeDialogWithTwoButtons();
    }
  }

  void changeWhiteListStatus() {
    final title =
        openWhiteList.value ? localized("sure_close") : localized('sure_turn');
    final content = openWhiteList.value
        ? localized("close_func_info")
        : localized('only_ws');
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: title,
      content: content,
      titleSize: GGFontSize.bigTitle20,
      rightBtnName: localized('confirm_button'),
      leftBtnName: localized('cancels'),
      onRightBtnPressed: () {
        Get.back<dynamic>();
        if (SecureService.sharedInstance.checkSecure()) {
          Get.offNamed<dynamic>(Routes.secure.route, arguments: {
            'otpType': VerifyAction.whiteListSwitch,
            'on2FaSuccess': (String code) {
              _changeWhiteListStatus(code);
            },
          });
        }
      },
      onLeftBtnPressed: () {
        Get.back<dynamic>();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  void _changeWhiteListStatus(String key) {
    SmartDialog.showLoading<void>();
    Map<String, dynamic> req = {
      'key': key,
    };
    PGSpi(Account.updateWhiteListStatus.toTarget(
      inputData: req,
    )).rxRequest<bool>((value) {
      if ((value.isNotEmpty) && value['success'] == true) {
        return true;
      }
      return false;
    }).doOnData((event) {
      SmartDialog.dismiss<void>();
      AccountService().updateGamingUserInfo().listen((value) {
        _loadWhiteList();
        GamingEvent.updateWhiteListSwitch.notify();
      });
    }).doOnError((error, p1) {
      SmartDialog.dismiss<void>();
      if (error is GoGamingResponse) {
        Toast.showFailed(error.message);
      } else {
        Toast.showTryLater();
      }
    }).listen((event) {});
  }

  void adressManager() {
    Get.toNamed<dynamic>(Routes.cryptoAddressList.route);
  }

  void changePassword() {
    Get.toNamed<dynamic>(Routes.modifyPassword.route);
  }

  void setPassword() {
    Get.toNamed<dynamic>(Routes.setPassword.route);
  }

  void verification() {
    Get.toNamed<dynamic>(Routes.kycHome.route);
  }

  void changeUserName() {
    Get.toNamed<dynamic>(Routes.modifyUserName.route);
  }
}
