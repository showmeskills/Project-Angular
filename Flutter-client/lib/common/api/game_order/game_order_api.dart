// ignore_for_file: unused_element

import 'package:gogaming_app/widget_header.dart';

import '../base/base_api.dart';

enum GameType {
  sportsBook('SportsBook'),
  lottery('Lottery'),
  casino('Casino'),
  chess('Chess');

  const GameType(this.value);
  final String value;
}

extension GameTypeExtension on GameType {
  static GameType convert(String? value) {
    switch (value) {
      case 'SportsBook':
        return GameType.sportsBook;
      case 'Lottery':
        return GameType.lottery;
      case 'Casino':
        return GameType.casino;
      case 'Chess':
        return GameType.chess;
      default:
        return GameType.sportsBook;
    }
  }

  String get translate {
    switch (this) {
      case GameType.sportsBook:
        return localized('sports');
      case GameType.lottery:
        return localized('lottery');
      case GameType.casino:
        return localized('casino');
      case GameType.chess:
        return localized('chess');
    }
  }
}

enum GameOrder with GoGamingApi {
  /// 彩票游戏订单详情
  getLotteryDetail(params: {"wagerNumber": "交易单号"}),

  /// 体育游戏订单详情
  getSportDetail(params: {"wagerNumber": "交易单号"}),

  /// 棋牌游戏订单详情
  getChessDetail(params: {"wagerNumber": "交易单号"}),

  /// 娱乐场游戏订单详情
  getCasinoDetail(params: {"wagerNumber": "交易单号"}),

  recentOrder(params: {
    'pageIndex': 1,
    'pageSize': 9,
  }),

  /// 注单日期汇总，指定时间段内，按日期统计返回注单数量
  ///
  /// [beginDate] 和 [endDate] 需采用UTC+时差的时间
  ///
  /// 建议使用GamingDateRangeSelector.show的isUtc进行日期选择
  getWagerDayTotal(params: {
    'gameType': 'x',
    'wagerStatus': null,
    'beginDate': 0,
    'endDate': 0,
  }),

  /// 按日期获取注单列表
  ///
  /// [beginTime] getWagerDayTotal返回的日期+时差
  getWagerList(params: {
    'gameType': 'x',
    'wagerStatus': null,
    'beginTime': 0,
    'endTime': 0,
    'page': 1,
    'pageSize': 10,
  }),

  /// 我的投注初始化
  getSelfRealTimeBetInfo(params: {'pageSize': 10}),

  /// 所有投注初始化
  getRealTimeBetInfo(params: {'pageSize': 10}),

  /// 风云榜
  getHeroBetInfo(params: {'pageSize': 10}),

  /// 最幸运
  getLuckiestBetInfo(params: {'pageSize': 10}),

  /// 大赢家
  getMostWinerBetInfo(
      params: {'gameId': '游戏id', 'provider': '游戏厂商', 'catId': '游戏类型'}),

  /// 幸运赢家
  getLuckyWinerBetInfo(
      params: {'gameId': '游戏id', 'provider': '游戏厂商', 'catId': '游戏类型'}),

  getWagerStatusSelect(params: {
    'gameType': 'x',
  });

  const GameOrder({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case GameOrder.recentOrder:
        return '/asset/gameorder/recentorder';
      case GameOrder.getLotteryDetail:
        return '/asset/gameorder/getlotterydetail';
      case GameOrder.getSportDetail:
        return '/asset/gameorder/getsportdetail';
      case GameOrder.getChessDetail:
        return '/asset/gameorder/getchessdetail';
      case GameOrder.getCasinoDetail:
        return '/asset/gameorder/getcasinodetail';
      case GameOrder.getWagerList:
        return '/asset/gameorder/getwagerlist';
      case GameOrder.getWagerDayTotal:
        return '/asset/gameorder/getwagerdaytotal';
      case GameOrder.getWagerStatusSelect:
        return '/asset/gameorder/getwagerstatusselect';
      case GameOrder.getSelfRealTimeBetInfo:
        return '/asset/gameorder/getselfrealtimebetinfo';
      case GameOrder.getRealTimeBetInfo:
        return '/asset/gameorder/getrealtimebetinfo';
      case GameOrder.getHeroBetInfo:
        return '/asset/gameorder/getherobetinfo';
      case GameOrder.getLuckiestBetInfo:
        return '/asset/gameorder/getluckiestbetinfo';
      case GameOrder.getMostWinerBetInfo:
        return '/asset/gameorder/getmostwinerbetinfo';
      case GameOrder.getLuckyWinerBetInfo:
        return '/asset/gameorder/getluckywinerbetinfo';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case GameOrder.recentOrder:
      case GameOrder.getLotteryDetail:
      case GameOrder.getSportDetail:
      case GameOrder.getChessDetail:
      case GameOrder.getCasinoDetail:
      case GameOrder.getWagerList:
      case GameOrder.getWagerDayTotal:
      case GameOrder.getWagerStatusSelect:
      case GameOrder.getSelfRealTimeBetInfo:
      case GameOrder.getRealTimeBetInfo:
      case GameOrder.getHeroBetInfo:
      case GameOrder.getLuckiestBetInfo:
      case GameOrder.getMostWinerBetInfo:
      case GameOrder.getLuckyWinerBetInfo:
        return HTTPMethod.get;
    }
  }
}
