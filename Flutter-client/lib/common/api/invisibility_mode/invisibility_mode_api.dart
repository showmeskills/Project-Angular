// ignore_for_file: unused_element

import '../base/base_api.dart';

/// 隐身模式
enum Invisibility with GoGamingApi {
  /// 修改
  // 'ShowUserName',  'ShowUid','Invisibility',
  modifyInvisibilityMode(data: {"invisibilityMode": "x"});

  const Invisibility({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Invisibility.modifyInvisibilityMode:
        return "/member/account/modifyinvisibilitymode";
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Invisibility.modifyInvisibilityMode:
        return HTTPMethod.post;
    }
  }
}
