// ignore_for_file: unused_element

import '../base/base_api.dart';

enum History with GoGamingApi {
  /// 获取历史记录的状态,用于筛选
  getHistoryStatus(params: {
    'isDeposit': true, // true 存款， false 取款
  }),

  /// 划转钱包选择
  getTransferWalletSelect(),

  /// 获取红利发放方式
  getGrantTypeSelect(),

  /// 获取佣金类型
  /// Commission 佣金返还 : Recommend 推荐返还: Alliance 联盟佣金
  getCommissionType(),

  /// 时间格式    1669651200000
  /// Status 全部-1 成功0 失败 1
  /// 划转记录
  getTransferHistory(params: {
    'FromWallet': 'Main',
    'ToWallet': null,
    'StartTime': null,
    'EndTime': null,
    'Status': null,
    'PageIndex': null,
    'PageSize': null,
    'Currency': null,
  }),

  /// 获取红利列表
  getBonusGrantList(params: {
    'GrantType': null,
    'Currency': null,
    'StartTime': null,
    'EndTime': null,
    'PageIndex': null,
    'PageSize': null,
  }),

  /// 获取调账
  /// Status 全部0 添加 1 扣减 2
  getAdjustList(params: {
    "Category": 'WithdrawLimit : Main',
    "Status": null,
    "StartTime": null,
    "EndTime": null,
    "PageIndex": null,
    "PageSize": null,
    "Currency": null
  }),

  /// 获取佣金历史记录
  getCommissionHistory(params: {
    "ReturnType": 'Commission : Recommend : Alliance', //全部的话，传空
    "StartTime": null,
    "EndTime": null,
    "PageIndex": null,
    "PageSize": null,
  }),

  crypto(params: {
    'category': 'Available values : Deposit,Withdraw',
    'StartTime': null,
    'EndTime': null,
    'Currency': null,
    'OrderStatus': null,
    'PageIndex': null,
    'PageSize': null,
  }),

  currency(params: {
    'category': 'Available values : Deposit,Withdraw',
    'StartTime': null,
    'EndTime': null,
    'Currency': null,
    'OrderStatus': null,
    'PageIndex': null,
    'PageSize': null,
  }),

  // 判断用户是否有成功的存款订单
  hasDepositTx(params: {
    'isDigital': null, //true：虚拟货币首存，false:法币首存，null：不区分
  }),

  loginHistory(params: {
    'start': 0,
    'end': 0,
    'pageIndex': 1,
    'pageSize': 10,
  }),
  operationHistory(params: {
    'start': 0,
    'end': 0,
    'status': 0,
    'pageIndex': 1,
    'pageSize': 10,
  });

  const History({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case History.crypto:
        return '/asset/history/cointx';
      case History.currency:
        return '/asset/history/currencytx';
      case History.getHistoryStatus:
        return '/asset/history/status';
      case History.getTransferWalletSelect:
        return '/asset/history/transferwalletselect';
      case History.getTransferHistory:
        return '/asset/history/transfer';
      case History.getGrantTypeSelect:
        return '/asset/bonus/getgranttypeselect';
      case History.getBonusGrantList:
        return '/asset/bonus/getbonusgrantlist';
      case History.getAdjustList:
        return '/asset/history/adjusttx';
      case History.getCommissionType:
        return '/asset/wallet/getreturntypeselect';
      case History.getCommissionHistory:
        return '/asset/wallet/getcommissionhistory';
      case History.loginHistory:
        return '/member/history/loginhistory';
      case History.operationHistory:
        return '/member/history/operationhistory';
      case History.hasDepositTx:
        return '/asset/history/hasdeposittx';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case History.crypto:
      case History.currency:
      case History.getHistoryStatus:
      case History.getTransferWalletSelect:
      case History.getTransferHistory:
      case History.getGrantTypeSelect:
      case History.getBonusGrantList:
      case History.getAdjustList:
      case History.getCommissionType:
      case History.getCommissionHistory:
      case History.loginHistory:
      case History.operationHistory:
      case History.hasDepositTx:
        return HTTPMethod.get;
    }
  }
}
