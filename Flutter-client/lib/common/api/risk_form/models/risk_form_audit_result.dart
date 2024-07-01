import 'package:gogaming_app/common/api/risk_form/enum.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class RiskFormAuditResultModel {
  final String? id;
  final AuditStatus? status;
  final AdvancedCertificationType? type;
  final String? remark;
  final Map<String, dynamic>? form;

  RiskFormAuditResultModel({
    this.id,
    this.status,
    this.type,
    this.remark,
    this.form,
  });

  factory RiskFormAuditResultModel.fromJson(Map<String, dynamic> json) {
    final statusString = asT<String>(json['status']);
    final typeString = asT<String>(json['type']);
    return RiskFormAuditResultModel(
      id: asT<String>(json['id']),
      status:
          statusString == null ? null : AuditStatus.fromeValue(statusString),
      type: typeString == null
          ? null
          : AdvancedCertificationType.fromeValue(typeString),
      remark: asT<String>(json['remark']),
      form: asT<Map<String, dynamic>>(json['form']),
    );
  }
}
