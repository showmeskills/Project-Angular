// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Vip with GoGamingApi {
  /// VIP福利列表
  vipBenefits(),

  /// 等级列表 getlevelsimplelist
  levelSimpleList(),

  /// 模版详情 gettemplateinfo
  templateinfo(),

  /// 用户vip等级
  userVip();

  const Vip({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Vip.templateinfo:
        return '/member/vipa/gettemplateinfo';
      case Vip.levelSimpleList:
        return '/member/vipa/getlevelsimplelist';
      case Vip.userVip:
        return '/member/vipa/getuserdetail';
      case Vip.vipBenefits:
        return '/member/vipa/getleveldetaillist';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Vip.templateinfo:
      case Vip.levelSimpleList:
      case Vip.userVip:
      case Vip.vipBenefits:
        return HTTPMethod.get;
    }
  }
}
