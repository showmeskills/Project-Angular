import 'dart:async';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/auth/models/gaming_login_model.dart';
import 'package:gogaming_app/common/components/extensions/gg_reg_exp.dart';
import 'package:gogaming_app/common/tools/geetest.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/api/auth/auth_api.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:gogaming_app/controller_header.dart';

/// 邮箱验证码状态
enum EmailVerificationStatus {
  unSend, // 未发送
  send, // 已发送
  reSend, // 重新发送
}

/// 邮箱验证码组件
class EmailVerificationCodeWidget extends StatefulWidget {
  const EmailVerificationCodeWidget(
    this.emailOptController,
    this.action, {
    super.key,
    this.fullEmail,
    this.fullEmailController,
    this.userInfo,
    this.onStatusChanged,
    this.resData,
    this.showNoReceiveEmail = true,
  });

  /// 邮箱验证码的controller
  final GamingTextFieldController emailOptController;
  final VerifyAction action;

  /// 依赖外部随便变动(手动输入)的controller
  final GamingTextFieldController? fullEmailController;

  /// 针对外部外部传入完整邮箱号(例如登录成功之后的安全认证)
  final RxString? fullEmail;

  /// 外部可传入userInfo,针对（例如登录成功之后的安全认证，去单例里面获取不到。就传入）
  final GamingLoginModel? userInfo;

  final void Function(EmailVerificationStatus value)? onStatusChanged;

  /// 绑定邮箱的时候的接口不同。需要返回data
  final void Function(String data)? resData;

  /// 是否显示未收到邮箱
  final bool? showNoReceiveEmail;

  @override
  // ignore: library_private_types_in_public_api
  _EmailVerificationCodeWidgetState createState() {
    return _EmailVerificationCodeWidgetState();
  }
}

