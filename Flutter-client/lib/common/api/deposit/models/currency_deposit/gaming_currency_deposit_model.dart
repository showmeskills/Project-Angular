import 'dart:math';

import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';

import 'gaming_deposit_bank_info_model.dart';

class GamingCurrencyDepositModel {
  /// * [statue] 创建订单是否成功
  /// * 1、创建成功，金额是输入金额
  /// * 2、创建成功，金额调整为建议金额
  /// * 3、上一笔订单未完成，返回上一笔订单信息
  /// * 4、多笔订单未支付，需要等待N分钟才能操作
  /// * 5、创建订单失败，提示用户更改虚拟货币存款
  /// * 6、您所选的银行暂时不可用，请更换银行后重试
  /// * 7. 上一笔交易还在处理中(请求PSP)，需要间隔10秒重新请求
  int statue;
  int limitMinute;
  int canUseTime;
  String? orderId;
  double amount;
  String currency;
  String paymentCode;
  int createTime;
  int expireTime;
  int actionType;
  GamingDepositBankInfoModel? bankInfo;
  String? html;
  String? redirectUrl;
  String? remark;

  String get amountText {
    return NumberPrecision(amount).balanceText(false);
  }

  bool get statueSuccess => statue == 1 || statue == 2 || statue == 3;

  bool get isWaiting => statue == 7;

  /// actionType = 3 电子钱包类（需要提交redirectUrl）
  bool get isEWallet => actionType == 3;

  /// actionType = 2，需要提交redirectUrl 和 bankCode
  bool get isHtmlOnlineBank => actionType == 2;

  /// actionType = 2，需要提交userName
  bool get isBankTransfer => actionType == 1;

  String? get statueMessage {
    switch (statue) {
      case 2:
        return localized('kyc_succ00');
      case 4:
        final canUseDate = DateTime.fromMillisecondsSinceEpoch(canUseTime);
        final now = DateTime.now();
        return localized('kyc_succ01',
            params: ['${max(1, canUseDate.difference(now).inMinutes)}']);
      case 5:
        return localized('pay_channel_busy_d');
      case 6:
        return localized('kyc_succ04');
      case 7:
        return "${localized('tp_w_p_a1')}\n${localized('tp_w_p_a2')}";
      default:
        return localized('sub_com');
    }
  }

  GamingCurrencyDepositModel({
    required this.statue,
    this.limitMinute = 0,
    this.canUseTime = 0,
    this.orderId,
    required this.amount,
    required this.currency,
    required this.paymentCode,
    required this.createTime,
    this.expireTime = 0,
    required this.actionType,
    this.bankInfo,
    this.html,
    this.redirectUrl,
    this.remark,
  });

  @override
  String toString() {
    return 'GamingCurrencyDepositModel(statue: $statue, limitMinute: $limitMinute, canUseTime: $canUseTime, orderId: $orderId, amount: $amount, currency: $currency, paymentCode: $paymentCode, createTime: $createTime, expireTime: $expireTime, actionType: $actionType, bankInfo: $bankInfo, html: $html, redirectUrl: $redirectUrl, remark: $remark)';
  }

  factory GamingCurrencyDepositModel.fromJson(Map<String, Object?> json) {
    return GamingCurrencyDepositModel(
      statue: json['statue'] as int,
      limitMinute: json['limitMinute'] as int,
      canUseTime: json['canUseTime'] as int,
      orderId: json['orderId'] as String?,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String,
      paymentCode: json['paymentCode'] as String,
      createTime: json['createTime'] as int,
      expireTime: json['expireTime'] as int,
      actionType: json['actionType'] as int,
      bankInfo: json['bankInfo'] == null
          ? null
          : GamingDepositBankInfoModel.fromJson(
              json['bankInfo']! as Map<String, Object?>),
      html: json['html'] as String?,
      redirectUrl: json['redirectUrl'] as String?,
      remark: json['remark'] as String?,
    );
  }

  Map<String, Object?> toJson() => {
        'statue': statue,
        'limitMinute': limitMinute,
        'canUseTime': canUseTime,
        'orderId': orderId,
        'amount': amount,
        'currency': currency,
        'paymentCode': paymentCode,
        'createTime': createTime,
        'expireTime': expireTime,
        'actionType': actionType,
        'bankInfo': bankInfo?.toJson(),
        'html': html,
        'redirectUrl': redirectUrl,
        'remark': remark,
      };

  GamingCurrencyDepositModel copyWith({
    int? statue,
    int? limitMinute,
    int? canUseTime,
    String? orderId,
    double? amount,
    String? currency,
    String? paymentCode,
    int? createTime,
    int? expireTime,
    int? actionType,
    GamingDepositBankInfoModel? bankInfo,
    String? html,
    String? redirectUrl,
    String? remark,
  }) {
    return GamingCurrencyDepositModel(
      statue: statue ?? this.statue,
      limitMinute: limitMinute ?? this.limitMinute,
      canUseTime: canUseTime ?? this.canUseTime,
      orderId: orderId ?? this.orderId,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      paymentCode: paymentCode ?? this.paymentCode,
      createTime: createTime ?? this.createTime,
      expireTime: expireTime ?? this.expireTime,
      actionType: actionType ?? this.actionType,
      bankInfo: bankInfo ?? this.bankInfo,
      html: html ?? this.html,
      redirectUrl: redirectUrl ?? this.redirectUrl,
      remark: remark ?? this.remark,
    );
  }
}
