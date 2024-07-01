part of 'gaming_sport_order_model.dart';

class GamingSportOrderGameDetailModel {
  String? sport;
  String? tournamentName;
  String? eventName;
  String? betoptionName;
  String? betContent;

  GamingSportOrderGameDetailModel({
    required this.sport,
    this.tournamentName,
    this.eventName,
    this.betoptionName,
    this.betContent,
  });

  @override
  String toString() {
    return 'GameDetail(sport: $sport, tournamentName: $tournamentName, eventName: $eventName, betoptionName: $betoptionName, betContent: $betContent)';
  }

  factory GamingSportOrderGameDetailModel.fromJson(Map<String, Object?> json) =>
      GamingSportOrderGameDetailModel(
        sport: json['sport'] as String?,
        tournamentName: json['tournamentName'] as String?,
        eventName: json['eventName'] as String?,
        betoptionName: json['betoptionName'] as String?,
        betContent: json['betContent'] as String?,
      );

  Map<String, Object?> toJson() => {
        'sport': sport,
        'tournamentName': tournamentName,
        'eventName': eventName,
        'betoptionName': betoptionName,
        'betContent': betContent,
      };

  GamingSportOrderGameDetailModel copyWith({
    String? sport,
    String? tournamentName,
    String? eventName,
    String? betoptionName,
    String? betContent,
  }) {
    return GamingSportOrderGameDetailModel(
      sport: sport ?? this.sport,
      tournamentName: tournamentName ?? this.tournamentName,
      eventName: eventName ?? this.eventName,
      betoptionName: betoptionName ?? this.betoptionName,
      betContent: betContent ?? this.betContent,
    );
  }
}
