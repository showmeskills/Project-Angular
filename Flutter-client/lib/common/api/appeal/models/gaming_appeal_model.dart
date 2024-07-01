import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingAppealModel {
  String? appealId;
  String? orderNumber;
  String currency;
  String? paymentMethod;
  double? fee;
  int? appealTime;
  double? amount;
  String? status;
  String? coinDepositAddress;
  int? processTime;
  String? appealSupplementType;

  String get currencyIconUrl {
    return CurrencyService.sharedInstance.getIconUrl(currency);
  }

  String get amountText {
    return NumberPrecision(amount ?? 0)
        .balanceText(CurrencyService.sharedInstance.isDigital(currency));
  }

  bool get needSupplement {
    return status == 'Supplement';
  }

  String get tips {
    if (status == 'Finish') {
      return localized('supp_doc002');
    } else if (status == 'Supplement') {
      return localized('supp_doc001');
    } else {
      return localized('wait_patient');
    }
  }

  /// * Pending:1 待处理
  /// * Finish:2, 处理完毕
  /// * Supplement:3, 待补充
  /// * Processing:4, 处理中
  /// * Rejected:5, 拒绝申请
  /// * Cancel:6, 取消申请
  /// * TimeOut:7, 已过期
  String get statusText {
    switch (status) {
      case 'Pending':
        return localized('processing');
      case 'Finish':
        return localized('done');
      case 'Supplement':
        return localized('addit_mater00');
      case 'Processing':
        return localized('processing');
      case 'Rejected':
        return localized('reje00');
      case 'Cancel':
        return localized('appli_cancell00');
      case 'TimeOut':
        return localized('reje00');
      default:
        return '';
    }
  }

  GamingAppealModel({
    this.appealId,
    this.orderNumber,
    required this.currency,
    this.paymentMethod,
    this.fee,
    this.appealTime,
    this.amount,
    this.status,
    this.coinDepositAddress,
    this.processTime,
    this.appealSupplementType,
  });

  @override
  String toString() {
    return 'GamingAppealModel(appealId: $appealId, orderNumber: $orderNumber, currency: $currency, paymentMethod: $paymentMethod, fee: $fee, appealTime: $appealTime, amount: $amount, status: $status, coinDepositAddress: $coinDepositAddress, processTime: $processTime, appealSupplementType: $appealSupplementType)';
  }

  factory GamingAppealModel.fromJson(Map<String, Object?> json) {
    return GamingAppealModel(
      appealId: json['appealId'] as String?,
      orderNumber: json['orderNumber'] as String?,
      currency: json['currency'] as String,
      paymentMethod: json['paymentMethod'] as String?,
      fee: (json['fee'] as num?)?.toDouble(),
      appealTime: json['appealTime'] as int?,
      amount: (json['amount'] as num?)?.toDouble(),
      status: json['status'] as String?,
      coinDepositAddress: json['coinDepositAddress'] as String?,
      processTime: json['processTime'] as int?,
      appealSupplementType: json['appealSupplementType'] as String?,
    );
  }

  Map<String, Object?> toJson() => {
        'appealId': appealId,
        'orderNumber': orderNumber,
        'currency': currency,
        'paymentMethod': paymentMethod,
        'fee': fee,
        'appealTime': appealTime,
        'amount': amount,
        'status': status,
        'coinDepositAddress': coinDepositAddress,
        'processTime': processTime,
        'appealSupplementType': appealSupplementType,
      };

  GamingAppealModel copyWith({
    String? appealId,
    String? orderNumber,
    String? currency,
    String? paymentMethod,
    double? fee,
    int? appealTime,
    double? amount,
    String? status,
    String? coinDepositAddress,
    int? processTime,
    String? appealSupplementType,
  }) {
    return GamingAppealModel(
      appealId: appealId ?? this.appealId,
      orderNumber: orderNumber ?? this.orderNumber,
      currency: currency ?? this.currency,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      fee: fee ?? this.fee,
      appealTime: appealTime ?? this.appealTime,
      amount: amount ?? this.amount,
      status: status ?? this.status,
      coinDepositAddress: coinDepositAddress ?? this.coinDepositAddress,
      processTime: processTime ?? this.processTime,
      appealSupplementType: appealSupplementType ?? this.appealSupplementType,
    );
  }
}
