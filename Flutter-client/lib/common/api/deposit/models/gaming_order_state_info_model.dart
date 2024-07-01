class GamingOrderStateInfoModel {
  /// 订单号（为空时订单不存在）
  String orderId;

  /// [ Unknown, Success, Fail, Created, Waiting, Timeout, Cancel, Process, Review, Passed, NotPassed ]
  String state;

  /// 订单过期时间（状态=Waiting可用）
  int expiredTime;

  GamingOrderStateInfoModel({
    required this.orderId,
    required this.state,
    required this.expiredTime,
  });

  factory GamingOrderStateInfoModel.fromJson(dynamic map) {
    return GamingOrderStateInfoModel(
      orderId: map['orderId'] as String,
      state: map['state'] as String,
      expiredTime: map['expiredTime'] as int,
    );
  }
}
