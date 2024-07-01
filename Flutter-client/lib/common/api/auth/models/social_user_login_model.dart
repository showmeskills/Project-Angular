import 'gaming_login_model.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class SocialUserLoginModel {
  /// 验证是否通过
  bool isVerified;

  /// 是否注册平台账号
  bool isRegister;

  /// 第三方id
  String? socialUserId;
  GamingLoginModel? loginResult;

  SocialUserLoginModel({
    required this.isVerified,
    required this.isRegister,
    this.socialUserId,
    this.loginResult,
  });

  factory SocialUserLoginModel.fromJson(Map<String, dynamic> json) =>
      SocialUserLoginModel(
        isVerified: asT<bool>(json['isVerified']) ?? false,
        isRegister: asT<bool>(json['isRegister']) ?? false,
        socialUserId: asT<String>(json['socialUserId']),
        loginResult: json['loginResult'] is Map
            ? GamingLoginModel.fromJson(
                Map<String, dynamic>.from(json['loginResult'] as Map))
            : null,
      );
  static SocialUserLoginModel debugModel() {
    final map = {
      "isVerified": true,
      "isRegister": false,
      "socialUserId": "Ud9fcb6befeb6c5fcaac03309d5964483",
      "loginResult": null
    };
    return SocialUserLoginModel.fromJson(map);
  }
}
