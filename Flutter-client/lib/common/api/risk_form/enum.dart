import 'package:gogaming_app/widget_header.dart';

enum AdvancedCertificationType {
  /// 财富来源证明
  wealthSource('WealthSource'),

  /// 风险评估问卷
  riskAssessment('RiskAssessment'),

  /// 全套审核
  fullCertificate('FullAudit');

  const AdvancedCertificationType(this.value);
  final String value;

  factory AdvancedCertificationType.fromeValue(String value) {
    return AdvancedCertificationType.values
        .firstWhere((element) => element.value == value);
  }

  String get action {
    switch (this) {
      case AdvancedCertificationType.wealthSource:
        return localized('wealth_source_certificate_action');
      case AdvancedCertificationType.riskAssessment:
        return localized('risk_assessment_action');
      case AdvancedCertificationType.fullCertificate:
        return localized('upload_specified_file');
    }
  }
}

enum EmployStatus {
  /// 在职人士
  employment('Employee'),

  /// 自雇人士
  freelance('SelfEmployed'),

  /// 学生
  student('Student'),

  /// 退休人士
  retiree('Retiree'),

  /// 无业人士
  unEmployment('UnEmployed');

  const EmployStatus(this.value);

  final String value;

  static EmployStatus? fromeValue(String value) {
    return EmployStatus.values
        .firstWhereOrNull((element) => element.value == value);
  }

  String get text {
    switch (this) {
      case EmployStatus.employment:
        return localized('empl');
      case EmployStatus.freelance:
        return localized('self_e');
      case EmployStatus.student:
        return localized('student');
      case EmployStatus.retiree:
        return localized('retiree');
      case EmployStatus.unEmployment:
        return localized('unemployed');
    }
  }
}

enum AssetSource {
  /// 工资/自雇收入
  salarySelfEmploymentIncome('SalarySelfEmploymentIncome'),

  /// 存款
  savings('Savings'),

  /// 退休金
  pension('Pension'),

  /// 房地产
  saleOfRealEstate('SaleOfRealEstate'),

  /// 遗产
  inheritance('Inheritance'),

  /// 企业所有权
  ownershipOfABusiness('OwnershipOfABusiness'),

  /// 投资
  investment('Investment'),

  /// 投资和其他
  others('Others');

  const AssetSource(this.value);

  final String value;

  static AssetSource? fromeValue(String value) {
    return AssetSource.values
        .firstWhereOrNull((element) => element.value == value);
  }

  String get text {
    switch (this) {
      case AssetSource.salarySelfEmploymentIncome:
        return localized('salary_self_employment_income');
      case AssetSource.savings:
        return localized('savings');
      case AssetSource.pension:
        return localized('pension');
      case AssetSource.saleOfRealEstate:
        return localized('sale_of_real_estate');
      case AssetSource.inheritance:
        return localized('inheritance');
      case AssetSource.ownershipOfABusiness:
        return localized('ownership_of_a_business');
      case AssetSource.investment:
        return localized('investment');
      case AssetSource.others:
        return localized('others');
    }
  }
}

enum Quota {
  /// ≥ 500K USD
  greaterOrEqual500K('GreaterOrEqual500K'),

  /// ≥ 1M USD
  greaterOrEqual1M('GreaterOrEqual1M'),

  /// ≥ 2M USD
  greaterOrEqual2M('GreaterOrEqual2M');

  const Quota(this.value);

  final String value;

  static Quota? fromeValue(String value) {
    return Quota.values.firstWhereOrNull((element) => element.value == value);
  }

  String get text {
    switch (this) {
      case Quota.greaterOrEqual500K:
        return localized('select_quota_1');
      case Quota.greaterOrEqual1M:
        return localized('select_quota_2');
      case Quota.greaterOrEqual2M:
        return localized('select_quota_3');
    }
  }
}

/// 审核状态
enum AuditStatus {
  /// 未提交
  normal('Normal'),

  /// 审核中
  pending('Pending'),

  /// 审核通过
  finish('Finish'),

  /// 拒绝
  rejected('Rejected');

  const AuditStatus(this.value);
  final String value;

  static AuditStatus? fromeValue(String value) {
    return AuditStatus.values
        .firstWhereOrNull((element) => element.value == value);
  }
}
