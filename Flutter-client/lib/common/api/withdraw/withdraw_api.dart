// ignore_for_file: unused_element

import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';

enum Withdraw with GoGamingApi {
  /// 提现
  withdraw(data: {
    "address": null, //提款地址（地址本Id二选一）
    "addressId": null, //地址本Id （提款地址二选一）
    "amount": 0.0,
    "currency": "BUSD",
    "network": "string",
    "key": "string",
  }),

  /// 提法得虚提款
  currcencyToCoin(data: {
    "key": 'x',
    "paymentCode": "x",
    "currency": "x",
    "amount": 0.0,
    "withdrawCurrency": "x",
    "network": null,
    "address": null,
    "addressId": null,
    "rateId": "x",
    "actionType": 0
  }),

  /// 查看限制
  getQuotaLimit(params: {
    'currencyType': 'USDT',
  }),

  /// 检查是否可以提款成功 true:弹窗提示不可提款, false:不弹窗,可以继续提款
  riskformVerify();

  const Withdraw({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Withdraw.withdraw:
        return '/asset/withdraw/coin';
      case Withdraw.getQuotaLimit:
        return '/asset/withdraw/getquotalimit';
      case Withdraw.currcencyToCoin:
        return '/asset/withdraw/currcencytocoin';
      case Withdraw.riskformVerify:
        return '/asset/withdraw/riskformverify';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Withdraw.getQuotaLimit:
        return HTTPMethod.get;
      case Withdraw.withdraw:
      case Withdraw.currcencyToCoin:
      case Withdraw.riskformVerify:
        return HTTPMethod.post;
    }
  }
}
