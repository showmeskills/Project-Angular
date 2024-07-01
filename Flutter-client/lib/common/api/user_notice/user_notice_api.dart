import '../base/base_api.dart';

enum UserNotice with GoGamingApi {
  /// 获取会员站内信设定
  getNoticeConfig(),

  /// 设定通知语言
  setNoticeLanguage(data: {"language": "string"}),

  /// 设定接收通知类型 noticeTypeList: System, Transaction, Activity, Information
  setReceiveNoticeTypes(data: {
    'noticeTypeList': ['System']
  }),

  /// 获取各通知类型未读数量
  getNoticeCount(),

  /// 获取最新n条未读通知
  getNoticeListN(params: {'n': 100}),

  /// 查询通知
  getNoticeListType(params: {
    'Page': 1,
    'PageSize': 20,
    'NoticeType': null,
    'IsReaded': null
  }),

  /// 标记已读 idList:通知IdList
  readNotice(data: {
    "idList": [0]
  }),

  /// 删除通知 idList:通知IdList
  deleteNotice(data: {
    "idList": [0]
  }),

  /// 一键已读指定类型或全部未读 不传参数{} 或 {"noticeType": null}
  readAll(data: {"noticeType": null}),

  /// 一键删除指定类型或全部已读 不传参数{} 或 {"noticeType": null}
  deleteAll(data: {"noticeType": null});

  const UserNotice({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case UserNotice.deleteAll:
        return '/sitemail/usernotice/deleteall';
      case UserNotice.getNoticeConfig:
        return '/sitemail/usernotice/getnoticeconfig';
      case UserNotice.setNoticeLanguage:
        return '/sitemail/usernotice/setnoticelanguage';
      case UserNotice.setReceiveNoticeTypes:
        return '/sitemail/usernotice/setreceivenoticetypelist';
      case UserNotice.getNoticeCount:
        return '/sitemail/usernotice/getnoticecount';
      case UserNotice.getNoticeListN:
        return '/sitemail/usernotice/getnoticelist';
      case UserNotice.getNoticeListType:
        return '/sitemail/usernotice/querynotice';
      case UserNotice.readNotice:
        return '/sitemail/usernotice/readnotice';
      case UserNotice.deleteNotice:
        return '/sitemail/usernotice/deletenotice';
      case UserNotice.readAll:
        return '/sitemail/usernotice/readall';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case UserNotice.getNoticeConfig:
      case UserNotice.getNoticeCount:
      case UserNotice.getNoticeListType:
      case UserNotice.getNoticeListN:
        return HTTPMethod.get;

      case UserNotice.deleteAll:
      case UserNotice.setNoticeLanguage:
      case UserNotice.setReceiveNoticeTypes:
      case UserNotice.readNotice:
      case UserNotice.deleteNotice:
      case UserNotice.readAll:
        return HTTPMethod.post;
    }
  }
}
