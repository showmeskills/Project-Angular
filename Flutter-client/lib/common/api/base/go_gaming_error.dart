enum GoGamingError {
  /// token验证失败或人机验证失败，需要重新生成token
  tokenExpire("401"),

  /// token 验证失败，用户已退出登录或者用户权限不足
  userTokenExpire("403"),
  tokenInvalid("1001"),

  paramsError("1002"),

  /// 程序异常 服务器错误
  server("500"),

  /// 账号被管理员踢出
  kickOutByAdmin("1999"),

  /// 账户已经注册
  accountExist("2003"),

  /// 手机已经注册
  mobileExist("2007"),

  /// 邀请码错误
  inviterError("2009"),

  /// 账号已锁定
  accountLocked("2012"),

  /// 账号已禁用
  accountForbidden("2013"),

  /// 密码错误
  passwordError("2020"),

  /// 本机的指纹或者面容已经被其他账号删除
  biometricBeDeleted("2131"),

  /// 用户手机号已绑定或者跟原来相同
  mobileIsBind("2027"),

  /// sendmobileverify 验证失败并退出登录
  optLogout("2030"),

  /// kyc 验证等级不符合
  kycLevelError("2050"),

  /// kyc 验证地区不符合
  kycCountryError("2052"),

  /// kyc 补充材料
  kycDocumentError("2060"),

  /// 存款超出限额/EDD 尚未完成
  limitExceeded("2061"),

  /// 存款超出自我限制
  limitSelfExceeded("2124"),

  /// EDD审核中
  eddInReview("2062"),

  /// KYC审核中
  kycInReview("2063"),

  /// 没有可用的支付方式
  paymentChannelEmpty("2072"),

  /// 该交易Id的申诉已经存在
  txIdExist("2082"),

  /// 请求异常，详细看返回message
  fail("400"),

  jsonParse("999"),

  unknown("-1");

  const GoGamingError(this.code);

  final String code;

  factory GoGamingError.c(String x) {
    return GoGamingError.values
        .firstWhere((element) => element.code == x, orElse: () => unknown);
  }
}
