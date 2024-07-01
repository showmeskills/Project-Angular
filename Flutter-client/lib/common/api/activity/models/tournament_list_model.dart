// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'package:gogaming_app/common/api/activity/models/tournament_model.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_pagination_model.dart';

class TournamentListModel {
  final TournamentPagination<TournamentModel>? endList;
  final TournamentPagination<TournamentModel>? preList;
  final TournamentPagination<TournamentModel>? startList;

  bool get isEmpty =>
      (endList?.total ?? 0) + (preList?.total ?? 0) + (startList?.total ?? 0) ==
      0;

  TournamentListModel({
    this.endList,
    this.preList,
    this.startList,
  });

  factory TournamentListModel.fromJson(Map<String, dynamic> json) {
    return TournamentListModel(
      endList: json['endList'] != null
          ? TournamentPagination.fromJson(
              itemFactory: (v) {
                return TournamentModel.fromJson(v);
              },
              json: json['endList'] as Map<String, Object?>,
            )
          : null,
      preList: json['perList'] != null
          ? TournamentPagination.fromJson(
              itemFactory: (v) {
                return TournamentModel.fromJson(v);
              },
              json: json['perList'] as Map<String, Object?>,
            )
          : null,
      startList: json['startList'] != null
          ? TournamentPagination.fromJson(
              itemFactory: (v) {
                return TournamentModel.fromJson(v);
              },
              json: json['startList'] as Map<String, Object?>,
            )
          : null,
    );
  }

  TournamentListModel copyWith({
    TournamentPagination<TournamentModel>? endList,
    TournamentPagination<TournamentModel>? preList,
    TournamentPagination<TournamentModel>? startList,
  }) {
    return TournamentListModel(
      endList: endList ?? this.endList,
      preList: preList ?? this.preList,
      startList: startList ?? this.startList,
    );
  }
}
