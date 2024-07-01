// ignore_for_file: unused_element

import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';

enum CurrencyCategory {
  deposit('Deposit'),

  withdraw('Withdraw');

  const CurrencyCategory(this.value);
  final String value;
}

enum Currency with GoGamingApi {
  /// 获取所有币种
  ///
  /// type: 0:所有币种(默认）/1:法币/2：虚拟币
  /// category: 存款/提款/所有 Deposit, Withdraw
  /// isSupportVirtualToCurrency: 所有(默认)/true:支持存虚得法/false:不支持存虚得法
  getCurrencies(params: {
    'type': 0,
    'category': null,
    'isSupportVirtualToCurrency': null,
  }),

  /// 换汇率（兑换货币场景使用）
  getExchangeRate(params: {
    'sellCurrency':
        'x', //Available values : Unknown, CNY, USD, THB, VND, AUD, JPY, EUR, GBP, NZD, CAD, KRW, MYR, IDR, INR, BRL, NGN, TWD, BTC, ETH, USDT, TRX, USDC, LTC, DOGE, BCH, XRP, EOS, BNB, BUSD, SHIB, NEO, XEM, ADA, DASH, SOL
    'string': 'Available values : Unknown, CNY, USD, THB, VND, AUD, JPY, EUR,'
  }),

  /// 获取币种汇率
  getFiattoVirtualRate(params: {
    'currency':
        'x:Available values : Unknown, CNY, USD, THB, VND, AUD, JPY, EUR, GBP...',
    'category': 'Available values : CNY, USD'
  }),

  /// 获取币种汇率
  getRate(params: {
    'baseCurrency': 'x',
    'exchangeCurrencies': 'Available values : CNY, USD'
  }),

  getPaymentList(params: {
    'currency': 'x',
    'category': 'Available values : Deposit, Withdraw'
  }),

  /// 获取提款限额
  getQuotaLimit(params: {
    'currencyType': 'x',
  }),

  /// 获取法币对应所有虚拟币汇率（存虚得法使用）
  getFiatToVirtualRate(params: {
    'currency': 'x',
    'category': 'Available values : Deposit, Withdraw'
  }),

  /// 法币提现
  withdrawCurrceny(data: {
    "bankCardId": null, //提款银行卡id
    "key": null, //用户2Fa验证Key
    "walletAddress": null, //钱包地址
    "addressId": null, //地址本Id （提款地址二选一）
    "paymentCode": "支付方式Code",
    "currency": "币种",
    "amount": 0.0,      //提款数量
    "actionType": 0     //支付方式返回的
  }),

  /// 返回电子钱包列表
  geteWalletPaymentList(),

  /// 获取所有虚拟币和网络
  networks(params: {'category': 'Available values : Deposit, Withdraw'});

  const Currency({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Currency.getCurrencies:
        return '/asset/refdata/currencies';
      case Currency.getExchangeRate:
        return '/asset/refdata/getexchangerate';
      case Currency.getRate:
        return '/asset/refdata/getrate';
      case Currency.getFiattoVirtualRate:
        return '/asset/refdata/getfiattovirtualrate';
      case Currency.networks:
        return '/asset/refdata/tokennetworks';
      case Currency.getPaymentList:
        return '/asset/refdata/getpaymentlist';
      case Currency.getQuotaLimit:
        return '/asset/withdraw/getquotalimit';
      case Currency.withdrawCurrceny:
        return '/asset/withdraw/currceny';
      case Currency.getFiatToVirtualRate:
        return '/asset/refdata/getfiattovirtualrate';
      case Currency.geteWalletPaymentList:
        return '/asset/refdata/getewalletpaymentlist';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Currency.getCurrencies:
      case Currency.getExchangeRate:
      case Currency.getRate:
      case Currency.getFiattoVirtualRate:
      case Currency.networks:
      case Currency.getPaymentList:
      case Currency.getQuotaLimit:
      case Currency.getFiatToVirtualRate:
      case Currency.geteWalletPaymentList:
        return HTTPMethod.get;
      case Currency.withdrawCurrceny:
        return HTTPMethod.post;
    }
  }

  @override
  bool get needCache {
    switch (this) {
      case Currency.getCurrencies:
        return true;
      default:
        return false;
    }
  }

  // @override
  // int? get connectTimeout {
  //   switch (this) {
  //     case Currency.getCurrencies:
  //       return 3000;
  //     default:
  //       return null;
  //   }
  // }

  @override
  int? get receiveTimeout {
    switch (this) {
      case Currency.getCurrencies:
        return 5000;
      default:
        return super.receiveTimeout;
    }
  }
}
