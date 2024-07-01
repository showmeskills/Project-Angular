// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Bonus with GoGamingApi {
  /// 首页展示：获取活动列表
  activityInfo(params: {
    'equipment': 'Web',
  }),

  /// 竞猜活动 ==》取得活动基础资讯 (活动header顶部)
  getActivityBaseInfo(params: {'activityCode': 'x'}),

  /// 获取免费竞猜活动状态
  getRecentActivity(),

  /// 获取进行中的竞赛活动
  getContestActivities(),

  /// 根据活动编号查询用户的排名
  getRank(params: {
    "activitiesNo": 'x',
    'pageIndex': null,
    'pageSize': null,
  }),

  /// 获取用户在活动个人排名 (我的排名)
  getRankById(params: {
    "activitiesNo": 'x',
  }),

  /// 获取卡券可领取的数量
  getBonusCount(),

  getActivityDetail(params: {
    'bonusActivitiesNo': 'x',
    'equipment': 'App',
  }),

  /// 获取可选卡券类型
  getBonusSelect(),

  /// 获取卡券总数
  getBonusTypeList(),

  /// 卡券中心列表
  bonusDetail(params: {
    'PageIndex': null,
    'PageSize': null,
    'TypeCode': null,
    'GrantType': null,
    'Status': null,
    'AscSort': null,
    // 是否按用户指定排序返回数据 ture:是，false:否
    'UserSort': null,
    // 是否分页
    'IsByPage': null,
  }),

  /// 获取卡券兑换历史
  exchangeReceiveInfo(params: {
    'PageIndex': null,
    'PageSize': null,
  }),

  /// 查询返水列表
  queryBackWaterList(params: {
    'bonusId': 0,
    'pageIndex': null,
    'pageSize': null,
  }),

  /// 查询抵用金使用详情
  bonusFlow(params: {
    'bonusId': 0,
    'pageIndex': null,
    'pageSize': null,
  }),

  /// 领取卡券
  receiveBackWater(params: {"bonusId": 0}),

  /// 通过券码获取红利活动
  /// amount 充值金额，可以为0，如果是欧洲拿不到金额的，红利那边会判断0，获取默认的条件
  /// currency 币种，拿不到就给空
  getCouponDeposit(params: {
    "couponCode": "券码存款Code",
    "amount": 10000.0,
    "currency": null,
  }),

  /// 一键领取卡劵
  batchReceiveBonus(),

  /// 兑换券码
  exchangeReceive(data: {'exchangeCode': 'x'}),

  /// 法币存款页面， 查询用户能参与的活动
  getActivity(params: {
    'Currency': 'x',
    'PaymentMethod': null,
    'Amount': 0.0,
  }),

  /// 抵用金排序
  bonusSort(data: {
    "bonusSort": [
      {
        "id": 0,
        "sort": 0,
      }
    ]
  }),
  piqDepositBonus(data: {
    "activityNo": null,
  }),
  cryptoDepositBonus(data: {
    "activityNo": null,
  });

  const Bonus({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Bonus.activityInfo:
        return '/asset/bonus/getactivityinfo';
      case Bonus.getActivityBaseInfo:
        return '/asset/bonus/getactivitybaseinfo';
      case Bonus.getActivity:
        return '/asset/bonus/getbonusactivity';
      case Bonus.getActivityDetail:
        return '/asset/bonus/getactivitydetail';
      case Bonus.bonusDetail:
        return '/asset/bonus/bonusdetail';
      case Bonus.receiveBackWater:
        return '/asset/bonus/receivebackwater';
      case Bonus.getBonusTypeList:
        return '/asset/bonus/getbonustypelist';
      case Bonus.getBonusSelect:
        return '/asset/bonus/getbonusselect';
      case Bonus.exchangeReceiveInfo:
        return '/asset/bonus/exchangereceiveinfo';
      case Bonus.exchangeReceive:
        return '/asset/bonus/exchangereceive';
      case Bonus.queryBackWaterList:
        return '/asset/bonus/querybackwaterlist';
      case Bonus.bonusFlow:
        return '/asset/bonus/bonusflow';
      case Bonus.getBonusCount:
        return '/asset/bonus/getbonuscount';
      case Bonus.getContestActivities:
        return '/asset/bonus/getcontestactivities';
      case Bonus.getRank:
        return '/asset/bonus/getrank';
      case Bonus.getRankById:
        return '/asset/bonus/getrankbyid';
      case Bonus.bonusSort:
        return '/asset/bonus/bonussort';
      case Bonus.batchReceiveBonus:
        return '/asset/bonus/batchreceivebonus';
      case Bonus.piqDepositBonus:
        return '/asset/bonus/paymentiqdepositbonus';
      case Bonus.cryptoDepositBonus:
        return '/asset/bonus/cryptodepositbonus';
      case Bonus.getCouponDeposit:
        return '/asset/bonus/getcoupondeposit';
      case Bonus.getRecentActivity:
        return '/asset/bonus/getrecentactivity';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Bonus.activityInfo:
      case Bonus.getActivity:
      case Bonus.getActivityDetail:
      case Bonus.bonusDetail:
      case Bonus.receiveBackWater:
      case Bonus.getBonusTypeList:
      case Bonus.getBonusSelect:
      case Bonus.exchangeReceiveInfo:
      case Bonus.queryBackWaterList:
      case Bonus.bonusFlow:
      case Bonus.getBonusCount:
      case Bonus.getContestActivities:
      case Bonus.getRank:
      case Bonus.getRankById:
      case Bonus.getActivityBaseInfo:
      case Bonus.getCouponDeposit:
      case Bonus.getRecentActivity:
        return HTTPMethod.get;
      case Bonus.exchangeReceive:
      case Bonus.bonusSort:
      case Bonus.batchReceiveBonus:
      case Bonus.piqDepositBonus:
      case Bonus.cryptoDepositBonus:
        return HTTPMethod.post;
    }
  }

  @override
  bool get needCache {
    switch (this) {
      case Bonus.activityInfo:
      case Bonus.getActivityDetail:
        return true;
      default:
        return false;
    }
  }
}
