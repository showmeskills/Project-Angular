import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingUploadModel {
  GamingUploadModel({
    this.url,
    this.fullUrl,
  });

  factory GamingUploadModel.fromJson(Map<String, dynamic> json) =>
      GamingUploadModel(
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
