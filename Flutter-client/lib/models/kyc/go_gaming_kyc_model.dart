import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class KycModel {
  KycModel({
    this.success,
    this.code,
    this.message,
    this.kycInfo,
  });

  factory KycModel.fromJson(Map<String, dynamic> json) {
    final List<KycInfo> data = json['data'] is List ? <KycInfo>[] : [];
    for (final dynamic item in json["data"] as List) {
      if (item != null) {
        data.add(KycInfo.fromJson(asT<Map<String, dynamic>>(item)!));
      }
    }
    return KycModel(
      success: asT<bool>(json['success']),
      code: asT<String>(json['code']),
      message: asT<String>(json['message']),
      kycInfo: data,
    );
  }

  bool? success;
  String? code;
  String? message;
  List<KycInfo>? kycInfo;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'success': success,
        'code': code,
        'message': message,
        'data': kycInfo,
      };
}

class KycInfo {
  KycInfo({
    this.type,
    this.value,
    this.status,
    this.countryCode,
    this.remark,
    this.createTime,
    this.modifyTime,
  });

  factory KycInfo.fromJson(Map<String, dynamic> json) => KycInfo(
        type: asT<String>(json['type']),
        value: asT<String>(json['value']),
        status: asT<String>(json['status']),
        countryCode: asT<String>(json['countryCode']),
        remark: asT<String>(json['remark']),
        createTime: asT<int>(json['createTime']),
        modifyTime: asT<int>(json['modifyTime']),
      );

  String? type;
  String? value;
  String? status;
  String? countryCode;
  String? remark;
  int? createTime;
  int? modifyTime;
  String primaryStatus() {
    if (type == KycVerifyType.primary) return status ?? KycVerifyStatus.initial;
    return KycVerifyStatus.passed;
  }

  String intermediateStatus() {
    if (type == KycVerifyType.intermediate) {
      return status ?? KycVerifyStatus.initial;
    } else if (type == KycVerifyType.primary) {
      return KycVerifyStatus.initial;
    }

    return KycVerifyStatus.passed;
  }

  bool primaryPassed() {
    return primaryStatus() == KycVerifyStatus.passed;
  }

  bool intermediatePassed() {
    return intermediateStatus() == KycVerifyStatus.passed;
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'type': type,
        'value': value,
        'status': status,
        'countryCode': countryCode,
        'remark': remark,
        'createTime': createTime,
        'modifyTime': modifyTime,
      };
}

extension KycVerifyStatus on String {
  static String initial = 'I';
  static String pending = 'P';
  static String passed = 'S';
  static String reject = 'R';
}

extension KycVerifyType on String {
  static String primary = 'KycPrimary';
  static String intermediate = 'KycIntermediat';
  static String advanced = 'KycAdvanced';
}

//文件状态
extension KycDocumentStatus on String {
  static String normal = 'Normal'; //待提交
  static String pending = 'Pending'; // 待审核
  static String finish = 'Finish'; // 通过
  static String rejected = 'Rejected'; //拒绝
}
