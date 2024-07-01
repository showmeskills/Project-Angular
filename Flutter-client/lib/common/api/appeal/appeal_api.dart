// ignore_for_file: unused_element

import '../base/base_api.dart';

enum Appeal with GoGamingApi {
  list(params: {
    'page': 1,
    'pageSize': 10,
  }),
  checkTXIDExists(params: {
    'currency': 'x',
    'txId': 'x',
  }),
  depositByCoin(data: {
    'currency': 'Unknown',
    'amount': 0.0,
    'network': 'BTC',
    'txId': 'string'
  }),
  getTxInfo(params: {
    'orderNum': 'x',
  }),
  depositByCurrency(data: {
    'orderNum': 'string',
    'amount': 0.0,
    'images': <String>[],
    'desc': null
  }),
  updateCurrencyDepositOrder(data: {
    'appealId': 'string',
    'isCancel': false,
    'video': null,
    'amount': 0.0,
    'images': <String>[],
    'desc': null
  }),
  getCurrencyDepositById(params: {
    'appealId': 'x',
  });

  const Appeal({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Appeal.list:
        return '/asset/appeal/list';
      case Appeal.checkTXIDExists:
        return '/asset/appeal/checktxidexists';
      case Appeal.depositByCoin:
        return '/asset/appeal/depositbycoin';
      case Appeal.getTxInfo:
        return '/asset/appeal/gettxinfo';
      case Appeal.depositByCurrency:
        return '/asset/appeal/depositbycurrency';
      case Appeal.updateCurrencyDepositOrder:
        return '/asset/appeal/updatecurrencydepositorder';
      case Appeal.getCurrencyDepositById:
        return '/asset/appeal/getcurrencydepositbyid';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Appeal.list:
      case Appeal.checkTXIDExists:
      case Appeal.getTxInfo:
      case Appeal.getCurrencyDepositById:
        return HTTPMethod.get;
      case Appeal.depositByCoin:
      case Appeal.depositByCurrency:
      case Appeal.updateCurrencyDepositOrder:
        return HTTPMethod.post;
    }
  }
}
