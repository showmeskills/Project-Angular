import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingKycCountryModel {
  GamingKycCountryModel({
    this.id,
    this.countryCode,
    this.country,
    this.idcardAllowed,
    this.idcardBack,
    this.passportAllowed,
    this.driverLicenseAllowed,
    this.driverLicenseBack,
  });

  factory GamingKycCountryModel.fromJson(Map<String, dynamic> json) =>
      GamingKycCountryModel(
        id: asT<String?>(json['ID']),
        countryCode: asT<String?>(json['countryCode']),
        country: asT<String?>(json['country']),
        idcardAllowed: asT<bool?>(json['idcardAllowed']),
        idcardBack: asT<bool?>(json['idcardBack']),
        passportAllowed: asT<bool?>(json['passportAllowed']),
        driverLicenseAllowed: asT<bool?>(json['driverLicenseAllowed']),
        driverLicenseBack: asT<bool?>(json['driverLicenseBack']),
      );

  String? id;

  String? countryCode;

  String? country;

  bool? idcardAllowed;

  bool? idcardBack;

  bool? passportAllowed;

  bool? driverLicenseAllowed;

  bool? driverLicenseBack;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'ID': id,
        'countryCode': countryCode,
        'country': country,
        'idcardAllowed': idcardAllowed,
        'idcardBack': idcardBack,
        'passportAllowed': passportAllowed,
        'driverLicenseAllowed': driverLicenseAllowed,
        'driverLicenseBack': driverLicenseBack,
      };
}
