import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/components/extensions/gg_reg_exp.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/country_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/helper/encrypt.dart';
import 'package:gogaming_app/models/gaming_google_info.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:gogaming_app/widget_header.dart';

part 'gaming_bind_email_state.dart';

class GamingBindEmailLogic extends BaseController
    with StateMixin<GamingBindEmailState> {
  @override
  final GamingBindEmailState state = GamingBindEmailState();

  @override
  void onInit() {
    super.onInit();

    state.userModel = AccountService.sharedInstance.gamingUser;

    state.isBindMobile.value =
        AccountService.sharedInstance.gamingUser?.isBindMobile ?? false;
    state.passwordController = GamingTextFieldController();

    state.mobileOpt = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {});

    state.emailVerifyController = GamingTextFieldController(validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^\d{6}$'),
      ),
    ])
      ..textController.addListener(() {});

    state.emailController = GamingTextFieldController(
      obscureText: false,
      validator: [
        GamingTextFieldValidator(
          reg: GGRegExp.emailRule,
          errorHint: localized('email_err'),
        ),
      ],
    );
    state.emailController.textController.text = state.userModel?.email ?? '';
  }

  @override
  void onReady() {
    super.onReady();

    state.emailController.textController.addListener(() {
      checkParams();
    });

    state.emailVerifyController.textController.addListener(() {
      checkParams();
    });
    state.mobileOpt.textController.addListener(() {
      checkParams();
    });
    state.passwordController.textController.addListener(() {
      checkParams();
    });
  }

  void checkParams() {
    bool emailPass =
        state.emailController.isPass && state.emailVerifyController.isPass;
    bool safePass = state.isBindMobile.value
        ? state.mobileOpt.isPass
        : state.passwordController.text.isNotEmpty;
    state.submitButtonEnable.value = emailPass && safePass;
  }

  /// 第二步：绑定邮箱
  void bindEmailSecond() {
    Map<String, dynamic> reqParams = {
      "uniCode": state.unicode.value,
      "otpType": VerifyAction.bindEmail.value,
      "email": state.emailController.text.value,
      "emailCode": state.emailVerifyController.text.value,
    };
    if (state.userModel != null && state.userModel!.isBindMobile == true) {
      // 已经绑定手机号的情况下
      reqParams['mobile'] = GGUtil.parseStr(state.fullMobileNo?.value);
      reqParams['areaCode'] = GGUtil.parseStr(state.userModel?.areaCode);
      reqParams['otpCode'] = GGUtil.parseStr(
        state.mobileOpt.text.value,
      );
      reqParams['smsVoice'] = GGUtil.parseBool(state.smsVoice.value);
    } else {
      reqParams['password'] =
          Encrypt.encodeString(state.passwordController.text.value);
    }
    PGSpi(Account.bindEmail.toTarget(inputData: reqParams))
        .rxRequest<void>((value) {})
        .listen((event) {
      if (event.success) {
        /// 密码验证成功进行第二步
        state.curIndex.value = 2;
        AccountService().updateGamingUserInfo().listen((value) {
          GamingEvent.bindEmailSuccess.notify();
        });
      } else {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
      }
    }).onError((Object error) {
      if (error is GoGamingResponse) {
        if (error.code == '2120') {
          emailOccupied(GGUtil.parseStr(error.message));
          return;
        }
      }
      Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: error.toString());
    });
  }

  // 邮箱被占用
  void emailOccupied(String message) {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('hint'),
      content: message,
      contentMaxLine: 3,
      leftBtnName: '',
      rightBtnName: localized('off_button'),
      onRightBtnPressed: () {
        Get.back<void>();
      },
    ).showNoticeDialogWithTwoButtons();
  }

  /// 发送验证码状态变更
  void onVerificationStatusChanged(MobilePhoneVerificationStatus value) {
    state.verificationStatus = value;
  }

  /// 获取第一步的结果
  void onGetVerifyEmail(String value) {
    state.unicode.value = value;
    debugPrint('success event = $value');
  }
}
