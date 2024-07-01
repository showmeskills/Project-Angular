// ignore_for_file: unused_element

import '../base/base_api.dart';

enum AuthenticateEuFormType {
  riskAssessment('RiskAssessment'),
  wealthSource('WealthSource'),
  fullAudit('FullAudit'),
  id('ID'),
  poa('POA'),
  paymentMethod('PaymentMethod'),
  wealthSourceDocument('WealthSourceDocument'),
  edd('EDD'),
  kycIntermediate('KycIntermediate'),
  kycAdvanced('KycAdvanced'),
  customize('Customize');

  const AuthenticateEuFormType(this.value);
  final String value;

  factory AuthenticateEuFormType.fromValue(String value) {
    return AuthenticateEuFormType.values.firstWhere((e) => e.value == value);
  }
}

enum Kyc with GoGamingApi {
  /// 初级认证
  primary(data: {
    "areaCode": null, //手机区号 已绑定手机则不带,
    "mobile": null, //手机号 已绑定手机则不带,
    "fullName": null, // 全名，如果输入的是姓和名则可空
    "firstName": null,
    "middleName": null,
    "lastName": null,
    "countryCode": "国家代码",
    "idCardNumber": null,
    "otpCode": null, //otp码,已绑定手机则不带,
    "smsVoice": null, //是否语音验证,已绑定手机则不带,
    "otpType": null, //类型,
    "dob": null, //出生日期,非中国地区需要
    "email": null, //"邮箱地址",
    "address": null, //"地址",
    "city": null, //"城市",
    "zipCode": null, //"邮编代码",
    "iovationBlackbox": null, //iovationBlackbox
  }),

  /// 外国初级认证
  primaryForEU(data: {
    "areaCode": null, //手机区号 已绑定手机则不带,
    "mobile": null, //手机号 已绑定手机则不带,
    "fullName": null, // 全名，如果输入的是姓和名则可空
    "firstName": null,
    "lastName": null,
    "countryCode": "国家代码",
    "otpCode": null, //otp码,已绑定手机则不带,
    "smsVoice": null, //是否语音验证,已绑定手机则不带,
    "otpType": null, //类型,
    "dob": null, //出生日期,非中国地区需要
    "email": null, //"邮箱地址",
    "address": null, //"地址",
    "city": null, //"城市",
    "zipCode": null, //"邮编代码",
    "iovationBlackbox": null, //iovationBlackbox
  }),

  /// 查询用户KYC限额
  memberKycLimit(),

  /// 取得KYC相关设定
  getKycSettings(),

  /// 发送验证码
  sendSms(params: {
    'phone': "x",
  }),

  /// 验证验证码
  verifySms(data: {
    "phone": "x",
    "smsCode": "x",
  }),

  /// KYC 中级国内认证
  intermediate(data: {
    "fullName": "x", "idcard": "x", "bankcard": "x", "mobile": "x",
    "iovationBlackbox": null, //iovationBlackbox
  }),

  /// KYC 中级国外认证
  globalIntermediate(data: {
    "countryCode": "x",
    "fullName": null,
    "firstName": null,
    "lastName": null,
    "idType": "x",
    "frontsideImage": null,
    "backsideImage": null,
    "iovationBlackbox": null, //iovationBlackbox
  }),

  /// kyc 中级认证 ID 认证
  intermediateidcardforeu(data: {
    "firstName": null,
    "lastName": null,
    "address": null,
    "frontsideImage": null,
    "country": null,
    "idType": null,
    "dob": null,
    "originalFileName": null,
    "iovationBlackbox": null, //iovationBlackbox
  }),

  /// kyc 中级认证 POA
  intermediatepoaforeu(data: {
    "address": null,
    "city": null,
    "postalCode": null,
    "clientKey": null,
    "country": null,
    "uid": null,
    "networkImgeUrl": null,
    "originalFileName": null,
    "iovationBlackbox": null, //iovationBlackbox
  }),

  kycAdvanced(data: {
    "countryCode": "x",
    "postalCode": "x",
    "city": "x",
    "address": "x",
    "networkImgeUrl": "x",
    "iovationBlackbox": null, //iovationBlackbox
  }),

  /// kyc 创建上传路径
  createUploadUrl(data: {
    "type": "x",
    "fileName": "x",
  }),

  /// 查询jumio支持的验证类型
  kycCountry(params: {"countryCode": "x"}),

  /// 获取用户基本信息
  getMemberBasicInfo(),

  /// 获取KYC信息 email address city zipCode等
  kycMemberInfo(),

  /// 获取活体验证连接
  getLiveCheckConnect(data: {
    "locale": "x",
  }),

  /// kyc审核详情EU
  processDetailForEu(data: {
    "kycTpye": null, //0初级 1中级 2高级
  }),

  /// 查询Kyc状态
  requestKyc(),

