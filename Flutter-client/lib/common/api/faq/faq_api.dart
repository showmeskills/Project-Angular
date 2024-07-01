// ignore_for_file: unused_element

import '../base/base_api.dart';

enum FaqTag {
  legalCurrencyRecharge('LegalCurrencyRecharge'),
  legalWithdrawalLegal('LegalWithdrawalLegal'),
  digitalCurrencyRecharge('DigitalCurrencyRecharge'),
  digitalCurrencyWithdrawal('DigitalCurrencyWithdrawal'),
  purchase('Purchase'),
  convert('Convert'),
  home('Home'),
  hot('Hot'),
  general('General'),
  newUser('NewUser'),
  limitDate('LimitDate'),
  vipUser('VipUser'),
  contest('Contest'),
  guessing('Guessing');

  const FaqTag(this.value);
  final String value;
}

enum Faq with GoGamingApi {
  getArticleByTag(params: {
    'ClientType': 'Available values : Web, App',
    'Tag':
        'Available values : LegalCurrencyRecharge, LegalWithdrawalLegal, DigitalCurrencyRecharge, DigitalCurrencyWithdrawal, Purchase, Convert, Home, Hot, General, NewUser, LimitDate, VipUser, Contest, Guessing',
  });

  const Faq({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final Map<String, dynamic>? data;

  @override
  String get path {
    switch (this) {
      case Faq.getArticleByTag:
        return '/article/faq/getarticlebytag';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Faq.getArticleByTag:
        return HTTPMethod.get;
    }
  }

  @override
  bool get needCache {
    return true;
  }
}
