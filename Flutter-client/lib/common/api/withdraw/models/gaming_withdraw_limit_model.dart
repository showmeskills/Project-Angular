import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingWithdrawLimitModel {
  GamingWithdrawLimitModel({
    required this.currency,

    /// 可用额度（查询币种能提款额度）
    required this.availQuota,

    /// 余额（查询币种的余额）
    required this.balance,

    /// 提款限额
    required this.withdrawQuota,

    /// 锁定金额（选择的币种锁定金额）
    required this.freezeAmount,

    /// 当日限额(USD)
    required this.todayQuota,

    /// 已使用额度（USD)
    required this.usedQuota,

    ///可提款金额（单位选择的币种）
    required this.canUseQuota,
    required this.totalHandlingFee,
    required this.paymentHandlingFee,
    this.withdrawalFeeProportion,
    this.perFeeLimit,
    this.freeWithdrawalsPerDay,
    this.withdrawCount,
    this.freeFeeTime,
  });

  factory GamingWithdrawLimitModel.fromJson(Map<String, dynamic> json) =>
      GamingWithdrawLimitModel(
        currency: GGUtil.parseStr(json['currency']),
        availQuota: GGUtil.parseDouble(json['availQuota']),
        balance: GGUtil.parseDouble(json['balance']),
        withdrawQuota: GGUtil.parseDouble(json['withdrawQuota']),
        freezeAmount: GGUtil.parseDouble(json['freezeAmount']),
        todayQuota: GGUtil.parseDouble(json['todayQuota']),
        usedQuota: GGUtil.parseInt(json['usedQuota']),
        canUseQuota: GGUtil.parseDouble(json['canUseQuota']),
        totalHandlingFee: GGUtil.parseDouble(json['totalHandlingFee']),
        paymentHandlingFee: GGUtil.parseDouble(json['paymentHandlingFee']),
        withdrawalFeeProportion: asT<num?>(json['withdrawalFeeProportion']),
        perFeeLimit: asT<num?>(json['perFeeLimit']),
        freeWithdrawalsPerDay: asT<num?>(json['freeWithdrawalsPerDay']),
        withdrawCount: asT<num?>(json['withdrawCount']),
        freeFeeTime: asT<num?>(json['freeFeeTime']),
      );

  String currency;
  double availQuota;
  double balance;
  double withdrawQuota;
  double freezeAmount;
  num todayQuota;
  bool get todayUnlimited => -1 == todayQuota;

  int usedQuota;
  double canUseQuota;
  double totalHandlingFee;
  double paymentHandlingFee;

  /// 提款手续费比例 5就是5%，为0说明是免费
  num? withdrawalFeeProportion;

  /// 单笔手续费上限 USDT
  num? perFeeLimit;

  /// 单日免费提款次数
  num? freeWithdrawalsPerDay;

  /// 剩余免费提款次数
  num? withdrawCount;

  /// 免费手续费截至时间，手续费免费的时候用
  num? freeFeeTime;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'currency': currency,
        'availQuota': availQuota,
        'balance': balance,
        'withdrawQuota': withdrawQuota,
        'freezeAmount': freezeAmount,
        'todayQuota': todayQuota,
        'usedQuota': usedQuota,
        'canUseQuota': canUseQuota,
        'totalHandlingFee': totalHandlingFee,
        'paymentHandlingFee': paymentHandlingFee,
        'withdrawalFeeProportion': withdrawalFeeProportion,
        'perFeeLimit': perFeeLimit,
        'freeWithdrawalsPerDay': freeWithdrawalsPerDay,
        'withdrawCount': withdrawCount,
        'freeFeeTime': freeFeeTime,
      };
}
