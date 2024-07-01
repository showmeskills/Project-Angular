// ignore_for_file: unused_element

import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';

enum Wallet with GoGamingApi {
  /// 清除提款限额
  clearWithdrawalLimit(),

  /// 获取可以进行 清除提款限额 的币种
  getClearWithdrawal(),

  /// 判断是否允许提款
  allowWithdrawal(),

  /// 清除抵用券
  clearCredit(),

  /// 钱包总览
  overview(),

  /// 主钱包
  mainWallet(),

  /// 钱包划转列表
  transferWalletList(),

  /// 用户所有币种余额
  userBalance(),

  /// 划转
  transferWallet(data: {
    "fromWalletCategory": "Main",
    "toWalletCategory": "Main",
    "currency": "Unknown",
    "providerId": "string",
    "amount": 0.0
  }),

  /// 取消法币提款订单
  // withdraw/cancelcurrency
  cancelCurrency(data: {
    "orderNum": "12",
  }),

  /// 验证用户是否可以使用支付方式
  checkPaymentAvail(params: {
    'code': 'x',
    'currencyType': 'x',
    'category': 'x',
  }),

  /// 获取转账钱包余额
  transerWalletBalance(params: {
    'platformGroupCode': 'x',
    'currency': 'USDT',
  }),

  /// 负值清零申请
  applyClearNegative(data: {'currency': '币种'}),
  gameWalletHistory(params: {
    'providerId': 'x',
    'pageIndex': 1,
    'pageSize': 10,
  });

  const Wallet({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Wallet.overview:
        return '/asset/wallet/overview';
      case Wallet.mainWallet:
        return '/asset/wallet/mainwallet';
      case Wallet.transferWalletList:
        return '/asset/wallet/gettransferwallet';
      case Wallet.userBalance:
        return '/asset/wallet/userbalance';
      case Wallet.transerWalletBalance:
        return '/asset/wallet/transerwalletbalance';
      case Wallet.transferWallet:
        return '/asset/wallet/transferwallet';
      case Wallet.checkPaymentAvail:
        return '/asset/wallet/checkpaymentavail';
      case Wallet.clearWithdrawalLimit:
        return '/asset/wallet/clearwithdrawallimit';
      case Wallet.getClearWithdrawal:
        return '/asset/wallet/getclearwithdrawallimitcurrency';
      case Wallet.allowWithdrawal:
        return '/asset/wallet/allowwithdrawal';
      case Wallet.clearCredit:
        return '/asset/wallet/clearcredit';
      case Wallet.gameWalletHistory:
        return '/asset/wallet/gamewallethistory';
      case Wallet.cancelCurrency:
        return '/asset/withdraw/cancelcurrency';
      case Wallet.applyClearNegative:
        return '/member/negativeclear/apply';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Wallet.overview:
      case Wallet.mainWallet:
      case Wallet.transferWalletList:
      case Wallet.userBalance:
      case Wallet.transerWalletBalance:
      case Wallet.checkPaymentAvail:
      case Wallet.getClearWithdrawal:
      case Wallet.allowWithdrawal:
      case Wallet.gameWalletHistory:
        return HTTPMethod.get;
      case Wallet.transferWallet:
      case Wallet.clearCredit:
      case Wallet.clearWithdrawalLimit:
      case Wallet.cancelCurrency:
      case Wallet.applyClearNegative:
        return HTTPMethod.post;
    }
  }
}
