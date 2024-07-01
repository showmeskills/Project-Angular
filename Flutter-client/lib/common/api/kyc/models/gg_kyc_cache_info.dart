import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingKycCacheInfo {
  GamingKycCacheInfo({
    this.countryCode,
    this.firstName,
    this.lastName,
    this.fullName,
    this.middleName,
    this.idCardNumber,
    this.dob,
    this.city,
    this.zipCode,
    this.address,
    this.email,
    this.areaCode,
    this.mobile,
  });

  factory GamingKycCacheInfo.fromJson(Map<String, dynamic> json) =>
      GamingKycCacheInfo(
        countryCode: asT<String?>(json['countryCode']),
        firstName: asT<String?>(json['firstName']),
        lastName: asT<String?>(json['lastName']),
        fullName: asT<String?>(json['fullName']),
        middleName: asT<String?>(json['middleName']),
        idCardNumber: asT<String?>(json['idCardNumber']),
        dob: asT<String?>(json['dob']),
        city: asT<String?>(json['city']),
        zipCode: asT<String?>(json['zipCode']),
        address: asT<String?>(json['address']),
        email: asT<String?>(json['email']),
        areaCode: asT<String?>(json['areaCode']),
        mobile: asT<String?>(json['mobile']),
      );

  String? countryCode;

  String? fullName;

  String? firstName;

  String? lastName;

  String? middleName;

  String? idCardNumber;

  String? dob;

  String? city;

  String? zipCode;

  String? address;

  String? email;

  String? areaCode;

  String? mobile;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'countryCode': countryCode,
        'firstName': firstName,
        'lastName': lastName,
        'fullName': fullName,
        'middleName': middleName,
        'idCardNumber': idCardNumber,
        'dob': dob,
        'city': city,
        'zipCode': zipCode,
        "address": address,
        "email": email,
        'areaCode': areaCode,
        'mobile': mobile,
      };
}
