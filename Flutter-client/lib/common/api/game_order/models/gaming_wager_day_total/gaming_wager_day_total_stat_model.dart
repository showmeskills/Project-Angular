// ignore_for_file: file_names

class GamingWagerDayTotalStatModel {
  String day;
  int count;
  double betTotal;
  double payoutTotal;

  GamingWagerDayTotalStatModel({
    required this.day,
    this.count = 0,
    this.betTotal = 0,
    this.payoutTotal = 0,
  });

  @override
  String toString() {
    return 'List(day: $day, count: $count, betTotal: $betTotal, payoutTotal: $payoutTotal)';
  }

  factory GamingWagerDayTotalStatModel.fromJson(Map<String, Object?> json) =>
      GamingWagerDayTotalStatModel(
        day: json['day'] as String,
        count: json['count'] as int? ?? 0,
        betTotal: (json['betTotal'] as num? ?? 0).toDouble(),
        payoutTotal: (json['payoutTotal'] as num? ?? 0).toDouble(),
      );

  Map<String, Object?> toJson() => {
        'day': day,
        'count': count,
        'betTotal': betTotal,
        'payoutTotal': payoutTotal,
      };

  GamingWagerDayTotalStatModel copyWith({
    String? day,
    int? count,
    double? betTotal,
    double? payoutTotal,
  }) {
    return GamingWagerDayTotalStatModel(
      day: day ?? this.day,
      count: count ?? this.count,
      betTotal: betTotal ?? this.betTotal,
      payoutTotal: payoutTotal ?? this.payoutTotal,
    );
  }
}
