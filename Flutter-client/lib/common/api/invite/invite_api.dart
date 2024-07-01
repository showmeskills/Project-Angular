// ignore_for_file: unused_element

import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';

enum Invite with GoGamingApi {
  getDefault();

  const Invite({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Invite.getDefault:
        return '/agent/invite/getdefault';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Invite.getDefault:
        return HTTPMethod.get;
    }
  }
}
