import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/helper/time_helper.dart';

enum GamingCryptoHistoryModelStatus {
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
  notPassed('NotPassed');

  const GamingCryptoHistoryModelStatus(this.value);
  final String value;
}

class GamingCryptoHistoryModel {
  String currency;
  String category;
  String? orderNum;
  double amount;
  String status;
  String statusName;
  int date;
  String address;
  String network;
  String txid;

  /// 是否申请了卡券 true：是，false：否
  bool isVoucher;
  String get voucherText => isVoucher ? "used" : "unused";

  GamingCryptoHistoryModel({
    required this.currency,
    required this.category,
    this.orderNum,
    required this.amount,
    required this.status,
    this.statusName = '',
    required this.date,
    this.address = '',
    this.network = '',
    this.txid = '',
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
    return 'CryptoHistoryModel(currency: $currency, category: $category, orderNum: $orderNum, amount: $amount, status: $status, statusName: $statusName, date: $date, address: $address, network: $network, txid: $txid, isVoucher: $isVoucher)';
  }

  factory GamingCryptoHistoryModel.fromJson(Map<String, Object?> json) {
    return GamingCryptoHistoryModel(
      currency: GGUtil.parseStr(json['currency']),
      category: GGUtil.parseStr(json['category']),
      orderNum: GGUtil.parseStr(json['orderNum']),
      amount: GGUtil.parseDouble(json['amount']),
      status: GGUtil.parseStr(json['status']),
      statusName: GGUtil.parseStr(json['statusName']),
      date: GGUtil.parseInt(json['date']),
      address: GGUtil.parseStr(json['address']),
      network: GGUtil.parseStr(json['network']),
      txid: GGUtil.parseStr(json['txid']),
      isVoucher: GGUtil.parseBool(json['isVoucher']),
    );
  }

  Map<String, Object?> toJson() => {
        'currency': currency,
        'category': category,
        'orderNum': orderNum,
        'amount': amount,
        'status': status,
        'statusName': statusName,
        'date': date,
        'address': address,
        'network': network,
        'txid': txid,
      };

  GamingCryptoHistoryModel copyWith({
    String? currency,
    String? category,
    String? orderNum,
    double? amount,
    String? status,
    String? statusName,
    int? date,
    String? address,
    String? network,
    String? txid,
  }) {
    return GamingCryptoHistoryModel(
      currency: currency ?? this.currency,
      category: category ?? this.category,
      orderNum: orderNum ?? this.orderNum,
      amount: amount ?? this.amount,
      status: status ?? this.status,
      statusName: statusName ?? this.statusName,
      date: date ?? this.date,
      address: address ?? this.address,
      network: network ?? this.network,
      txid: txid ?? this.txid,
    );
  }
}
