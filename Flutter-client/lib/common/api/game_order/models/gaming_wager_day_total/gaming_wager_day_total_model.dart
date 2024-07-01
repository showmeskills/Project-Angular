// ignore_for_file: file_names

import 'gaming_wager_day_total_stat_model.dart';

class GamingWagerDayTotalModel {
  int count;
  double betTotal;
  double payoutTotal;
  List<GamingWagerDayTotalStatModel> list;

  GamingWagerDayTotalModel({
    this.count = 0,
    this.betTotal = 0,
    this.payoutTotal = 0,
    this.list = const [],
  });

  @override
  String toString() {
    return 'GamingGameOrderWagerDayTotalModel(count: $count, betTotal: $betTotal, payoutTotal: $payoutTotal, list: $list)';
  }

  factory GamingWagerDayTotalModel.fromJson(Map<String, Object?> json) {
    return GamingWagerDayTotalModel(
      count: json['count'] as int? ?? 0,
      betTotal: (json['betTotal'] as num? ?? 0).toDouble(),
      payoutTotal: (json['payoutTotal'] as num? ?? 0).toDouble(),
      list: (json['list'] as List<dynamic>?)
              ?.map((e) => GamingWagerDayTotalStatModel.fromJson(
                  e as Map<String, Object?>))
              .toList() ??
          [],
    );
  }

  Map<String, Object?> toJson() => {
        'count': count,
        'betTotal': betTotal,
        'payoutTotal': payoutTotal,
        'list': list.map((e) => e.toJson()).toList(),
      };

  GamingWagerDayTotalModel copyWith({
    int? count,
    double? betTotal,
    double? payoutTotal,
    List<GamingWagerDayTotalStatModel>? list,
  }) {
    return GamingWagerDayTotalModel(
      count: count ?? this.count,
      betTotal: betTotal ?? this.betTotal,
      payoutTotal: payoutTotal ?? this.payoutTotal,
      list: list ?? this.list,
    );
  }
}
