class GamingTxInfoModel {
  String? orderNum;
  String? currency;
  double? amount;
  String? userName;
  String? paymentCode;
  String? paymentName;
  List<String> paymentImages;

  GamingTxInfoModel({
    this.orderNum,
    this.currency,
    this.amount,
    this.userName,
    this.paymentCode,
    this.paymentName,
    this.paymentImages = const [],
  });

  @override
  String toString() {
    return 'GamingTxInfoModel(orderNum: $orderNum, currency: $currency, amount: $amount, userName: $userName, paymentCode: $paymentCode, paymentName: $paymentName, paymentImages: $paymentImages)';
  }

  factory GamingTxInfoModel.fromJson(Map<String, Object?> json) {
    return GamingTxInfoModel(
      orderNum: json['orderNum'] as String?,
      currency: json['currency'] as String?,
      amount: (json['amount'] as num?)?.toDouble(),
      userName: json['userName'] as String?,
      paymentCode: json['paymentCode'] as String?,
      paymentName: json['paymentName'] as String?,
      paymentImages:
          List<String>.from(json['paymentImages'] as List<dynamic>? ?? []),
    );
  }

  Map<String, Object?> toJson() => {
        'orderNum': orderNum,
        'currency': currency,
        'amount': amount,
        'userName': userName,
        'paymentCode': paymentCode,
        'paymentName': paymentName,
        'paymentImages': paymentImages,
      };

  GamingTxInfoModel copyWith({
    String? orderNum,
    String? currency,
    double? amount,
    String? userName,
    String? paymentCode,
    String? paymentName,
    List<String>? paymentImages,
  }) {
    return GamingTxInfoModel(
      orderNum: orderNum ?? this.orderNum,
      currency: currency ?? this.currency,
      amount: amount ?? this.amount,
      userName: userName ?? this.userName,
      paymentCode: paymentCode ?? this.paymentCode,
      paymentName: paymentName ?? this.paymentName,
      paymentImages: paymentImages ?? this.paymentImages,
    );
  }
}