  /// KYC用户查询认证EU
  queryUserVerificationForEU(),

  /// 获取用户待完成的认证
  queryAuthenticateForEu(),

  /// 获取用户上传的文档(补充证明)
  getRequestDocument(),

  /// 欧洲高级认证
  kycAdvancedForEu(data: {
    'moneySources': <String>[],
    'salaryImages': null,
    'selfEmployedIncomeImages': null,
    'savingsImages': null,
    'allowanceImages': null,
    'pensionImages': null,
    'dividendsProfitFromCompanyImages': null,
    'daytradingImages': null,
    'gamblingImages': null,
    'passiveIncomeImages': null,
    'loansMortgagesImages': null,
    'saleOfFinancialAssetsImages': null,
    'salesOfRealEstateOrOtherAssetsImages': null,
    'inheritanceImages': null,
    'donationsImages': null,
    'cryptoMiningImages': null,
    "iovationBlackbox": null, //iovationBlackbox
  }),

  /// 缓存用户初级 kyc 信息(临时保存)
  cachePrimaryInfo(data: {
    "countryCode": null,
    "fullName": null,
    "firstName": null,
    "lastName": null,
    "middleName": null,
    "idCardNumber": null,
    "dob": null,
    "address": null,
    "city": null,
    "zipCode": null,
    "email": null,
    "areaCode": null,
    "mobile": null,
  }),

  /// 获取用户初级 kyc 信息(临时保存)
  getPrimaryCacheInfo(),

  /// 获取kyc状态
  kycStatus();

  const Kyc({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Kyc.requestKyc:
        return '/member/kyc/kyc';
      case Kyc.memberKycLimit:
        return '/member/kyc/memberkyclimit';
      case Kyc.getKycSettings:
        return '/member/kyc/getkycsettings';
      case Kyc.primary:
        return '/member/kyc/primary';
      case Kyc.primaryForEU:
        return '/member/kyc/primaryforeu';
      case Kyc.sendSms:
        return '/member/kyc/sendsms';
      case Kyc.verifySms:
        return '/member/kyc/verifysms';
      case Kyc.intermediate:
        return '/member/kyc/intermediate';
      case Kyc.kycCountry:
        return '/member/kyc/country';
      case Kyc.globalIntermediate:
        return '/member/kyc/globalintermediate';
      case Kyc.createUploadUrl:
        return '/resource/upload/createuploadurl';
      case Kyc.kycAdvanced:
        return '/member/kyc/advanced';
      case Kyc.kycMemberInfo:
        return '/member/kyc/kycinfo';
      case Kyc.getLiveCheckConnect:
        return '/member/kyc/getlivecheckconnect';
      case Kyc.queryAuthenticateForEu:
        return '/member/kyc/queryauthenticateforeu';
      case Kyc.intermediateidcardforeu:
        return "/member/kyc/intermediateidcardforeu";
      case Kyc.intermediatepoaforeu:
        return "/member/kyc/intermediatepoaforeu";
      case Kyc.queryUserVerificationForEU:
        return '/member/kyc/queryuserverificationforeu';
      case Kyc.processDetailForEu:
        return '/member/kyc/processdetailforeu';
      case Kyc.kycAdvancedForEu:
        return '/member/kyc/kycadvancedforeu';
      case Kyc.getRequestDocument:
        return '/riskform/riskform/getrequestdocument';
      case Kyc.getMemberBasicInfo:
        return '/member/kyc/getmemberbasicinfo';
      case Kyc.cachePrimaryInfo:
        return '/member/kyc/cacheprimaryinfo';
      case Kyc.getPrimaryCacheInfo:
        return '/member/kyc/getprimarycacheinfo';
      case Kyc.kycStatus:
        return '/member/kyc/kyc';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Kyc.requestKyc:
      case Kyc.memberKycLimit:
      case Kyc.getKycSettings:
      case Kyc.sendSms:
      case Kyc.kycCountry:
      case Kyc.kycMemberInfo:
      case Kyc.queryAuthenticateForEu:
      case Kyc.queryUserVerificationForEU:
      case Kyc.getRequestDocument:
      case Kyc.getMemberBasicInfo:
      case Kyc.kycStatus:
      case Kyc.getPrimaryCacheInfo:
        return HTTPMethod.get;
      case Kyc.getLiveCheckConnect:
      case Kyc.primary:
      case Kyc.primaryForEU:
      case Kyc.verifySms:
      case Kyc.intermediate:
      case Kyc.globalIntermediate:
      case Kyc.createUploadUrl:
      case Kyc.kycAdvanced:
      case Kyc.intermediateidcardforeu:
      case Kyc.intermediatepoaforeu:
      case Kyc.processDetailForEu:
      case Kyc.kycAdvancedForEu:
      case Kyc.cachePrimaryInfo:
        return HTTPMethod.post;
    }
  }
}
