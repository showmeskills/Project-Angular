// ignore_for_file: unused_element
import '../base/base_api.dart';

enum LuckySpinApi with GoGamingApi {
  // 返回活动资讯
  getTurnTableInformation(),

  // 返回活动资讯(批量)
  getMoreTurnTableInformation(),

  // 转动转盘
  turnTableRun(data: {
    'activityCode': 'x',
  }),

  // 取得剩余抽奖次数
  getTurnTableLeftTimes(params: {
    'activityCode': 'x',
  }),

  // 取得抽奖次数与距离下次抽奖的条件
  getTurnTableGapToSpin(params: {
    'activityCode': 'x',
  }),

  //获取大转盘中奖历史
  getTurnTablePrizeHistory(params: {
    'startTime': null,
    'endTime': null,
    'pageIndex': null,
    'pageSize': null
  }),

  //获取大转盘转动历史
  getTurnTableSpinHistory(params: {
    'startTime': null,
    'endTime': null,
    'pageIndex': null,
    'pageSize': null
  });

  const LuckySpinApi({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case LuckySpinApi.getMoreTurnTableInformation:
        return '/resource/activity/getmoreturntableinformation';
      case LuckySpinApi.turnTableRun:
        return '/resource/activity/turntablerun';
      case LuckySpinApi.getTurnTableInformation:
        return '/resource/activity/getturntableinformation';
      case LuckySpinApi.getTurnTableLeftTimes:
        return '/resource/activity/getturntablelefttimes';
      case LuckySpinApi.getTurnTableGapToSpin:
        return '/resource/activity/getturntablegaptospin';
      case LuckySpinApi.getTurnTablePrizeHistory:
        return '/resource/activity/getturntableprizehistory';
      case LuckySpinApi.getTurnTableSpinHistory:
        return '/resource/activity/getturntablspinhistory';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case LuckySpinApi.getMoreTurnTableInformation:
      case LuckySpinApi.getTurnTableInformation:
      case LuckySpinApi.getTurnTableLeftTimes:
      case LuckySpinApi.getTurnTableGapToSpin:
      case LuckySpinApi.getTurnTablePrizeHistory:
      case LuckySpinApi.getTurnTableSpinHistory:
        return HTTPMethod.get;
      case turnTableRun:
        return HTTPMethod.post;
    }
  }

  @override
  bool get needCache {
    switch (this) {
      case LuckySpinApi.getTurnTableInformation:
      case LuckySpinApi.getMoreTurnTableInformation:
      case LuckySpinApi.getTurnTableSpinHistory:
        return true;
      default:
        return false;
    }
  }
}
