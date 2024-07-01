// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Tracker with GoGamingApi {
  submit(data: {"rawBehaviour": "string"});

  const Tracker({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Tracker.submit:
        return '/behavior/behavior/submit';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Tracker.submit:
        return HTTPMethod.post;
    }
  }
}
