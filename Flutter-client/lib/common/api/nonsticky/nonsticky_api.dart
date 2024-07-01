// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Nonsticky with GoGamingApi {
  /// 激活奖金
  activatewallet(data: {
    'code': null,
  }),

  /// 放弃奖金
  cancelwallet(data: {
    'code': null,
  }),

  /// 提现奖金
  withdrawwallet(data: {
    'code': null,
  }),

  /// 一键提取非粘性奖金
  batchwithdrawwallet(),

  /// 奖金总览
  walletoverview(),

  /// 获取已激活的非粘性奖金
  getactivated(),

  /// 获取未激活的非粘性奖金
  getlist(),

  /// 获取非粘性奖金条款
  getdetail(data: {
    'code': null,
    'isDeposit': null,
    'isFreeSpin': null,
    'category': null,
  }),

  /// 获取总数
  getcount();

  const Nonsticky({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Nonsticky.activatewallet:
        return '/asset/nonsticky/activatewallet';
      case Nonsticky.cancelwallet:
        return '/asset/nonsticky/cancelwallet';
      case Nonsticky.withdrawwallet:
        return '/asset/nonsticky/withdrawwallet';
      case Nonsticky.batchwithdrawwallet:
        return '/asset/nonsticky/batchwithdrawwallet';
      case Nonsticky.walletoverview:
        return '/asset/nonsticky/walletoverview';
      case Nonsticky.getactivated:
        return '/asset/nonsticky/getactivated';
      case Nonsticky.getlist:
        return '/asset/nonsticky/getlist';
      case Nonsticky.getdetail:
        return '/asset/nonsticky/getdetail';
      case Nonsticky.getcount:
        return '/asset/nonsticky/getcount';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Nonsticky.walletoverview:
      case Nonsticky.getcount:
        return HTTPMethod.get;

      case Nonsticky.activatewallet:
      case Nonsticky.cancelwallet:
      case Nonsticky.withdrawwallet:
      case Nonsticky.batchwithdrawwallet:
      case Nonsticky.getactivated:
      case Nonsticky.getlist:
      case Nonsticky.getdetail:
        return HTTPMethod.post;
    }
  }
}
