enum FeedbackType {
  localization("Localization"),
  productSuggest("ProductSuggest"),
  security("Security"),
  design("Design"),
  unknown("-1");

  const FeedbackType(this.value);

  final String value;

  factory FeedbackType.c(String x) {
    return FeedbackType.values
        .firstWhere((element) => element.value == x, orElse: () => unknown);
  }
}
