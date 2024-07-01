class GamingCurrencyPaymentTipsModel {
  String tipsType;
  String content;

  GamingCurrencyPaymentTipsModel({
    required this.tipsType,
    this.content = '',
  });

  @override
  String toString() => 'TipsInfo(tipsType: $tipsType, content: $content)';

  factory GamingCurrencyPaymentTipsModel.fromJson(Map<String, Object?> json) =>
      GamingCurrencyPaymentTipsModel(
        tipsType: json['tipsType'] as String,
        content: json['content'] as String? ?? '',
      );

  Map<String, Object?> toJson() => {
        'tipsType': tipsType,
        'content': content,
      };

  GamingCurrencyPaymentTipsModel copyWith({
    String? tipsType,
    String? content,
  }) {
    return GamingCurrencyPaymentTipsModel(
      tipsType: tipsType ?? this.tipsType,
      content: content ?? this.content,
    );
  }
}
