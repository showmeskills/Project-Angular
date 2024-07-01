import 'package:gogaming_app/common/api/risk_form/enum.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class RiskAssessmentFormModel {
  final double? annualIncome;
  final EmployStatus? employStatus;
  final String? companyName;
  final String? companyAddress;
  final double? netAsset;
  final AssetSource? assetSource;

  RiskAssessmentFormModel({
    this.annualIncome,
    this.employStatus,
    this.companyName,
    this.companyAddress,
    this.netAsset,
    this.assetSource,
  });

  factory RiskAssessmentFormModel.fromJson(Map<String, dynamic> json) {
    final employStatusString = asT<String>(json['employStatus']);
    final assetSourceString = asT<String>(json['assetSource']);
    return RiskAssessmentFormModel(
      annualIncome: asT<double>(json['annualIncome']),
      employStatus: employStatusString != null
          ? EmployStatus.fromeValue(employStatusString)
          : null,
      companyName: asT<String>(json['companyName']),
      companyAddress: asT<String>(json['companyAddress']),
      netAsset: asT<double>(json['netAsset']),
      assetSource: assetSourceString != null
          ? AssetSource.fromeValue(assetSourceString)
          : null,
    );
  }
}
