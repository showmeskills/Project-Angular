// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Country with GoGamingApi {
  getCountry();

  const Country({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Country.getCountry:
        return "/resource/country/getall";
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Country.getCountry:
        return HTTPMethod.get;
    }
  }

  @override
  bool get needCache {
    return true;
  }

  // @override
  // int? get connectTimeout {
  //   return 3000;
  // }

  @override
  int? get receiveTimeout {
    return 5000;
  }
}
