import 'dart:convert';

/// 历史记录 - 充值model

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class WalletHistoryDepositModel {
  WalletHistoryDepositModel({
    required this.total,
    required this.list,
  });

  factory WalletHistoryDepositModel.fromJson(Map<String, dynamic> json) {
    final List<WalletHistoryDepositModelDetail> list =
        json['list'] is List ? <WalletHistoryDepositModelDetail>[] : [];
    for (final dynamic item in json["list"] as List) {
      if (item != null) {
        list.add(WalletHistoryDepositModelDetail.fromJson(
            asT<Map<String, dynamic>>(item)!));
      }
    }

    return WalletHistoryDepositModel(
      total: asT<int>(json['total'])!,
      list: list,
    );
  }

  int total;
  List<WalletHistoryDepositModelDetail> list;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'total': total,
        'list': list,
      };
}

class WalletHistoryDepositModelDetail {
  WalletHistoryDepositModelDetail({
    required this.currency,
    required this.category,
    required this.orderNum,
    required this.amount,
    required this.status,
    required this.statusName,
    required this.date,
    required this.address,
    required this.network,
    required this.txId,
  });

  factory WalletHistoryDepositModelDetail.fromJson(Map<String, dynamic> json) =>
      WalletHistoryDepositModelDetail(
        currency: asT<String>(json['currency'])!,
        category: asT<String>(json['category'])!,
        orderNum: asT<String>(json['orderNum'])!,
        amount: asT<double>(json['amount'])!,
        status: asT<String>(json['status'])!,
        statusName: asT<String>(json['statusName'])!,
        date: asT<int>(json['date'])!,
        address: asT<String>(json['address'])!,
        network: asT<String>(json['network'])!,
        txId: asT<String>(json['txid'])!,
      );

  String currency;
  String category;
  String orderNum;
  double amount;
  String status;
  String statusName;
  int date;
  String address;
  String network;
  String txId;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'currency': currency,
        'category': category,
        'orderNum': orderNum,
        'amount': amount,
        'status': status,
        'statusName': statusName,
        'date': date,
        'address': address,
        'network': network,
        'txid': txId,
      };
}
