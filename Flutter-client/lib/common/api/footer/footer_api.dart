// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Footer with GoGamingApi {
  /// 因Community数据中icon分辨率问题以及license最后一张图片地址问题, 导致目前只能使用ClientType: Web
  getFooter(params: {'ClientType': 'Web'});

  const Footer({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Footer.getFooter:
        return "/resource/footer/getfooterlist";
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Footer.getFooter:
        return HTTPMethod.get;
    }
  }

  @override
  bool get needCache {
    return true;
  }
}
