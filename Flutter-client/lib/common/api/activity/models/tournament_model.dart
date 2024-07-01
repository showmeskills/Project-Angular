import 'package:gogaming_app/common/api/activity/models/tournament_pagination_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_model.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';

import 'tournament_award_model.dart';
import 'tournament_award_rang_model.dart';
import 'tournament_rank_model.dart';

enum TournamentStatus {
  ongoing,
  upcoming,
  expired,
}

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class TournamentModel {
  int? nowTime;
  String? tmpCode;
  String? activityName;
  String? activitySubName;
  String? activitySlogan;
  String? activityContent;
  String? activityThumbnails;
  double? activityTotalAmount;
  String? provider;
  int? rankType;
  List<GamingGameModel>? gameLists;
  int? tmpEndTime;
  int? tmpStartTime;
  bool? uidCanJoin;
  List<TournamentAwardModel>? awards;
  List<TournamentAwardRangModel>? awardRang;
  TournamentPagination<TournamentRankModel>? pageTable;
  TournamentRankModel? currentUserRank;

  late TournamentStatus _status;
  TournamentStatus get status => _status;

  GamingCurrencyModel get formatCurrency {
    if (CurrencyService.sharedInstance.selectedCurrency.isDigital) {
      return GamingCurrencyModel.usdt();
    } else {
      return CurrencyService.sharedInstance.selectedCurrency;
    }
  }

  String get formatTotalAmount {
    final value = awards
            ?.map((e) => double.parse(e.amountString))
            .reduce((value, element) => value + element) ??
        0;
    return value > 1
        ? value.truncate().toString()
        : value.toStringAsFixedWithoutRound(2);
  }

  // 剩余多久开始
  Duration get startDuration {
    final now = DateTime.now().toUtc().millisecondsSinceEpoch;
    final timestamp = tmpStartTime! - nowTime! - (now - nowTime!);
    return Duration(seconds: timestamp ~/ 1000);
  }

  // 剩余多久结束
  Duration get endDuration {
    final now = DateTime.now().toUtc().millisecondsSinceEpoch;
    final timestamp = tmpEndTime! - nowTime! - (now - nowTime!);
    return Duration(seconds: timestamp ~/ 1000);
  }

  TournamentModel({
    this.nowTime,
    this.tmpCode,
    this.activityName,
    this.activitySubName,
    this.activitySlogan,
    this.activityContent,
    this.activityThumbnails,
    this.provider,
    this.rankType,
    this.gameLists,
    this.tmpEndTime,
    this.tmpStartTime,
    this.uidCanJoin,
    this.awards,
    this.awardRang,
    this.pageTable,
    this.currentUserRank,
    this.activityTotalAmount,
    TournamentStatus? status,
  }) {
    _status = status ?? _calculateStatus();
  }

  TournamentStatus _calculateStatus() {
    if (endDuration > Duration.zero) {
      if (startDuration > Duration.zero) {
        return TournamentStatus.upcoming;
      } else {
        return TournamentStatus.ongoing;
      }
    } else {
      return TournamentStatus.expired;
    }
  }

  @override
  String toString() {
    return 'TournamentModel(nowTime: $nowTime, tmpCode: $tmpCode, activityName: $activityName, activitySubName: $activitySubName, activitySlogan: $activitySlogan, activityContent: $activityContent, activityThumbnails: $activityThumbnails, gameLists: $gameLists, tmpEndTime: $tmpEndTime, tmpStartTime: $tmpStartTime, uidCanJoin: $uidCanJoin)';
  }

  factory TournamentModel.fromJson(Map<String, Object?> json) {
    return TournamentModel(
      nowTime: asT<int>(json['nowTime']),
      tmpCode: asT<String>(json['tmpCode']),
      activityName: asT<String>(json['activityName']),
      activitySubName: asT<String>(json['activitySubName']),
      activitySlogan: asT<String>(json['activitySlogan']),
      activityContent: asT<String>(json['activityContent']),
      activityThumbnails: asT<String>(json['activityThumbnails']),
      activityTotalAmount: asT<num>(json['activityTotalAmount'])?.toDouble(),
      provider: asT<String>(json['provider']),
      rankType: asT<int>(json['rankType']),
      gameLists: (json['gameLists'] as List<dynamic>?)
          ?.map((e) => GamingGameModel.fromJson(e as Map<String, Object?>))
          .toList(),
      tmpEndTime: asT<int>(json['tmpEndTime']),
      tmpStartTime: asT<int>(json['tmpStartTime']),
      uidCanJoin: asT<bool>(json['uidCanJoin']),
      awards: (json['numberVos'] as List<dynamic>?)
          ?.map((e) => TournamentAwardModel.fromJson(e as Map<String, Object?>))
          .toList(),
      awardRang: (json['rangeNumberVos'] as List<dynamic>?)
          ?.map((e) =>
              TournamentAwardRangModel.fromJson(e as Map<String, Object?>))
          .toList(),
      pageTable: json['pageTable'] != null
          ? TournamentPagination.fromJson(
              itemFactory: (v) {
                return TournamentRankModel.fromJson(v);
              },
              json: json['pageTable'] as Map<String, Object?>,
            )
          : null,
      currentUserRank: json['currentUserRank'] != null
          ? TournamentRankModel.fromJson(
              json['currentUserRank'] as Map<String, Object?>)
          : null,
    );
  }

  Map<String, Object?> toJson() => {
        'nowTime': nowTime,
        'tmpCode': tmpCode,
        'activityName': activityName,
        'activitySubName': activitySubName,
        'activitySlogan': activitySlogan,
        'activityContent': activityContent,
        'activityThumbnails': activityThumbnails,
        'activityTotalAmount': activityTotalAmount,
        'provider': provider,
        'rankType': rankType,
        'gameLists': gameLists?.map((e) => e.toJson()).toList(),
        'tmpEndTime': tmpEndTime,
        'tmpStartTime': tmpStartTime,
        'uidCanJoin': uidCanJoin,
      };

  TournamentModel copyWith({
    int? nowTime,
    String? tmpCode,
    String? activityName,
    String? activitySubName,
    String? activitySlogan,
    String? activityContent,
    String? activityThumbnails,
    double? activityTotalAmount,
    String? provider,
    int? rankType,
    List<GamingGameModel>? gameLists,
    int? tmpEndTime,
    int? tmpStartTime,
    bool? uidCanJoin,
    List<TournamentAwardModel>? awards,
    List<TournamentAwardRangModel>? awardRang,
    TournamentPagination<TournamentRankModel>? pageTable,
    TournamentRankModel? currentUserRank,
    TournamentStatus? status,
  }) {
    return TournamentModel(
      nowTime: nowTime ?? this.nowTime,
      tmpCode: tmpCode ?? this.tmpCode,
      activityName: activityName ?? this.activityName,
      activitySubName: activitySubName ?? this.activitySubName,
      activitySlogan: activitySlogan ?? this.activitySlogan,
      activityContent: activityContent ?? this.activityContent,
      activityThumbnails: activityThumbnails ?? this.activityThumbnails,
      activityTotalAmount: activityTotalAmount ?? this.activityTotalAmount,
      provider: provider ?? this.provider,
      rankType: rankType ?? this.rankType,
      gameLists: gameLists ?? this.gameLists,
      tmpEndTime: tmpEndTime ?? this.tmpEndTime,
      tmpStartTime: tmpStartTime ?? this.tmpStartTime,
      uidCanJoin: uidCanJoin ?? this.uidCanJoin,
      awards: awards ?? this.awards,
      awardRang: awardRang ?? this.awardRang,
      pageTable: pageTable ?? this.pageTable,
      currentUserRank: currentUserRank ?? this.currentUserRank,
      status: status ?? this.status,
    );
  }
}
