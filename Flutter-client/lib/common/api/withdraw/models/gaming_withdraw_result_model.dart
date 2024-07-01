import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingWithdrawResultModel {
  GamingWithdrawResultModel({
    required this.orderId,
    required this.amount,
    required this.fee,
    required this.address,
    required this.currency,
    required this.network,
  });

  factory GamingWithdrawResultModel.fromJson(Map<String, dynamic> json) =>
      GamingWithdrawResultModel(
        orderId: asT<String>(json['orderId'])!,
        amount: asT<double>(json['amount'])!,
        fee: asT<double>(json['fee'])!,
        address: asT<String>(json['address'])!,
        currency: asT<String>(json['currency'])!,
        network: asT<String>(json['network'])!,
      );

  String orderId;
  double amount;
  double fee;
  String address;
  String currency;
  String network;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'orderId': orderId,
        'amount': amount,
        'fee': fee,
        'address': address,
        'currency': currency,
        'network': network,
      };
}
