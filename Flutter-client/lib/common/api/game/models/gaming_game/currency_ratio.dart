import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingGameCurrencyRatio {
  String? currency;
  num? ratio;
  int? sort;
  GamingGameCurrencyRatio({this.currency, this.ratio, this.sort});

  @override
  String toString() => 'CurrencyRatio(currency: $currency, ratio: $ratio)';

  factory GamingGameCurrencyRatio.fromJson(Map<String, Object?> json) =>
      GamingGameCurrencyRatio(
          currency: asT<String>(json['currency']),
          ratio: asT<num>(json['ratio']),
          sort: GGUtil.parseInt(json['sort']));

  Map<String, Object?> toJson() =>
      {'currency': currency, 'ratio': ratio, 'sort': sort};

  GamingGameCurrencyRatio copyWith({
    String? currency,
    double? ratio,
    int? sort,
  }) {
    return GamingGameCurrencyRatio(
      currency: currency ?? this.currency,
      ratio: ratio ?? this.ratio,
      sort: sort ?? this.sort,
    );
  }
}
