// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Deposit with GoGamingApi {
  currency(data: {
    'amount': 0.0,
    'paymentCode': 'string',
    'currency': 'Unknown',
    'actionType': 0,
    'userName': null,
    'bankCode': null,
    'activityNo': null,
    'callbackUrl': null,
  }),

  /// 存虚得法
  // code=2061, 存款金额超出当日限额
  // code=2072, 没有可用支付方式信息，提示用户更换虚拟货币存款
  // code=2110, 汇率过期，提示用户汇率更新
  toCurrency(data: {
    "amount": 0.0,
    "paymentCode": "string",
    "currency": "Unknown",
    "paymentCurrency": "Unknown",
    "network": "BTC",
    "rateId": "string",
    "actionType": 0,
    "activityNo": null
  }),

  depositAddress(params: {
    'currency': 'x',
    'network': 'x',
  }),

  /// 获取信用卡买币链接
  currencyPurchase(params: {
    "currency": 'fromCurrency',
    "token": 'toToken',
    'amount': 0.0,
  }),

  /// 充值订单状态
  orderStateInfo(params: {
    'orderId': 'string',
  });

  const Deposit({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Deposit.depositAddress:
        return '/asset/deposit/depositaddress';
      case Deposit.currency:
        return '/asset/deposit/currency';
      case Deposit.orderStateInfo:
        return '/asset/deposit/getorderstateinfo';
      case Deposit.currencyPurchase:
        return '/asset/deposit/currencypurchase';
      case Deposit.toCurrency:
        return '/asset/deposit/tocurrency';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Deposit.depositAddress:
      case Deposit.orderStateInfo:
      case Deposit.currencyPurchase:
        return HTTPMethod.get;
      case Deposit.currency:
      case Deposit.toCurrency:
        return HTTPMethod.post;
    }
  }
}
