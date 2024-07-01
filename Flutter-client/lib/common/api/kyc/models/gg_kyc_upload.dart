import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingKycUploadModel {
  GamingKycUploadModel({
    this.url,
    this.fullUrl,
  });

  factory GamingKycUploadModel.fromJson(Map<String, dynamic> json) =>
      GamingKycUploadModel(
        url: asT<String?>(json['url']),
        fullUrl: asT<String?>(json['fullUrl']),
      );

  String? url;

  String? fullUrl;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'url': url,
        'fullUrl': fullUrl,
      };
}
