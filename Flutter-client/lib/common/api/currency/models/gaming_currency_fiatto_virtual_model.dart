import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingCurrencyVirtualModel {
  GamingCurrencyVirtualModel({
    required this.rateId,
    required this.expireTimestamp,
    required this.baseCurrency,
    required this.rates,
  });

  factory GamingCurrencyVirtualModel.fromJson(Map<String, dynamic> json) {
    final List<Rates>? rates = json['rates'] is List ? <Rates>[] : null;
    if (rates != null) {
      for (final dynamic item in json['rates']! as List) {
        if (item != null) {
          rates.add(Rates.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GamingCurrencyVirtualModel(
      rateId: asT<String>(json['rateId'])!,
      expireTimestamp: asT<int>(json['expireTimestamp'])!,
      baseCurrency: asT<String>(json['baseCurrency'])!,
      rates: rates!,
    );
  }

  String rateId;
  int expireTimestamp;
  String baseCurrency;
  List<Rates> rates;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'rateId': rateId,
        'expireTimestamp': expireTimestamp,
        'baseCurrency': baseCurrency,
        'rates': rates,
      };
}

class Rates {
  Rates({
    required this.rate,
    required this.currency,
  });

  factory Rates.fromJson(Map<String, dynamic> json) => Rates(
        rate: asT<double>(json['rate'])!,
        currency: asT<String>(json['currency'])!,
      );

  double rate;
  String currency;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'rate': rate,
        'currency': currency,
      };
}
