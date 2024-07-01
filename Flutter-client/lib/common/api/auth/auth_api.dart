import '../base/base_api.dart';

/// * GeeTest4 所需参数 lotNumber, captchaOutput, passToken, genTime
/// * skip GeeTest4 所需参数 challenge, validate, seccode
enum Auth with GoGamingApi {
  ///社交账号统一登录验证
  socialUserLoginLine(data: {
    'clientName': 'App 设备名（web不需要传）',
    'autoLogin': true,
    'userType': 'Google Telegram MetaMask Line',
    'accessToken': 'Line 返回的accessToken',
  }),
  socialUserLoginGoogle(data: {
    'clientName': 'App 设备名（web不需要传）',
    'autoLogin': true,
    'userType': 'Google Telegram MetaMask Line',
    'accessToken': 'Line 返回的accessToken',
  }),
  socialUserLoginTelegram(data: {
    'clientName': 'App 设备名（web不需要传）',
    'autoLogin': true,
    'userType': 'Google Telegram MetaMask Line',
    'accessToken': 'Google 返回的accessToken',
  }),

// /v1/member/auth/socialuserbindloginbymobile
  /// 社交账号绑定平台账号-手机登录
  socialUserBindLoginByMobile(data: {
    "lotNumber": null,
    "captchaOutput": null,
    "passToken": null,
    "genTime": null,
    "challenge": null,
    "validate": null,
    "seccode": null,
    "password": '密码（使用Rsa加密传到服务端）',
    "autoLogin": true,
    "clientName": 'x',
    "mobile": 'x',
    "areaCode": 'x',
    "socialUserType": 'Google Telegram MetaMask Line',
    "socialUserId": "社交账号id",
  }),

  /// 社交账号绑定
  socialUserBind(data: {
    'clientName': 'App 设备名（web不需要传）',
    'autoLogin': true,
    'userType': 'Google Telegram MetaMask Line',
    'accessToken': 'Line 返回的accessToken',
  }),

  /// 社交账号直接注册
  registerBySocial(data: {
    "socialUserType": 'Google Telegram MetaMask Line',
    "socialUserId": "社交账号id",
    "clientName": "App 设备名（web不需要传）"
  }),

  /// 手机登录
  /// password: Encrypt.encodeString 加密后的string
  /// autoLogin: 是否自动登录
  /// clientName：App 设备名=DeviceUtil.getDeviceName()
  /// mobile: 手机号
  /// areaCode：手机号地区
  loginByMobile(data: {
    "lotNumber": null,
    "captchaOutput": null,
    "passToken": null,
    "genTime": null,
    "challenge": null,
    "validate": null,
    "seccode": null,
    "password": 'x',
    "autoLogin": true,
    "clientName": 'x',
    "mobile": 'x',
    "areaCode": 'x'
  }),

  /// 邮箱登录
  /// email: 邮箱
  /// password: Encrypt.encodeString 加密后的string
  loginByEmail(data: {
    "lotNumber": null,
    "captchaOutput": null,
    "passToken": null,
    "genTime": null,
    "email": null,
    "password": null,
    "autoLogin": true,
    "clientName": null,
  }),

  /// 用户名登陆
  /// password: Encrypt.encodeString 加密后的string
  /// autoLogin: 是否自动登录
  /// clientName：App 设备名=DeviceUtil.getDeviceName()
  /// userName：用户名
  loginByName(data: {
    "lotNumber": null,
    "captchaOutput": null,
    "passToken": null,
    "genTime": null,
    "challenge": null,
    "validate": null,
    "seccode": null,
    "password": 'x',
    "autoLogin": true,
    "clientName": 'x',
    "userName": 'x'
  }),

  /// app生物识别登录
  /// token: 生物识别token
  /// clientName：App 设备名=DeviceUtil.getDeviceName()
  loginByBiometric(data: {
    "token": null,
    "clientName": null,
  }),

  /// 登录二次验证，验证2Fa
  /// uniCode*	识别码
  /// areaCode	手机区号（如果选择手机验证)
  /// mobile	手机号（如果选择手机验证)
  /// otpCode	 手机otp（如果选择手机验证)
  /// smsVoice	是否使用语音验证（如果选择手机验证)
  verify2faMobile(data: {
    "uniCode": "string",
    "areaCode": "string",
    "mobile": "string",
    "otpCode": "string",
    "smsVoice": true,
  }),

  /// 登录二次验证，验证2Fa
  verify2faGoogle(data: {
    "uniCode": "string",
    "googleCode": "string",
  }),

