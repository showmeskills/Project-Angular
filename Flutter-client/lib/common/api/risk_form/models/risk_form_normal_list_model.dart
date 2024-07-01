import 'dart:convert';
import 'package:gogaming_app/common/utils/util.dart';

enum RiskFormNormalListModelType {
  // 风控评估问卷补充资料
  riskAssessment('RiskAssessment'),
  // 财富来源证明补充资料
  wealthSource('WealthSource'),
  // 全套审核
  fullAudit('FullAudit');

  const RiskFormNormalListModelType(this.value);
  final String value;
}

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class RiskFormNormalListModel {
  RiskFormNormalListModel({
    this.id,
    this.type,
  });

  factory RiskFormNormalListModel.fromJson(Map<String, dynamic> json) =>
      RiskFormNormalListModel(
        id: GGUtil.parseInt(json['id']),
        type: GGUtil.parseStr(json['type']),
      );

  int? id;
  //  风控表单类型
  //  RiskAssessment:1, //风险评估问卷
  //  WealthSource:2, //财富来源证明
  //  FullAudit:3, //全套审核
  String? type;

  RiskFormNormalListModelType? get curType {
    switch (type) {
      case 'RiskAssessment':
        return RiskFormNormalListModelType.riskAssessment;
      case 'WealthSource':
        return RiskFormNormalListModelType.wealthSource;
      case 'FullAudit':
        return RiskFormNormalListModelType.fullAudit;
      default:
        return null;
    }
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'type': type,
      };
}
