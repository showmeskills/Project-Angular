import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class RememberLogin {
  bool isRemember;
  String? accountName;
  String? accountPassword;
  String? mobileNumber;
  String? mobilePassword;
  String? emailName;
  String? emailPassword;
  GamingCountryModel? selectCountry;

  /// 登录TabController对应的初始化
  int initialIndex = 0;
  RememberLogin({
    required this.isRemember,
    required this.initialIndex,
    this.accountName,
    this.accountPassword,
    this.mobileNumber,
    this.mobilePassword,
    this.selectCountry,
    this.emailName,
    this.emailPassword,
  });

  factory RememberLogin.fromJson(Map<String, dynamic> json) {
    final selectCountry = asT<String?>(json["selectCountry"]);
    return RememberLogin(
      isRemember: asT<bool?>(json["isRemember"]) ?? false,
      initialIndex: asT<int?>(json["initialIndex"]) ?? 0,
      accountName: asT<String?>(json["accountName"]),
      accountPassword: asT<String?>(json["accountPassword"]),
      mobileNumber: asT<String?>(json["mobileNumber"]),
      mobilePassword: asT<String?>(json["mobilePassword"]),
      emailName: asT<String?>(json["emailName"]),
      emailPassword: asT<String?>(json["emailPassword"]),
      selectCountry: selectCountry != null
          ? GamingCountryModel.fromJson(selectCountry)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "isRemember": isRemember,
      "initialIndex": initialIndex,
      "accountName": accountName,
      "accountPassword": accountPassword,
      "mobileNumber": mobileNumber,
      "mobilePassword": mobilePassword,
      "emailName": emailName,
      "emailPassword": emailPassword,
      "selectCountry": selectCountry?.toJson(),
    };
  }
}