class _EmailVerificationCodeWidgetState
    extends State<EmailVerificationCodeWidget> {
  EmailVerificationStatus phoneCodeState =
      EmailVerificationStatus.unSend; // 邮箱验证码状态
  Timer? timer; // 计时器
  int secondLeft = 90; // 倒计时时间
  GamingUserModel? user; // 用户信息
  String? fullEmailNo = ''; // 完整邮箱号
  bool isLoading = false; // 是否正在加载
  bool showNoReceive = false; // 是否显示未收到邮箱

  @override
  void initState() {
    super.initState();
    if (widget.userInfo == null) {
      user = AccountService.sharedInstance.gamingUser;
    }
    getFullEmail();
  }

  /// 获取完整邮箱号
  void getFullEmail() {
    fullEmailNo = GGUtil.parseStr(widget.fullEmail?.value).isNotEmpty
        ? GGUtil.parseStr(widget.fullEmail?.value)
        : GGUtil.parseStr(widget.fullEmailController?.text.value).isNotEmpty
            ? GGUtil.parseStr(widget.fullEmailController?.text.value)
            : GGUtil.parseStr(user?.email).isNotEmpty
                ? GGUtil.parseStr(user?.email)
                : GGUtil.parseStr(widget.userInfo?.email).isNotEmpty
                    ? GGUtil.parseStr(widget.userInfo?.email)
                    : '';

    widget.fullEmail?.value = fullEmailNo ?? '';
  }

  // 邮箱加密
  String _getEncryptEmail() {
    String email = fullEmailNo ?? '';
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

  @override
  void dispose() {
    _stopTimer();
    super.dispose();
  }

  /// 开始计时器
  void _startTimer() {
    timer = Timer.periodic(const Duration(seconds: 1), (object) {
      if (secondLeft > 0) {
        secondLeft -= 1;
      } else {
        timer?.cancel();
        secondLeft = 90;
        phoneCodeState = EmailVerificationStatus.reSend;
        widget.onStatusChanged?.call(phoneCodeState);
      }
      _refresh();
    });
  }

  /// 发送邮件验证码
  void _sendEmailCheck() {
    getFullEmail();
    if (GGRegExp.emailRule.hasMatch(fullEmailNo ?? '')) {
      _reqOtpCode();
    } else {
      Toast.showFailed(localized('email_err'));
    }
  }

  /// 停止计时器
  void _stopTimer() {
    if (timer != null) {
      timer!.cancel();
      timer = null;
    }
  }

  /// 刷新页面
  void _refresh() {
    setState(() {});
  }

  /// 最终请求验证码的接口，通用
  Future<bool> reqOtpCodeFinal(Map<String, dynamic> geetestData) async {
    isLoading = true;
    _refresh();

    Map<String, dynamic> reqParams = {
      "email": fullEmailNo,
      "otpType": GGUtil.parseStr(widget.action.value),
    };
    reqParams.addAll(geetestData);

    debugPrint('sendEmailVerify reqParams = $reqParams');

    PGSpi(Auth.sendEmailVerify.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return value;
    }).listen(
      (event) {
        isLoading = false;
        if (event.success == true) {
          phoneCodeState = EmailVerificationStatus.send;
          widget.onStatusChanged?.call(phoneCodeState);
          _startTimer();
          Toast.show(
              context: Get.overlayContext!,
              state: GgToastState.success,
              title: localized('completed'),
              message: localized("send_email_success"));
        }
        _refresh();
      },
      onError: (Object e) {
        //获取失败
        isLoading = false;
        _refresh();
        debugPrint('error：$e');
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: e.toString());
      },
    );
    return true;
  }

  /// 绑定邮箱 第一步
  void verifyBindEmail() {
    Map<String, dynamic> reqParams = {
      "email": fullEmailNo,
    };

    PGSpi(Account.getEmailVerifyCode.toTarget(inputData: reqParams))
        .rxRequest<String>((value) {
      if ((value.isNotEmpty) && value['success'] == true) {
        return value['data'].toString();
      }
      return '';
    }).listen((event) {
      isLoading = false;
      if (event.success) {
        widget.resData?.call(event.data);
        phoneCodeState = EmailVerificationStatus.send;
        widget.onStatusChanged?.call(phoneCodeState);
        _startTimer();
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.success,
            title: localized('completed'),
            message: localized("send_email_success"));
        _refresh();
      } else {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            contentMaxLines: 7,
            message: event.message.toString());
      }
    }).onError((Object error) {
      //获取失败
      isLoading = false;
      _refresh();
      Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          contentMaxLines: 7,
          message: error.toString());
    });
  }

  Future<void> _reqOtpCode() async {
    GeeTest.getCaptcha(widget.action).doOnData((value) {
      if (value != null) {
        if (widget.action == VerifyAction.bindEmail) {
          verifyBindEmail();
        } else {
          reqOtpCodeFinal(value).asStream();
        }
      }
    }).listen((event) {
      debugPrint('return $event');
      showNoReceive = true;
    }, onError: (Object err) {
      showNoReceive = true;
      //获取失败
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('failed'),
        message: err.toString(),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return _buildBody();
  }

  Widget _buildBody() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildCodeTF(),
        Text(
            widget.fullEmailController == null
                ? '${localized('enter_email')} ${_getEncryptEmail()} ${localized('received_verification_code')}'
                : localized('verification_error_msg'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.hint,
              fontWeight: GGFontWeigh.regular,
            )),
        _buildCantGetCode(),
      ],
    );
  }

  Widget _buildCodeTF() {
    return CheckPhoneTextField(
      controller: widget.emailOptController,
      fillColor: GGColors.transparent,
      contentPadding: EdgeInsets.all(16.dp).copyWith(right: 0),
      scrollPadding: EdgeInsets.all(16.dp).copyWith(right: 0),
      checkPhoneSendWidget: _getCheckPhoneSendWidget(),
    );
  }

  Widget _getCheckPhoneSendWidget() {
    switch (phoneCodeState) {
      case EmailVerificationStatus.unSend:
        return GGButton(
          onPressed: _sendEmailCheck,
          textColor: GGColors.brand.color,
          backgroundColor: Colors.transparent,
          textStyle: GGTextStyle(
              fontSize: GGFontSize.content, fontWeight: GGFontWeigh.regular),
          enable: true,
          isLoading: isLoading,
          text: localized('get_verification_code_button'),
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
        );

      case EmailVerificationStatus.reSend:
        return GGButton(
          onPressed: _sendEmailCheck,
          textColor: GGColors.brand.color,
          backgroundColor: Colors.transparent,
          textStyle: GGTextStyle(
              fontSize: GGFontSize.content, fontWeight: GGFontWeigh.regular),
          enable: true,
          isLoading: isLoading,
          text: localized('resend'),
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
        );
      case EmailVerificationStatus.send:
        return Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
          child: Text(
            secondLeft.toString() + localized('resend_info_app'),
            style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.regular),
          ),
        );
    }
  }

  /// 无法收到验证码
  Widget _buildCantGetCode() {
    return Visibility(
      visible: showNoReceive && GGUtil.parseBool(widget.showNoReceiveEmail),
      child: Column(
        children: [
          if (phoneCodeState != EmailVerificationStatus.unSend) Gaps.vGap8,
          Row(
            children: [
              GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () async {
                  DialogUtil(
                      context: Get.context!,
                      iconHeight: 80.dp,
                      iconWidth: 70.dp,
                      contentMaxLine: 8,
                      contentAlign: TextAlign.start,
                      iconPath: R.iconNoEmailCode,
                      title: localized('email_ver_code_no_receive'),
                      leftBtnName: '',
                      content:
                          '${localized('email_ver_code00')}:\n1.${localized('email_ver_code01')}\n2.${localized('email_ver_code02', params: [
                            "$fullEmailNo"
                          ])}\n3.${localized('email_ver_code03')}',
                      onRightBtnPressed: () {
                        Get.back<dynamic>();
                      }).showNoticeDialogWithTwoButtons();
                },
                child: Text(
                  '${localized('cannt_receive_verification_code')}?',
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    fontWeight: GGFontWeigh.regular,
                    color: GGColors.link.color,
                  ),
                ),
              ),
              Gaps.hGap2,
            ],
          ),
        ],
      ),
    );
  }
}
