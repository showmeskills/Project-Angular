// ignore_for_file: unused_element

import '../base/base_api.dart';

enum BannerType {
  front('FrontPage'),
  games('GamesPage'),
  lottery('LotteryPage');

  const BannerType(this.value);
  final String value;
}

enum Banner with GoGamingApi {
  getBanner(params: {
    'BannerPageType': 'x',
    'ClientType': 'App',
  });

  const Banner({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    return "/resource/banner/getbannerlist";
  }

  @override
  HTTPMethod get method {
    return HTTPMethod.get;
  }

  @override
  bool get needCache {
    return true;
  }
}