  /// 登录二次验证，邮箱验证2Fa
  verify2faEmail(data: {
    "uniCode": "string",
    "emailCode": "string",
    "email": "email",
  }),

  /// 通用2Fa验证
  ///    "verifyAction": "验证行为" VerifyAction
  ///    "areaCode": "手机区号(如果选择手机验证)",
  ///    "mobile" : "手机号(如果选择手机验证)"
  ///    "otpCode": "手机otp（如果选择手机验证)",
  ///    "smsVoice": "是否使用语音验证（如果选择手机验证)"
  general2faVerifyMobile(data: {
    "verifyAction": "x",
    "areaCode": "string",
    "mobile": "string",
    "otpCode": "string",
    "smsVoice": true,
    "googleCode": "string"
  }),

  /// 通用2Fa验证
  ///    "verifyAction": "验证行为" VerifyAction
  ///    "googleCode":"google 验证码（如果选择google验证器）"
  general2faVerifyGoogle(data: {"verifyAction": "x", "googleCode": "string"}),

  /// 通用2Fa验证
  /// "verifyAction": "验证行为" VerifyAction
  /// "email": "邮箱地址（如果选择邮箱验证）",
  /// "emailCode": "邮箱验证码（如果选择邮箱验证）",
  general2faVerifyEmail(data: {
    "verifyAction": "x",
    "email": "邮箱地址（如果选择邮箱验证）",
    "emailCode": "邮箱验证码（如果选择邮箱验证）",
  }),

  /// 用户名密码注册
  /// userName: 用户名
  /// password: Encrypt.encodeString 加密后的string
  /// referrer: 邀请码
  /// clientName：App 设备名=DeviceUtil.getDeviceName()
  /// referrer: 推荐人
  /// aff: MyAffiliate参数
  /// email: 邮箱
  registerByUser(data: {
    "lotNumber": null,
    "captchaOutput": null,
    "passToken": null,
    "genTime": null,
    "challenge": null,
    "validate": null,
    "seccode": null,
    "userName": "string",
    "password": "string",
    "referrer": null,
    "clientName": "string",
    "aff": null,
    "email": null
  }),

  /// 手机注册/找回密码/绑定（修改）手机 时需要传 geetest 人机验证的参数，其他操作不需要 绑定/解绑 谷歌验证器 、绑定（修改）手机、 修改用户名需要用户登陆
  /// otpType: "验证行为"VerifyAction
  /// mobile: 手机号
  /// areaCode：手机号地区
  /// smsVoice	是否使用语音验证（如果选择手机验证)
  requestOtpCode(data: {
    "areaCode": "x",
    "mobile": "x",
    "smsVoice": true,
    "otpType": 'x',
    "lotNumber": null,
    "captchaOutput": null,
    "passToken": null,
    "genTime": null,
    "challenge": null,
    "validate": null,
    "seccode": null,
  }),

  /// 发送邮箱 otp验证
  /// email: 邮箱
  /// otpType: Register:0, Login:1, ResetPwd:2
  sendEmailVerify(data: {
    "lotNumber": null,
    "captchaOutput": null,
    "passToken": null,
    "genTime": null,
    "email": null,
    "otpType": null,
  }),

  /// 手机注册（第二步验证opt完成）
  registerByMobile(data: {
    "clientName": "string",
    "aff": null,
    "email": null,
    "referrer": null,
    'areaCode': "areaCode",
    'mobile': "mobile",
    'otpCode': "otpCode",
    'smsVoice': null,
    'password': "Encrypt.encodeString(password)",
    "socialUserType": null, //Google Telegram MetaMask Line
    "socialUserId": null, // 社交账号id
  }),

  /// 邮箱注册（第二步验证opt完成）
  registerByEmail(data: {
    "email": "string",
    "password": "string",
    "otpCode": "string",
    "referrer": null,
    "clientName": null,
    "aff": null,
  }),

  /// 找回密码验证手机OtpCode （手机找回密码第一步）
  /// otpType: "验证行为"VerifyAction
  resetPwdMobileOtp(data: {
    "areaCode": "x",
    "mobile": "x",
    "smsVoice": true,
    "otpType": 'x',
    "otpCode": "x"
  }),

  ///找回密码验证邮箱OtpCode （邮箱找回密码第一步）
  resetPwdEmailOtp(data: {"email": "x", "emailCode": 'x', "otpType": "x"}),

  /// 重置密码（手机找回密码第二步）
  /// uniCode: 唯一识别码（有效期30分钟）
  /// password: Encrypt.encodeString 加密后的string
  resetPwd(data: {"uniCode": "string", "password": "string"}),

