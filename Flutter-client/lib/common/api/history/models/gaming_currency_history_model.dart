import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/helper/time_helper.dart';

enum GamingCurrencyHistoryModelStatus {
  unknown('Unknown'),
  success('Success'),
  fail('Fail'),
  created('Created'),
  waiting('Waiting'),
  timeout('Timeout'),
  cancel('Cancel'),
  canceled('Canceled'),
  process('Process'),
  review('Review'),
  passed('Passed'),
  notPassed('NotPassed'),
  userCanceled('UserCanceled'),
  sysCanceled('SysCanceled');

  const GamingCurrencyHistoryModelStatus(this.value);
  final String value;
}

class GamingCurrencyHistoryModel {
  String currency;
  String category;
  String? orderNum;
  double amount;
  // 实际手续费
  double fee;
  // 虚拟币手续费（虚法使用）
  double coinFee;
  // 虚拟币金额（虚法使用）
  double coinAmount;
  // CurrencyType（虚法使用）
  String token;
  // 手续费减免
  double feeWaiver;
  // 到账金额
  double receiveAmount;

  String status;
  String statusName;
  int date;
  String paymentMethod;
  // 失败原因(人工取消时的原因) 0:其他原因 1:客户申请取消 2:出款失败
  int failReason;

  /// 是否申请了卡券 true：是，false：否
  bool isVoucher;
  String get voucherText => isVoucher ? "used" : "unused";

  String get amountText => NumberPrecision(amount).balanceText(false);

  GamingCurrencyHistoryModel({
    required this.currency,
    required this.category,
    this.orderNum,
    required this.amount,
    required this.status,
    required this.fee,
    required this.coinFee,
    required this.coinAmount,
    required this.token,
    required this.feeWaiver,
    required this.receiveAmount,
    this.statusName = '',
    required this.date,
    required this.paymentMethod,
    required this.failReason,
    this.isVoucher = false,
  });

  String get iconUrl {
    return CurrencyService.sharedInstance.getIconUrl(currency);
  }

  String get timeToMM {
    String format = "yyyy-MM-dd HH:mm";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(date);
    return DateFormat(format).format(aTime).toString();
  }

  String get timeToSS {
    String format = "yyyy-MM-dd HH:mm:ss";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(date);
    return DateFormat(format).format(aTime).toString();
  }

  bool get isDigital {
    return CurrencyService.sharedInstance.isDigital(currency);
  }

  @override
  String toString() {
    return 'GamingCurrencyHistoryModel{currency: $currency, category: $category, orderNum: $orderNum, amount: $amount, fee: $fee, feeWaiver: $feeWaiver, receiveAmount: $receiveAmount, status: $status, statusName: $statusName, date: $date, paymentMethod: $paymentMethod, isVoucher: $isVoucher}';
  }

  factory GamingCurrencyHistoryModel.fromJson(Map<String, Object?> json) {
    return GamingCurrencyHistoryModel(
      currency: GGUtil.parseStr(json['currency']),
      category: GGUtil.parseStr(json['category']),
      orderNum: GGUtil.parseStr(json['orderNum']),
      amount: (json['amount'] as num).toDouble(),
      fee: GGUtil.parseDouble(json['fee']),
      coinFee: GGUtil.parseDouble(json['coinFee']),
      coinAmount: GGUtil.parseDouble(json['coinAmount']),
      token: GGUtil.parseStr(json['token']),
      feeWaiver: GGUtil.parseDouble(json['feeWaiver']),
      receiveAmount: GGUtil.parseDouble(json['receiveAmount']),
      status: GGUtil.parseStr(json['status']),
      statusName: GGUtil.parseStr(json['statusName']),
      date: GGUtil.parseInt(json['date']),
      paymentMethod: GGUtil.parseStr(json['paymentMethod']),
      failReason: GGUtil.parseInt(json['failReason']),
      isVoucher: GGUtil.parseBool(json['isVoucher']),
    );
  }

  Map<String, Object?> toJson() => {
        'currency': currency,
        'category': category,
        'orderNum': orderNum,
        'amount': amount,
        'fee': fee,
        'coinFee': coinFee,
        'coinAmount': coinAmount,
        'token': token,
        'feeWaiver': feeWaiver,
        'receiveAmount': receiveAmount,
        'status': status,
        'statusName': statusName,
        'date': date,
        'paymentMethod': paymentMethod,
        'failReason': failReason
      };

  GamingCurrencyHistoryModel copyWith({
    String? currency,
    String? category,
    String? orderNum,
    double? amount,
    double? fee,
    double? coinFee,
    double? coinAmount,
    String? token,
    double? feeWaiver,
    double? receiveAmount,
    String? status,
    String? statusName,
    int? date,
    String? paymentMethod,
    int? failReason,
  }) {
    return GamingCurrencyHistoryModel(
      currency: currency ?? this.currency,
      category: category ?? this.category,
      orderNum: orderNum ?? this.orderNum,
      amount: amount ?? this.amount,
      fee: fee ?? this.fee,
      coinFee: coinFee ?? this.coinFee,
      coinAmount: coinAmount ?? this.coinFee,
      token: token ?? this.token,
      feeWaiver: feeWaiver ?? this.feeWaiver,
      receiveAmount: receiveAmount ?? this.receiveAmount,
      status: status ?? this.status,
      statusName: statusName ?? this.statusName,
      date: date ?? this.date,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      failReason: failReason ?? this.failReason,
    );
  }
}
