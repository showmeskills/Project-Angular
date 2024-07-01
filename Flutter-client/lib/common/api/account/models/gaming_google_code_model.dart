import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingGoogleCodeModel {
  GamingGoogleCodeModel({
    this.manualEntryKey,
    this.qrCodeImageUrl,
    this.mobileHasVerified,
  });

  factory GamingGoogleCodeModel.fromJson(Map<String, dynamic> json) =>
      GamingGoogleCodeModel(
        manualEntryKey: asT<String?>(json['manualEntryKey']),
        qrCodeImageUrl: asT<String?>(json['qrCodeImageUrl']),
        mobileHasVerified: asT<bool?>(json['mobileHasVerified']),
      );

  /// 手工输入码
  String? manualEntryKey;

  /// 二维码地址
  String? qrCodeImageUrl;

  /// 手机是否已验证
  bool? mobileHasVerified;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'manualEntryKey': manualEntryKey,
        'qrCodeImageUrl': qrCodeImageUrl,
        'mobileHasVerified': mobileHasVerified,
      };
}
