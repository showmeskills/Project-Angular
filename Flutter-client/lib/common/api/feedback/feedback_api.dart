// import 'package:base_framework/base_controller.dart';

import '../base/base_api.dart';

enum Feedback with GoGamingApi {
  /// 查询用户意见反馈 Page:页数1开始 PageSize：默认20
  getFeedbackList(params: {'Page': 1, 'PageSize': 20}),

  /// 获取用户意见反馈详情 id：getFeedbackList返回的数据
  getDetail(params: {'id': 0}),

  /// 新增用户意见反馈
  /// clientType: 客户端平台类型
  /// languageCode: 语言编码
  /// device: 客户端设备
  /// version: 客户端版本
  /// title: 标题
  /// urlList: 图片/视频网址列表
  create(data: {
    "feedbackType": "Localization",
    "productType": "LocalizationAccount",
    "clientType": ["string"],
    "languageCode": "string",
    "device": "string",
    "version": "string",
    "title": "string",
    "detail": "string",
    "url": "string",
    "urlList": ["string"]
  }),

  /// 获取建议类型/产品类型/客户端类型列表
  /// 客户端类型列表: clientTypeOptionList
  /// 建议类型列表: feedbackTypeOptionList
  /// 产品类型列表: productOptionList
  getOptionList();

  const Feedback({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Feedback.getFeedbackList:
        return '/sitemail/userfeedback/query';
      case Feedback.create:
        return '/sitemail/userfeedback/create';
      case Feedback.getOptionList:
        return '/sitemail/userfeedback/getoptionlist';
      case Feedback.getDetail:
        return '/sitemail/userfeedback/get';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Feedback.getFeedbackList:
      case Feedback.getOptionList:
      case Feedback.getDetail:
        return HTTPMethod.get;

      case Feedback.create:
        return HTTPMethod.post;
    }
  }

  @override
  bool get needCache {
    return true;
  }
}
