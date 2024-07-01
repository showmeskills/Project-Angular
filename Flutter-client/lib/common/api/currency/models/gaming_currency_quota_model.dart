import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingCurrencyQuotaModel {
  GamingCurrencyQuotaModel({
    this.currency,
    this.availQuota,
    this.balance,
    this.withdrawQuota,
    this.freezeAmount,
    this.todayQuota,
    this.usedQuota,
    this.canUseQuota,
    this.totalHandlingFee,
    this.paymentHandlingFee,
    this.withdrawalFeeProportion,
    this.perFeeLimit,
    this.freeWithdrawalsPerDay,
    this.withdrawCount,
    this.freeFeeTime,
  });

  /// 币种
  String? currency;

  /// 可用金额（单位选择的币种）
  num? availQuota;

  /// 余额（查询币种的余额）
  num? balance;

  /// 提款限额(单位选择的币种）
  num? withdrawQuota;

  /// 锁定金额（选择的币种锁定金额）
  num? freezeAmount;

  /// 当日限额(USDT)
  num? todayQuota;
  bool get todayUnlimited => -1 == todayQuota;

  /// 已使用额度（等于今日总的已提款金额）（USDT)
  num? usedQuota;

  /// 可提款金额（单位选择的币种）
  num? canUseQuota;

  /// 总提款手续费（没有扣减的手续费）
  num? totalHandlingFee;

  /// 实际提款手续费（扣减后的手续费）
  num? paymentHandlingFee;

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
  /// planb是否免手续费
  bool get isPlanBFreeWithdrawalFee =>
      (withdrawalFeeProportion != null && withdrawalFeeProportion == 0) ||
      (withdrawCount ?? 0) > 0;

  factory GamingCurrencyQuotaModel.fromJson(Map<String, dynamic> json) =>
      GamingCurrencyQuotaModel(
        currency: asT<String?>(json['currency']),
        availQuota: asT<num?>(json['availQuota']),
        balance: asT<num?>(json['balance']),
        withdrawQuota: asT<num?>(json['withdrawQuota']),
        freezeAmount: asT<num?>(json['freezeAmount']),
        todayQuota: asT<num?>(json['todayQuota']),
        usedQuota: asT<num?>(json['usedQuota']),
        canUseQuota: asT<num?>(json['canUseQuota']),
        totalHandlingFee: asT<num?>(json['totalHandlingFee']),
        paymentHandlingFee: asT<num?>(json['paymentHandlingFee']),
        withdrawalFeeProportion: asT<num?>(json['withdrawalFeeProportion']),
        perFeeLimit: asT<num?>(json['perFeeLimit']),
        freeWithdrawalsPerDay: asT<num?>(json['freeWithdrawalsPerDay']),
        withdrawCount: asT<num?>(json['withdrawCount']),
        freeFeeTime: asT<num?>(json['freeFeeTime']),
      );

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
