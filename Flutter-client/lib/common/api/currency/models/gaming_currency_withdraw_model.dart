import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingCurrencyWithdrawToVirtualModel {
  GamingCurrencyWithdrawToVirtualModel({
    this.orderId,
    this.amount,
    this.fee,
    this.currency,
    this.address,
    this.network,
    this.withdrawCurrency,
    this.coinFee,
  });

  String? orderId;

  num? amount;
  num? fee;

  String? withdrawCurrency;
  String? currency;

  String? network;
  String? address;

  num? coinFee;

  factory GamingCurrencyWithdrawToVirtualModel.fromJson(
          Map<String, dynamic> json) =>
      GamingCurrencyWithdrawToVirtualModel(
        orderId: asT<String?>(json['orderId']),
        amount: asT<num?>(json['amount']),
        fee: asT<num?>(json['fee']),
        currency: asT<String?>(json['currency']),
        address: asT<String?>(json['address']),
        network: asT<String?>(json['network']),
        withdrawCurrency: asT<String?>(json['withdrawCurrency']),
        coinFee: asT<num?>(json['coinFee']),
      );

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'orderId': orderId,
        'amount': amount,
        'fee': fee,
        'currency': currency,
        'address': address,
        'network': network,
        'withdrawCurrency': withdrawCurrency,
        'coinFee': coinFee,
      };
}

class GamingCurrencyWithdrawModel {
  GamingCurrencyWithdrawModel({
    this.orderId,
    this.amount,
    this.fee,
    this.currency,
    this.bankName,
    this.bankAccountNumber,
  });

  String? orderId;

  num? amount;
  num? fee;

  String? currency;

  String? bankName;

  String? bankAccountNumber;

  factory GamingCurrencyWithdrawModel.fromJson(Map<String, dynamic> json) =>
      GamingCurrencyWithdrawModel(
        orderId: asT<String?>(json['orderId']),
        amount: asT<num?>(json['amount']),
        fee: asT<num?>(json['fee']),
        currency: asT<String?>(json['currency']),
        bankName: asT<String?>(json['bankName']),
        bankAccountNumber: asT<String?>(json['bankAccountNumber']),
      );

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'orderId': orderId,
        'amount': amount,
        'fee': fee,
        'currency': currency,
        'bankName': bankName,
        'bankAccountNumber': bankAccountNumber,
      };
}
