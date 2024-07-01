// ignore_for_file: unused_element
import '../base/base_api.dart';

enum RiskFormApi with GoGamingApi {
  /// 查询用户是否在风控列表中
  queryRiskAbnormalMember(),

  /// 查询用户是否有待完成的风控表单
  queryNormalRiskForm(),

  /// 查询用户认证信息
  queryAuthentication(),

  /// 提交全套审核
  submitFullAudit(data: {
    'frontsideImage': 'x',
    'backsideImage': 'x',
    'bankRecordImages': ['x', 'x'],
    'cryptoCurrencyRecordImages': ['x', 'x'],
    'videoUrl': 'x',
  }),

  /// 提交风险评估问卷
  submitRiskassessment(data: {
    'annualIncome': 0,
    'employStatus': 'x',
    'companyName': 'x',
    'companyAddress': 'x',
    'netAsset': 0,
    'assetSource': 'x',
    'id': 0,
  }),

  /// 财富来源
  submitWealthSource(data: {
    'depositLimit': '',
    'moneySources': <String>[],
    'salaryImages': null,
    'soleTraderImages': null,
    'depositsImages': null,
    'pensionImages': null,
    'stockImages': null,
    'businessImages': null,
    'investImages': null,
    'gambleImages': null,
    'saleHouseImages': null,
    'rentImages': null,
    'borrowMoneyImages': null,
    'legacyImages': null,
    'contributedImages': null,
    'otherImages': null,
    'id': 0,
  }),

  /// 获取最后一次审核信息
  getLastAuditRiskForm(
    params: {
      'type': 'x',
      'status': 'x',
    },
  ),

  /// 上传 ID
  uploadidverification(
    data: {
      "country": "x",
      "id": 0,
      "idType": "x",
      "frontImage": "x",
      "backImage": "x",
      "originalFrontImageName": "x",
      "originalBackImageName": "x"
    },
  ),

  /// 上传 POA
  uploadproofofaddress(
    data: {
      "id": 0,
      "country": "x",
      "address": "x",
      "city": "x",
      "postalCode": "x",
      "screenshotProof": "x",
      "originalFileName": "x",
    },
  ),

  /// 上传支付方式
  uploadpaymentmethod(
    data: {
      "id": 0,
      "paymentName": "x",
      "screenshotProof": "x",
      "originalFileName": "x",
    },
  ),

  /// 上传自定义文件
  uploadcustomize(
    data: {
      "id": 0,
      "customizeName": "x",
      "customizeValue": "x",
      "originalFileName": "x",
    },
  ),

  /// 高级认证补充资料
  uploadsow(data: {
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
    'id': 0,
  }),

  /// 提交EDD
  submitEdd(data: {
    'monthlySalary': 0,
    'currency': 'x',
    'employmentStatus': 'x',
    'occupation': 'x',
    'sourceOfFunds': 'x',
  });

  const RiskFormApi({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case RiskFormApi.queryRiskAbnormalMember:
        return '/riskform/riskform/queryriskabnormalmember';
      case RiskFormApi.submitFullAudit:
        return '/riskform/riskform/submitfullaudit';
      case RiskFormApi.queryNormalRiskForm:
        return '/riskform/riskform/querynormalriskform';
      case RiskFormApi.submitRiskassessment:
        return '/riskform/riskform/submitriskassessment';
      case RiskFormApi.submitWealthSource:
        return '/riskform/riskform/submitwealthsource';
      case RiskFormApi.queryAuthentication:
        return '/riskform/riskform/queryauthentication';
      case RiskFormApi.getLastAuditRiskForm:
        return '/riskform/riskform/getlastauditriskform';
      case RiskFormApi.uploadsow:
        return '/riskform/riskform/uploadsow';
      case RiskFormApi.uploadidverification:
        return '/riskform/riskform/uploadidverification';
      case RiskFormApi.uploadproofofaddress:
        return '/riskform/riskform/uploadproofofaddress';
      case RiskFormApi.uploadpaymentmethod:
        return '/riskform/riskform/uploadpaymentmethod';
      case RiskFormApi.uploadcustomize:
        return '/riskform/riskform/uploadcustomize';
      case RiskFormApi.submitEdd:
        return '/riskform/riskform/submitedd';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case RiskFormApi.queryRiskAbnormalMember:
      case RiskFormApi.queryNormalRiskForm:
      case RiskFormApi.queryAuthentication:
      case RiskFormApi.getLastAuditRiskForm:
        return HTTPMethod.get;
      case RiskFormApi.submitFullAudit:
      case RiskFormApi.submitRiskassessment:
      case RiskFormApi.submitWealthSource:
      case RiskFormApi.uploadsow:
      case RiskFormApi.uploadidverification:
      case RiskFormApi.uploadproofofaddress:
      case RiskFormApi.uploadpaymentmethod:
      case RiskFormApi.uploadcustomize:
      case RiskFormApi.submitEdd:
        return HTTPMethod.post;
    }
  }

  @override
  bool get needCache {
    switch (this) {
      default:
        return false;
    }
  }
}
