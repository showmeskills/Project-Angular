import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GGKycMemberInfo {
  GGKycMemberInfo({
    this.email,
    this.address,
    this.city,
    this.zipCode,
  });

  factory GGKycMemberInfo.fromJson(Map<String, dynamic> json) =>
      GGKycMemberInfo(
        email: asT<String?>(json['email']),
        address: asT<String?>(json['address']),
        city: asT<String?>(json['city']),
        zipCode: asT<String?>(json['zipCode']),
      );

  /// 邮箱
  String? email;
  String? address;
  String? city;

  /// 邮编
  String? zipCode;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'email': email,
        'address': address,
        'city': city,
        'zipCode': zipCode,
      };
}
