import 'gaming_currency_rate_model.dart';

class GamingCurrencyRateListModel {
  String baseCurrency;
  List<GamingCurrencyRateModel> rates;

  GamingCurrencyRateListModel({
    required this.baseCurrency,
    this.rates = const [],
  });

  Map<String, GamingCurrencyRateModel> _ratesMap = {};
  Map<String, GamingCurrencyRateModel> get ratesMap {
    if (_ratesMap.isEmpty) {
      _ratesMap = {};
      for (var element in rates) {
        _ratesMap[element.currency] = element;
      }
    }
    return _ratesMap;
  }

  @override
  String toString() {
    return 'CurrencyRateModel(baseCurrency: $baseCurrency, rates: $rates)';
  }

  factory GamingCurrencyRateListModel.fromJson(Map<String, Object?> json) {
    return GamingCurrencyRateListModel(
      baseCurrency: json['baseCurrency'] as String,
      rates: (json['rates'] as List<dynamic>?)
              ?.map((e) =>
                  GamingCurrencyRateModel.fromJson(e as Map<String, Object?>))
              .toList() ??
          [],
    );
  }

  Map<String, Object?> toJson() => {
        'baseCurrency': baseCurrency,
        'rates': rates.map((e) => e.toJson()).toList(),
      };

  GamingCurrencyRateListModel copyWith({
    String? baseCurrency,
    List<GamingCurrencyRateModel>? rates,
  }) {
    return GamingCurrencyRateListModel(
      baseCurrency: baseCurrency ?? this.baseCurrency,
      rates: rates ?? this.rates,
    );
  }
}
