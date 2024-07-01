T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingKycStatusModel {
  String? type;
  String? value;
  String? countryCode;
  String? status;
  String? remark;
  DateTime? createTime;
  DateTime? modifyTime;

  GamingKycStatusModel({
    this.type,
    this.value,
    this.countryCode,
    this.status,
    this.remark,
    this.createTime,
    this.modifyTime,
  });

  @override
  String toString() {
    return 'GgKycStatusModel(type: $type, value: $value, countryCode: $countryCode, status: $status, remark: $remark)';
  }

  factory GamingKycStatusModel.fromJson(Map<String, Object?> json) {
    return GamingKycStatusModel(
      type: asT<String>(json['type']),
      value: asT<String>(json['value']),
      countryCode: asT<String>(json['countryCode']),
      status: asT<String>(json['status']),
      remark: asT<String>(json['remark']),
    );
  }

  Map<String, Object?> toJson() => {
        'type': type,
        'value': value,
        'countryCode': countryCode,
        'status': status,
        'remark': remark,
      };

  GamingKycStatusModel copyWith({
    String? type,
    String? value,
    String? countryCode,
    String? status,
    String? remark,
  }) {
    return GamingKycStatusModel(
      type: type ?? this.type,
      value: value ?? this.value,
      countryCode: countryCode ?? this.countryCode,
      status: status ?? this.status,
      remark: remark ?? this.remark,
    );
  }
}
