import 'gaming_currency_payment_model.dart';

class GamingCurrencyPaymentResultModel {
  List<String> types;
  List<GamingCurrencyPaymentModel> paymentList;

  GamingCurrencyPaymentResultModel({
    this.types = const [],
    this.paymentList = const [],
  });

  @override
  String toString() {
    return 'GamingCurrencyPaymentListModel(types: $types, paymentList: $paymentList)';
  }

  factory GamingCurrencyPaymentResultModel.fromJson(Map<String, Object?> json) {
    return GamingCurrencyPaymentResultModel(
      types: List<String>.from((json['types'] as List<dynamic>? ?? [])
        ..removeWhere((element) => element == null)),
      paymentList: (json['paymentList'] as List<dynamic>?)
              ?.map((e) => GamingCurrencyPaymentModel.fromJson(
                  e as Map<String, Object?>))
              .toList() ??
          [],
    );
  }

  Map<String, Object?> toJson() => {
        'types': types,
        'paymentList': paymentList.map((e) => e.toJson()).toList(),
      };

  GamingCurrencyPaymentResultModel copyWith({
    List<String>? types,
    List<GamingCurrencyPaymentModel>? paymentList,
  }) {
    return GamingCurrencyPaymentResultModel(
      types: types ?? this.types,
      paymentList: paymentList ?? this.paymentList,
    );
  }
}
