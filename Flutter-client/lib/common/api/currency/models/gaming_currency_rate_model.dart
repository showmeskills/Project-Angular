class GamingCurrencyRateModel {
  String currency;
  double rate;

  GamingCurrencyRateModel({required this.currency, required this.rate});

  @override
  String toString() => 'Rate(currency: $currency, rate: $rate)';

  factory GamingCurrencyRateModel.fromJson(Map<String, Object?> json) =>
      GamingCurrencyRateModel(
        currency: json['currency'] as String,
        rate: (json['rate'] as num).toDouble(),
      );

  Map<String, Object?> toJson() => {
        'currency': currency,
        'rate': rate,
      };

  GamingCurrencyRateModel copyWith({
    String? currency,
    double? rate,
  }) {
    return GamingCurrencyRateModel(
      currency: currency ?? this.currency,
      rate: rate ?? this.rate,
    );
  }
}
