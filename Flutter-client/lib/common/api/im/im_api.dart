// ignore_for_file: unused_element

import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';

import '../base/base_api.dart';

enum ImAPI with GoGamingApi {
  /// 获取token

  generateToken(data: {
    "appId": "4xMTxI9p",
    "appSecret": "d1124a2acbc0074900e436505ccfa049f9abaa2f",
    "deviceType": 3, // 0未知1WEB 2安卓 3IOS
    "uid": "01000408"
  }),

  /// 上传文件，采用FormData上传，key = file
  upload();

  const ImAPI({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String getBaseUrl() {
    return WebUrlService.baseUrl;
  }

  @override
  String get path {
    switch (this) {
      case ImAPI.generateToken:
        return '/im/api/auth/generateToken';
      case ImAPI.upload:
        return '/im/api/file/upload';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case ImAPI.generateToken:
      case ImAPI.upload:
        return HTTPMethod.post;
    }
  }
}
