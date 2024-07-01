import 'dart:async';

import 'package:gogaming_app/common/api/activity/models/tournament_rank_model.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/realtime_service/interval_list.dart';

class TournamentWebSocket {
  TournamentWebSocket({
    this.onRankLeaderboard,
    this.onSelfRank,
  });

  void Function(List<TournamentRankModel>)? onRankLeaderboard;
  void Function(TournamentRankModel)? onSelfRank;

  // 全部排行榜入列的条件
  bool Function(TournamentRankModel)? _rankLeaderboardAddCondition;
  // 自己名次入列的条件
  bool Function(TournamentRankModel)? _selfRankAddCondition;

  GGIntervalList2<TournamentRankModel>? interval1;

  StreamSubscription<List<TournamentRankModel>>? _subscription;

  GGIntervalList<TournamentRankModel>? interval2;

  StreamSubscription<TournamentRankModel?>? _subscription2;

  // 是否初始化
  bool initialized = false;

  void init({
    bool Function(TournamentRankModel)? rankLeaderboardAddCondition,
    bool Function(TournamentRankModel)? selfRankAddCondition,
  }) {
    _rankLeaderboardAddCondition ??= rankLeaderboardAddCondition;
    _selfRankAddCondition ??= selfRankAddCondition;
    if (!initialized) {
      initialized = true;
      interval1 ??= GGIntervalList2<TournamentRankModel>(
        duration: const Duration(milliseconds: 500),
      );
      interval2 ??= GGIntervalList<TournamentRankModel>(
        duration: const Duration(milliseconds: 500),
      );
      GamingEvent.onNewRankLeaderboard.subscribe(_subscribeRankLeaderboard);
      GamingEvent.onNewRankSelfRank.subscribe(_subscribeSelfRank);
      _subscription ??= interval1?.stream.listen((value) {
        if (value.isNotEmpty) {
          onRankLeaderboard?.call(value);
        }
      });
      _subscription2 ??= interval2?.stream.listen((value) {
        if (value != null) {
          onSelfRank?.call(value);
        }
      });
    }
  }

  void dispose() {
    if (initialized) {
      GamingEvent.onNewRankLeaderboard.unsubscribe(_subscribeRankLeaderboard);
      GamingEvent.onNewRankSelfRank.unsubscribe(_subscribeSelfRank);
      interval1?.complete();
      _subscription?.cancel();
      interval2?.complete();
      _subscription2?.cancel();
      initialized = false;
    }
  }

  void _subscribeRankLeaderboard(Map<String, dynamic>? value) {
    final data = value?['res']['data'] as Map<String, dynamic>?;
    if (data != null && data['IsChange'] == true) {
      final info = TournamentRankModel.fromJsonByWebSocket(data);
      final condition = _rankLeaderboardAddCondition?.call(info) ?? true;
      if (condition) {
        interval1?.add(info);
      }
    }
  }

  void _subscribeSelfRank(Map<String, dynamic>? value) {
    final data = value?['res']['data'] as Map<String, dynamic>?;
    if (data != null && data['IsChange'] == true) {
      final info = TournamentRankModel.fromJsonByWebSocket(data);
      final condition = _selfRankAddCondition?.call(info) ?? true;
      if (condition) {
        interval2?.add(info);
      }
    }
  }
}
