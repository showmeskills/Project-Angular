// import 'package:flutter/material.dart';
import 'dart:async';

import 'package:gogaming_app/common/api/game_order/models/betinfo/real_time_bet_info_model.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/realtime_service/realtime_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/socket/gaming_signalr_provider.dart';
import 'package:gogaming_app/socket/wager_rank_model.dart';

import 'interval_list.dart';

class GameRealtimeLogic extends SuperController<List<RealTimeBetInfoModel>> {
  GameRealtimeLogic(this.gameId, this.providerCatId);

  /// 大赢家数据
  final mostWinner = <RealTimeBetInfoModel>[];

  /// 幸运赢家数据
  final luckyWiner = <RealTimeBetInfoModel>[];
  final String gameId;
  final String providerCatId;
  late Worker displayFiatCurrencySub;
  final intervalList = GGIntervalList<RealTimeBetInfoModel>(
    duration: const Duration(seconds: 1),
  );
  late final StreamSubscription<RealTimeBetInfoModel?> listSub;

  @override
  void onInit() {
    super.onInit();
    // 投注后结算事件 OnWagerRan Status":"Settle"
    // {time: 1685623788, related: Rank, action: WagerRank, status: Success, data: {OrderNum: G3390130957885062G, Uid: 01000530, UserName: 01000530, Avater: avatar-6, GameCategory: Lottery, GameCode: null, GameName: null, BetUsdt: 0.70293425, BetAmount: 5.0, Currency: CNY, BetTime: 1685623788000, Odds: null, PayoutUsdt: 0.0, PayoutAmount: 0.0, Status: Wager}}
    SignalrProvider().subscribe('OnWagerRank', _subscribeWagerRank);
    displayFiatCurrencySub = everAll([
      CurrencyService().displayFiatCurrencyObs,
      CurrencyService().hideZeroBalanceObs
    ], (_) {
      if (status.isSuccess) {
        change(state, status: RxStatus.success());
      }
    });
    listSub = intervalList.stream.listen((betInfo) {
      if (betInfo is RealTimeBetInfoModel) {
        if (state == luckyWiner) {
          _updateFromSocket(
            luckyWiner,
            betInfo,
            (a, b) => b.odds!.compareTo(a.odds!),
            3,
          );
        } else if (state == mostWinner) {
          _updateFromSocket(
            mostWinner,
            betInfo,
            (a, b) => b.payAmountUsdt!.compareTo(a.payAmountUsdt!),
            3,
          );
        }
      }
    });
  }

  void _subscribeWagerRank(List<dynamic>? arguments) {
    final map = arguments?.tryGet(0);
    final data = map['data'];
    if (data is Map<String, dynamic>) {
      final wagerRank = WagerRankModel.fromMap(data);
      //过滤不是当前游戏的投注
      if (wagerRank.gameCode != gameId) return;

      // 结算事件 实时更新大赢家、幸运赢家数数据
      if (wagerRank.status == 'Settle') {
        // debugPrint('OnWagerRank event: $data');
        final betInfo =
            RealTimeBetInfoModel.fromJson(wagerRank.toBetInfoJson());
        if (betInfo.odds is double &&
            betInfo.odds! >= 0.0 &&
            betInfo.payAmount is double &&
            betInfo.payAmount! >= 0.0) {
          // _updateFromSocket(
          //   luckyWiner,
          //   betInfo,
          //   (a, b) => b.odds!.compareTo(a.odds!),
          //   3,
          // );
          if (state == luckyWiner) {
            intervalList.add(betInfo);
          }
        }
        if (betInfo.payAmountUsdt is double && betInfo.payAmountUsdt! > 0) {
          // _updateFromSocket(
          //   mostWinner,
          //   betInfo,
          //   (a, b) => b.payAmountUsdt!.compareTo(a.payAmountUsdt!),
          //   3,
          // );
          if (state == mostWinner) {
            intervalList.add(betInfo);
          }
        }
      }
    }
  }

  void _updateFromSocket(
    List<RealTimeBetInfoModel> list,
    RealTimeBetInfoModel betInfo,
    int Function(RealTimeBetInfoModel a, RealTimeBetInfoModel b)? compare,
    int maxLength,
  ) {
    if (list.contains(betInfo)) return;
    list.add(betInfo);
    list.sort(compare);
    if (list.length > maxLength) {
      list.removeRange(maxLength, list.length);
    }
    if (state == list) {
      change(state, status: RxStatus.success());
    }
  }

  void changeIndex() {
    intervalList.reset();
  }

  void loadMostWinner() {
    if (mostWinner.isNotEmpty) {
      change(mostWinner, status: RxStatus.success());
      return;
    } else {
      change(null, status: RxStatus.loading());
    }

    RealTimeService().getMostWinerBetInfo(gameId, providerCatId).listen(
      (event) {
        mostWinner.assignAll(event);
      },
      onError: (Object e) {
        if (e is GoGamingResponse) {
          Toast.showFailed(e.message);
        } else {
          Toast.showTryLater();
        }
      },
      onDone: () {
        change(
          mostWinner,
          status: mostWinner.isEmpty ? RxStatus.empty() : RxStatus.success(),
        );
      },
    );
  }

  void loadLuckyWiner() {
    if (luckyWiner.isNotEmpty) {
      change(luckyWiner, status: RxStatus.success());
      return;
    } else {
      change(null, status: RxStatus.loading());
    }

    RealTimeService().getLuckyWinerBetInfo(gameId, providerCatId).listen(
      (event) {
        luckyWiner.assignAll(event);
      },
      onError: (Object e) {
        if (e is GoGamingResponse) {
          Toast.showFailed(e.message);
        } else {
          Toast.showTryLater();
        }
      },
      onDone: () {
        change(
          luckyWiner,
          status: luckyWiner.isEmpty ? RxStatus.empty() : RxStatus.success(),
        );
      },
    );
  }

  @override
  void onClose() {
    super.onClose();
    SignalrProvider().off('OnWagerRank', method: _subscribeWagerRank);
    displayFiatCurrencySub.dispose();
    intervalList.complete();
    listSub.cancel();
  }

  @override
  void onDetached() {}

  @override
  void onInactive() {}

  @override
  void onPaused() {}

  @override
  void onResumed() {}

  @override
  // ignore: override_on_non_overriding_member
  void onHidden() {}
}
