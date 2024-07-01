// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Account with GoGamingApi {
  /// 获取用户信息
  getUserInfo(),

  /// 获取用户社交账号绑定信息
  getMemberSocialList(),

  /// 社交账号解除绑定
  socialUserUnbind(data: {
    "areaCode": "手机区号",
    "mobile": "手机号",
    "password": "加密后的密码Encrypt.encodeString()",
    "otpCode": "Otp验证码",
    "smsVoice": true,
    "otpType": 'VerifyAction.bindGoogleVerify.value',
    "socialUserId": "第三方账号唯一id",
    "userType": "Google Telegram MetaMask Line",
  }),

  /// 获取谷歌验证器信息
  getGoogleValidCode(),

  /// 绑定谷歌验证器 password: 加密的密码 googleCode：google验证码
  bindGoogleValid(
      data: {'password': 'Encrypt.encodeString()', 'googleCode': 'googleCode'}),

  /// 绑定了手机后绑定谷歌验证器
  /// otpType: VerifyAction.bindGoogleVerify
  /// googleCode：google验证码
  /// smsVoice: 是否使用语音验证码
  /// otpCode: 手机验证码
  bindGoogleValidWithMobile(data: {
    "googleCode": 'x',
    "smsVoice": false,
    "otpType": "BindGoogleVerify",
    "areaCode": 'x',
    'mobile': 'x',
    'otpCode': 'x'
  }),

  /// 解绑谷歌验证
  /// otpType: VerifyAction.bindGoogleVerify
  /// googleCode：google验证码
  /// smsVoice: 是否使用语音验证码
  /// otpCode: 手机验证码
  /// password: 加密的密码
  unbindGoogle(data: {
    "areaCode": "string",
    "mobile": "string",
    "password": "Encrypt.encodeString()",
    "otpCode": "string",
    "smsVoice": true,
    "otpType": 'VerifyAction.bindGoogleVerify.value'
  }),

  /// 绑定手机第一步
  /// password: 加密的密码
  verifyBindMobile(
      data: {"password": "Encrypt.encodeString()", "googleCode": ""}),

  /// 绑定手机
  /// uniCode: verifyBindMobile/modifyBindMobile 返回的数据
  /// otpType：VerifyAction.bindMobile
  bindMobile(data: {
    "areaCode": "string",
    "mobile": "string",
    "otpCode": "string",
    "smsVoice": true,
    "otpType": "Register"
  }),

  /// 修改手机好吗第一步 第二步调用bindMobile
  modifyBindMobile(data: {
    "areaCode": "string",
    "mobile": "string",
    "password": "Encrypt.encodeString()",
    "googleCode": "string",
    "otpCode": "string",
    "otpType": "VerifyAction.bindMobile",
    "smsVoice": true
  }),

  /// 添加/修改用户名第一步
  verifyModifyUsername(data: {"password": "Encrypt.encodeString()"}),

  /// 添加/修改用户名
  /// uniCode：verifyModifyUsername返回数据
  modifyUserName(data: {"uniCode": "string", "userName": "string"}),

  /// 修改密码
  modifyPassword(data: {
    "oldPassword": "Encrypt.encodeString",
    "newPassword": "Encrypt.encodeString"
  }),

  setPassword(data: {"newPassword": "Encrypt.encodeString"}),

  /// 开启或关闭提现白名单
  /// key: 2fa验证-VerifyAction.whiteListSwitch的返回数据
  updateWhiteListStatus(data: {'key': 'x'}),

  /// 检查是否开启了提现白名单
  checkWhiteListStatus(),

  /// 退出登录
  logout(),

  /// 设置默认语言
  setDefaultLanguage(data: {'language': 'x'}),

  /// 修改用户头像 用户头像分为预设头像，上传头像
  /// 1.预设头像命名规则为avatar-1,avatar-2,.....,avatar-100等 在web/h5/app由前端转换成对应的预设头像实际地址
  /// 2.上传头像地址必须是平台指定的上传cdn地址
  /// 例如 https://d16j89jl5zb4v5.cloudfront.net/Games/22/18/18/637884299371516817/img/637884299371516752.png
  modifyAvatar(data: {"avatar": "string"}),

  /// 创建上传路径
  createUploadUrl(data: {
    "type": "x",
    "fileName": "x",
  }),

  /// 设定用户偏好赔率格式
  /// oddsFormat：getUserSetting返回的oddsFormat
  modifyOddsFormat(data: {"oddsFormat": "string"}),

  /// 设定用户偏好视图格式
  /// viewFormat：getUserSetting返回的viewFormat
  modifyViewFormat(data: {"viewFormat": "string"}),

  /// 设置用户偏好默认币种
  setDefaultCurrency(data: {"defaultCurrencyType": "Unknown"}),

  /// 设定用户偏好抵用金
  modifyCredit(data: {"isEnable": true}),

  /// 获取用户偏好设置
  getUserSetting(),

  /// 绑定邮箱第一步
  getEmailVerifyCode(data: {
    "email": "string",
  }),

  /// 绑定邮箱第二步
  bindEmail(data: {
    "uniCode": "string",
    "areaCode": null,
    "mobile": null,
    "otpCode": null,
    "smsVoice": null,
    "otpType": "BindEmail",
    "password": null, //Encrypt.encodeString
    "email": "string",
    "emailCode": "string"
  }),

  /// 解绑邮箱
  unbindEmail(data: {
    "areaCode": "string",
    "mobile": "string",
    "otpCode": "string",
    "otpType": "unbindEmail",
    "smsVoice": false,
    "emailCode": "string"
  });

  const Account({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Account.getUserSetting:
        return '/member/account/getusersetting';
      case Account.checkWhiteListStatus:
        return '/member/account/checkwhiteliststatus';
      case Account.getUserInfo:
        return '/member/account/getuserinfo';
      case Account.getGoogleValidCode:
        return '/member/account/getgooglevalidcode';
      case Account.bindGoogleValid:
      case Account.bindGoogleValidWithMobile:
        return '/member/account/bindgooglevalid';
      case Account.unbindGoogle:
        return '/member/account/unbindgooglevalid';
      case Account.verifyBindMobile:
        return '/member/account/verifybindmobile';
      case Account.bindMobile:
        return '/member/account/bindmobile';
      case Account.modifyBindMobile:
        return '/member/account/modifybindmobile';
      case Account.verifyModifyUsername:
        return '/member/account/verifymodifyusername';
      case Account.modifyUserName:
        return '/member/account/modifyusername';
      case Account.modifyPassword:
        return '/member/account/modifypassword';
      case Account.updateWhiteListStatus:
        return '/member/account/updatewhiteliststatus';
      case Account.logout:
        return '/member/account/logout';
      case Account.modifyAvatar:
        return '/member/account/modifyavatar';
      case Account.modifyOddsFormat:
        return '/member/account/modifyoddsformat';
      case Account.modifyViewFormat:
        return '/member/account/modifyviewformat';
      case Account.setDefaultCurrency:
        return '/member/account/setdefaultcurrency';
      case Account.modifyCredit:
        return '/member/account/modifycredit';
      case Account.createUploadUrl:
        return '/resource/upload/createuploadurl';
      case Account.setPassword:
        return '/member/account/setpassword';
      case Account.getMemberSocialList:
        return '/member/account/getmembersociallist';
      case Account.socialUserUnbind:
        return '/member/account/socialuserunbind';
      case Account.getEmailVerifyCode:
        return '/member/account/getemailverifycode';
      case Account.bindEmail:
        return '/member/account/bindemail';
      case Account.unbindEmail:
        return '/member/account/unbindemail';
      case Account.setDefaultLanguage:
        return '/member/account/setdefaultlanguage';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Account.getUserSetting:
      case Account.checkWhiteListStatus:
      case Account.getUserInfo:
      case Account.getMemberSocialList:
        return HTTPMethod.get;

      case Account.getGoogleValidCode:
      case Account.bindGoogleValid:
      case Account.bindGoogleValidWithMobile:
      case Account.unbindGoogle:
      case Account.verifyBindMobile:
      case Account.bindMobile:
      case Account.modifyBindMobile:
      case Account.verifyModifyUsername:
      case Account.modifyUserName:
      case Account.modifyPassword:
      case Account.updateWhiteListStatus:
      case Account.logout:
      case Account.modifyAvatar:
      case Account.modifyOddsFormat:
      case Account.modifyViewFormat:
      case Account.setDefaultCurrency:
      case Account.modifyCredit:
      case Account.createUploadUrl:
      case Account.setPassword:
      case Account.socialUserUnbind:
      case Account.getEmailVerifyCode:
      case Account.bindEmail:
      case Account.unbindEmail:
      case Account.setDefaultLanguage:
        return HTTPMethod.post;
    }
  }
}
