part of 'gaming_casino_order_model.dart';

class CasinoGameDetailModel {
  String gameName;
  String playOption;
  String table;

  CasinoGameDetailModel({
    this.gameName = '',
    this.playOption = '',
    this.table = '',
  });

  @override
  String toString() {
    return 'GameDetail(gameName: $gameName, playOption: $playOption, table: $table)';
  }

  factory CasinoGameDetailModel.fromJson(Map<String, Object?> json) =>
      CasinoGameDetailModel(
        gameName: json['gameName'] as String? ?? '',
        playOption: json['playOption'] as String? ?? '',
        table: json['table'] as String? ?? '',
      );

  Map<String, Object?> toJson() => {
        'gameName': gameName,
        'playOption': playOption,
        'table': table,
      };

  CasinoGameDetailModel copyWith({
    String? gameName,
    String? playOption,
    String? table,
  }) {
    return CasinoGameDetailModel(
      gameName: gameName ?? this.gameName,
      playOption: playOption ?? this.playOption,
      table: table ?? this.table,
    );
  }
}
