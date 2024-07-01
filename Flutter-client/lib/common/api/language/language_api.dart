// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Language with GoGamingApi {
  /// 获取所有语言
  getLanguage();

  /// 后台已废弃 更换语言 langCode = getAllLanguage返回的code
  // set(params: {"langCode": "x"});

  const Language({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Language.getLanguage:
        return "/resource/language/getalllanguage";
      // case Language.set:
      //   return "/resource/language/set";
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Language.getLanguage:
        return HTTPMethod.get;
      // case Language.set:
      //   return HTTPMethod.post;
    }
  }

  @override
  bool get needCache {
    switch (this) {
      case Language.getLanguage:
        return true;
      default:
        return false;
    }
  }
}
