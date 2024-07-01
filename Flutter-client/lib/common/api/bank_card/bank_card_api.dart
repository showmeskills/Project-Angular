// ignore_for_file: unused_element

import '../base/base_api.dart';

enum BankCard with GoGamingApi {
  delete(data: {
    'id': 0,
    'key': 'x',
  }),
  batchDelete(data: {
    'ids': [0],
    'key': 'x',
  }),
  updateDefault(data: {
    'id': 0,
  }),
  getBankCard(),
  add(data: {
    'currencyType': 'Unknown',
    'name': 'string',
    'bankCode': 'string',
    'cardNum': 'string',
    'key': 'string',
  }),
  getSystemBank(params: {
    'currency': 'x',
  }),
  getDepositBankCard(params: {
    'currency': 'x',
    'paymentCode': 'x',
  }),
  verifyInfo(data: {
    'currencyType': 'x',
    'cardNum': 'x',
  });

  const BankCard({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case BankCard.getBankCard:
        return '/asset/bankcard/getbankcard';
      case BankCard.delete:
        return '/asset/bankcard/deletebankcard';
      case BankCard.batchDelete:
        return '/asset/bankcard/batchdeletebankcard';
      case BankCard.updateDefault:
        return '/asset/bankcard/updatedefault';
      case BankCard.getSystemBank:
        return '/asset/bankcard/getsystembank';
      case BankCard.add:
        return '/asset/bankcard/addbankcard';
      case BankCard.getDepositBankCard:
        return '/asset/bankcard/getdepositbankcard';
      case BankCard.verifyInfo:
        return '/asset/bankcard/getbankcardverifyinfo';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case BankCard.getBankCard:
      case BankCard.getSystemBank:
      case BankCard.getDepositBankCard:
        return HTTPMethod.get;
      case BankCard.delete:
      case BankCard.batchDelete:
      case BankCard.updateDefault:
      case BankCard.add:
      case BankCard.verifyInfo:
        return HTTPMethod.post;
    }
  }
}
