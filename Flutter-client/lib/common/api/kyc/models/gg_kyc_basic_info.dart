import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingKycBasicInfo {
  GamingKycBasicInfo({
    this.uid,
    this.firstName,
    this.lastName,
    this.fullName,
    this.countryCode,
    this.birthday,
    this.city,
    this.zipCode,
    this.address,
    this.email,
  });

  factory GamingKycBasicInfo.fromJson(Map<String, dynamic> json) =>
      GamingKycBasicInfo(
        uid: asT<String?>(json['uid']),
        firstName: asT<String?>(json['firstName']),
        lastName: asT<String?>(json['lastName']),
        fullName: asT<String?>(json['fullName']),
        countryCode: asT<String?>(json['countryCode']),
        birthday: asT<int?>(json['birthday']),
        city: asT<String?>(json['city']),
        zipCode: asT<String?>(json['zipCode']),
        address: asT<String?>(json['address']),
        email: asT<String?>(json['email']),
      );

  String? uid;

  String? firstName;

  String? lastName;

  String? fullName;

  String? countryCode;

  int? birthday;

  String? city;

  String? zipCode;

  String? address;

  String? email;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'uid': uid,
        'firstName': firstName,
        'lastName': lastName,
        'fullName': fullName,
        'countryCode': countryCode,
        'birthday': birthday,
        'city': city,
        'zipCode': zipCode,
        "address": address,
        "email": email,
      };
}
