// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Activity with GoGamingApi {
  getNewUserApply(),
  submitNewUserApply(data: {
    'prizeCode': 'string',
    'tmpCode': 'string',
    'tmpType': 'string',
  }),

  /// * [current] 页码
  /// * [size] 单页数量
  /// * [orderDirection] 开始时间排序方向 desc-倒序 asc-正序
  /// ```dart
  /// {
  ///    'current': 0,
  ///    'orderDirection': 'string',
  ///    'size': 0,
  ///  }
  /// ```
  getNewRankList(data: {
    'startDto': <String, dynamic>{},
    'endDto': <String, dynamic>{},
    'preDto': <String, dynamic>{},
  }),
  newRankActivityApply(data: {
    'tmpCode': 'string',
  }),

  /// * [current] 页码
  /// * [size] 单页数量
  /// * [tmpCode] 活动code
  /// * [gameTypeDto] 游戏
  /// ```dart
  /// {
  ///    'gameCategory': 'string', 游戏大类 LiveCasino 或者其他
  ///    'gameCode': 'string', 游戏代码
  ///    'gameProvider': 'string' 游戏提供商
  /// }
  /// ```
  getNewRankResult(data: {
    'gameTypeDto': null,
    'tmpCodes': null, // ['xxx']
    'current': 0,
    'size': 0,
  }),

  // 查询是否可以加入活动
  newRankCheckApply(data: {
    'tmpCodes': ['xxx'],
  });

  const Activity({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Activity.getNewUserApply:
        return '/resource/activity/getnewuseractivityapply';
      case Activity.submitNewUserApply:
        return '/resource/activity/newuseractivityapply';
      case Activity.getNewRankList:
        return '/resource/activity/getnewranklist';
      case Activity.newRankActivityApply:
        return '/resource/activity/newrankactivityapply';
      case Activity.getNewRankResult:
        return '/resource/activity/getnewrankresult';
      case Activity.newRankCheckApply:
        return '/resource/activity/NewRankCheckApply';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Activity.getNewUserApply:
        return HTTPMethod.get;
      case Activity.getNewRankList:
      case Activity.submitNewUserApply:
      case Activity.newRankActivityApply:
      case Activity.getNewRankResult:
      case Activity.newRankCheckApply:
        return HTTPMethod.post;
    }
  }
}