  /// 根据ip定位，获取信息
  getIpInfo(),

  /// * 获取滑块验证码(已废弃 使用getCaptchaId)
  /// * pro环境下使用该api跳过验证码检查'
  getCaptcha(params: {'client': 'native', 'action': "VerifyAction.action"}),
  getCaptchaId(),

  /// 获取api请求token,x: 接口安全设计规范的token
  setup(params: {'s': 'x'}),

  /// 刷新Token 以旧换新
  authRefresh(params: {'token': 'x'});

  const Auth({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Auth.setup:
        return "/api/auth/setup";
      case Auth.authRefresh:
        return "/api/auth/refresh";
      case Auth.loginByMobile:
        return "/member/auth/loginbymobile";
      case Auth.loginByEmail:
        return "/member/auth/loginbyemail";
      case Auth.loginByName:
        return "/member/auth/loginbyname";
      case Auth.loginByBiometric:
        return "/member/auth/loginbybiometric";
      case Auth.verify2faMobile:
      case Auth.verify2faGoogle:
      case Auth.verify2faEmail:
        return "/member/auth/verify2fa";
      case Auth.general2faVerifyMobile:
      case Auth.general2faVerifyGoogle:
      case Auth.general2faVerifyEmail:
        return "/member/auth/general2faverify";
      case Auth.registerByUser:
        return "/member/auth/registerbyuserpwd";
      case Auth.requestOtpCode:
        return "/member/auth/sendmobileverify";
      case Auth.registerByMobile:
        return "/member/auth/registerbymobile";
      case Auth.resetPwdMobileOtp:
        return "/member/auth/resetpwdmobileverify";
      case Auth.resetPwdEmailOtp:
        return "/member/auth/resetpwdemailverify";
      case Auth.resetPwd:
        return '/member/auth/resetpwd';
      case Auth.getIpInfo:
        return '/api/auth/getipinfo';
      case Auth.getCaptcha:
        return '/api/auth/getcaptcha';
      case Auth.getCaptchaId:
        return '/api/auth/getcaptchaid';
      case Auth.socialUserLoginLine:
      case Auth.socialUserLoginGoogle:
      case Auth.socialUserLoginTelegram:
        return '/member/auth/socialuserlogin';
      case Auth.socialUserBindLoginByMobile:
        return '/member/auth/socialuserbindloginbymobile';
      case Auth.registerBySocial:
        return '/member/auth/registerbysocial';
      case Auth.registerByEmail:
        return '/member/auth/registerbyemail';
      case Auth.sendEmailVerify:
        return "/member/auth/sendemailverify";
      case Auth.socialUserBind:
        return '/member/account/memberbindsocialuser';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Auth.setup:
      case Auth.authRefresh:
      case Auth.getIpInfo:
      case Auth.getCaptcha:
      case Auth.getCaptchaId:
        return HTTPMethod.get;
      case Auth.loginByMobile:
      case Auth.loginByName:
      case Auth.verify2faMobile:
      case Auth.verify2faGoogle:
      case Auth.verify2faEmail:
      case Auth.general2faVerifyMobile:
      case Auth.general2faVerifyGoogle:
      case Auth.general2faVerifyEmail:
      case Auth.registerByUser:
      case Auth.requestOtpCode:
      case Auth.registerByMobile:
      case Auth.resetPwdMobileOtp:
      case Auth.resetPwd:
      case Auth.socialUserLoginLine:
      case Auth.socialUserLoginGoogle:
      case Auth.socialUserLoginTelegram:
      case Auth.socialUserBindLoginByMobile:
      case Auth.registerBySocial:
      case Auth.loginByEmail:
      case Auth.registerByEmail:
      case Auth.sendEmailVerify:
      case Auth.socialUserBind:
      case Auth.resetPwdEmailOtp:
      case Auth.loginByBiometric:
        return HTTPMethod.post;
    }
  }

  @override
  bool get needCache {
    switch (this) {
      case Auth.getIpInfo:
        return true;
      default:
        return false;
    }
  }

  // @override
  // int? get connectTimeout {
  //   switch (this) {
  //     case Auth.getIpInfo:
  //     case Auth.authRefresh:
  //       return 20000;
  //     default:
  //       return null;
  //   }
  // }

  @override
  int? get receiveTimeout {
    switch (this) {
      case Auth.getIpInfo:
        return 5000;
      default:
        return super.receiveTimeout;
    }
  }
}
