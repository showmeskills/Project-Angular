import 'gaming_currency_rate_model.dart';

class GamingCurrencyVirtualRateModel {
  String rateId;
  String baseCurrency;
  List<GamingCurrencyRateModel> rates;

  GamingCurrencyVirtualRateModel(
      {required this.rateId, required this.baseCurrency, required this.rates});

  factory GamingCurrencyVirtualRateModel.fromJson(Map<String, Object?> json) =>
      GamingCurrencyVirtualRateModel(
        rateId: json['rateId'] as String,
        baseCurrency: json['baseCurrency'] as String,
        rates: (json['rates'] as List<dynamic>?)
                ?.map((e) =>
                    GamingCurrencyRateModel.fromJson(e as Map<String, Object?>))
                .toList() ??
            [],
      );

  Map<String, Object?> toJson() => {
        'rateId': rateId,
        'baseCurrency': baseCurrency,
      };

  GamingCurrencyVirtualRateModel copyWith({
    String? rateId,
    String? baseCurrency,
    List<GamingCurrencyRateModel>? rates,
  }) {
    return GamingCurrencyVirtualRateModel(
      rateId: rateId ?? this.rateId,
      baseCurrency: baseCurrency ?? this.baseCurrency,
      rates: rates ?? this.rates,
    );
  }
}
