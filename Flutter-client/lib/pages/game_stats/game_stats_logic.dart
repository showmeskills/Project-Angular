import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game_order/models/betinfo/real_time_bet_info_model.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/realtime_service/interval_list.dart';
import 'package:gogaming_app/common/service/realtime_service/realtime_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/socket/gaming_signalr_provider.dart';
import 'package:gogaming_app/socket/wager_rank_model.dart';

import '../../common/api/base/base_api.dart';
import '../../common/api/bonus/models/gaming_daily_contest_model/gaming_contest_rank_model.dart';
import '../../common/api/bonus/models/gaming_daily_contest_model/gaming_daily_contest_model.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
part 'game_stats_state.dart';

class GameStatsLogic extends SuperController<GameStatsState> {
  GameStatsLogic({this.gameCategory});

  /// 游戏场景 null是所有  SportsBook体育 Esports电子竞技 Lottery彩票 LiveCasino真人娱乐 SlotGame电子游戏 Chess棋牌
  final List<String>? gameCategory;

  @override
  GameStatsState get state => _state;

  final _state = GameStatsState();
  late Function disposeListen;
  late Worker displayFiatCurrencySub;
  final intervalList = GGIntervalList<RealTimeBetInfoModel>(
    duration: const Duration(seconds: 1),
  );
  late final StreamSubscription<RealTimeBetInfoModel?> listSub;

  @override
  void onInit() {
    _loadContestActivities().doOnData((event) {
      _state.updateDialyContest(event);
    }).listen(null, onError: (err) {});

    disposeListen = AccountService.sharedInstance.cacheUser.getBox!()
        .listenKey(AccountService.sharedInstance.cacheUser.key, (value) {
      _userDidUpdate();
    });
    _loadRealtimeStats();
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
        if (_state.currentBet == _state.myBet) {
          _updateFromSocket(
            state.myBet,
            betInfo,
            (a, b) => b.dateTime!.compareTo(a.dateTime!),
            10,
          );
        } else if (_state.currentBet == _state.allBet) {
          _updateFromSocket(
            state.allBet,
            betInfo,
            (a, b) => b.dateTime!.compareTo(a.dateTime!),
            10,
          );
        } else if (_state.currentBet == _state.heroBet) {
          _updateFromSocket(
            state.heroBet,
            betInfo,
            (a, b) => b.dateTime!.compareTo(a.dateTime!),
            10,
          );
        } else if (_state.currentBet == _state.luckiestBet) {
          _updateFromSocket(
            state.luckiestBet,
            betInfo,
            (a, b) => b.odds!.compareTo(a.odds!),
            10,
          );
        }
      }
    });
    super.onInit();
  }

  void _addSelfBet(RealTimeBetInfoModel betInfo, WagerRankModel wagerRank) {
    if (AccountService().isLogin &&
        AccountService().gamingUser?.uid == wagerRank.uid) {
      // _updateFromSocket(
      //   state.myBet,
      //   betInfo,
      //   (a, b) => b.dateTime!.compareTo(a.dateTime!),
      //   10,
      // );
      if (_state.currentBet == _state.myBet) {
        intervalList.add(betInfo);
      }
    }
  }

  void _addAllBet(RealTimeBetInfoModel betInfo, WagerRankModel wagerRank) {
    final payAmountUsdt = wagerRank.payAmountUsdt;
    final betUsdt = wagerRank.betUsdt;
    if (wagerRank.gameName?.isNotEmpty == true &&
        payAmountUsdt is double &&
        betUsdt is double &&
        betUsdt > 0.01) {
      // _updateFromSocket(
      //   state.allBet,
      //   betInfo,
      //   (a, b) => b.dateTime!.compareTo(a.dateTime!),
      //   10,
      // );
      if (_state.currentBet == _state.allBet) {
        intervalList.add(betInfo);
      }
    }
  }

  void _addHeroBet(RealTimeBetInfoModel betInfo, WagerRankModel wagerRank) {
    if (wagerRank.betUsdt is double && wagerRank.betUsdt! > 1000) {
      if (_state.currentBet == _state.heroBet) {
        intervalList.add(betInfo);
      }
      // _updateFromSocket(
      //   state.heroBet,
      //   betInfo,
      //   (a, b) => b.dateTime!.compareTo(a.dateTime!),
      //   10,
      // );
    }
  }

  void _addLuckiestBet(RealTimeBetInfoModel betInfo, WagerRankModel wagerRank) {
    if (wagerRank.odds is double &&
        wagerRank.odds! >= 0 &&
        betInfo.payAmount is double &&
        betInfo.payAmount! > 0) {
      if (_state.currentBet == _state.luckiestBet) {
        intervalList.add(betInfo);
      }
      // _updateFromSocket(
      //   state.luckiestBet,
      //   betInfo,
      //   (a, b) => b.odds!.compareTo(a.odds!),
      //   10,
      // );
    }
  }

  void _updateFromSocket(
    List<RealTimeBetInfoModel> list,
    RealTimeBetInfoModel betInfo,
    int Function(RealTimeBetInfoModel a, RealTimeBetInfoModel b)? compare,
    int maxLength,
  ) {
    // //订单号相同的需要更新数据 先删除再添加
    // if (list.contains(betInfo)) {
    //   list.remove(betInfo);
    // }
    final sortList = List<RealTimeBetInfoModel>.from(list);
    sortList.insert(0, betInfo);
    if (compare != null) {
      sortList.sort(compare);
      // list.sort(compare);
    }
    final insertIndex = sortList.indexOf(betInfo);
    list.insert(insertIndex, betInfo);
    if (list.length > maxLength) {
      list.removeRange(maxLength, list.length);
    }
    if (state.currentBet == list && insertIndex < maxLength) {
      state.globalKey.currentState?.insertItem(
        insertIndex,
        duration: intervalList.duration * 0.8,
      );
      change(state, status: RxStatus.success());
    }
  }

  void _subscribeWagerRank(List<dynamic>? arguments) {
    final map = arguments?.tryGet(0);
    final data = map['data'];
    if (data is Map<String, dynamic>) {
      final wagerRank = WagerRankModel.fromMap(data);
      //过滤不是当前场景的投注
      if (gameCategory != null &&
          gameCategory?.contains(wagerRank.gameCategory) != true) return;

      final betInfo = RealTimeBetInfoModel.fromJson(wagerRank.toBetInfoJson());
      //16397需求变更 只推送结算的数据
      //下注后实时更新我的投注、所有投注
      // if (wagerRank.status == 'Wager') {
      //   // debugPrint('OnWagerRank  Wager event: $data');
      //   _addSelfBet(betInfo, wagerRank);
      //   _addAllBet(betInfo, wagerRank);
      // }

      // 结算后实时更新风云榜、最幸运数据、目前我的投注(H5/APP)不用刷新
      if (wagerRank.status == 'Settle') {
        // debugPrint('OnWagerRank Settle event: $data');
        _addHeroBet(betInfo, wagerRank);
        _addLuckiestBet(betInfo, wagerRank);
        _addSelfBet(betInfo, wagerRank);
        _addAllBet(betInfo, wagerRank);
      }
    }
  }

  void _loadRealtimeStats() {
    intervalList.reset();
    Stream<List<RealTimeBetInfoModel>> stream = _loadAllBettingList();
    if (state.bettingTitle.value == "my_bet") {
      stream = _loadMyBettingList();
    } else if (state.bettingTitle.value == "all_bet") {
      stream = _loadAllBettingList();
    } else if (state.bettingTitle.value == "windy_list") {
      stream = _loadHeroList();
    } else if (state.bettingTitle.value == "luckiest") {
      stream = _loadLuckyestRankList();
    }

    change(_state, status: RxStatus.loading());
    stream.listen(
      (event) {},
      onError: (Object e) {
        if (e is GoGamingResponse) {
          Toast.showFailed(e.message);
        } else {
          Toast.showTryLater();
        }
      },
      onDone: () {
        change(
          _state,
          status:
              state.currentBet.isEmpty ? RxStatus.empty() : RxStatus.success(),
        );
      },
    );
  }

  Stream<List<RealTimeBetInfoModel>> _loadMyBettingList() {
    return RealTimeService().getSelfRealTimeBetInfo().doOnData((event) {
      _state.myBet.assignAll(event);
    });
  }

  Stream<List<RealTimeBetInfoModel>> _loadAllBettingList() {
    return RealTimeService().getRealTimeBetInfo(gameCategory).doOnData((event) {
      _state.allBet.assignAll(event);
    });
  }

  Stream<List<RealTimeBetInfoModel>> _loadHeroList() {
    return RealTimeService().getHeroBetInfo(gameCategory).doOnData((event) {
      _state.heroBet.assignAll(event);
    });
  }

  Stream<List<RealTimeBetInfoModel>> _loadLuckyestRankList() {
    return RealTimeService().getLuckiestBetInfo(gameCategory).doOnData((event) {
      _state.luckiestBet.assignAll(event);
    });
  }

  void _userDidUpdate() {
    _state.initBetTitle();
    _loadRealtimeStats();
  }

  void changeCurrentDailyContest(GamingDailyContestModel model) {
    if (model.activitiesNo == _state.currentContest.value.activitiesNo) {
      return;
    }
    _state.currentContest.value = model;
    _state.isRankDataLoading.value = true;
    _loadRankList(model.activitiesNo).doOnData((event) {
      _state._contestRankList.assignAll(event);
    }).doOnDone(() {
      _state.isRankDataLoading.value = false;
    }).listen((event) {});
  }

  Stream<List<GamingContestBonusInfo>> _loadRankList(String activitiesNo) {
    return PGSpi(Bonus.getRank.toTarget(
      input: {
        'activitiesNo': activitiesNo,
        'pageIndex': 1,
        'pageSize': 10,
      },
    )).rxRequest<List<GamingContestBonusInfo>>((value) {
      List<GamingContestBonusInfo> list = <GamingContestBonusInfo>[];
      if (value['data']['bonusInfo'] is List) {
        list = (value['data']['bonusInfo'] as List)
            .map((e) =>
                GamingContestBonusInfo.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return list;
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<Map<List<GamingDailyContestModel>, List<GamingContestBonusInfo>>>
      _loadContestActivities() {
    return PGSpi(Bonus.getContestActivities.toTarget())
        .rxRequest<List<GamingDailyContestModel>?>((value) {
      try {
        final data = value['data']['title'];
        if (data is List) {
          return data
              .map((e) => GamingDailyContestModel.fromJson(
                  Map<String, dynamic>.from(e as Map)))
              .toList();
        } else {
          return null;
        }
      } catch (e) {
        return null;
      }
    }).flatMap((resp) {
      /// 过滤所有标题名为 unknown 的活动
      final respList =
          resp.data?.where((element) => element.title != 'unknown').toList() ??
              [];
      if (respList.isEmpty) {
        return Stream.value({});
      }
      return PGSpi(Bonus.getRank.toTarget(
        input: {
          'activitiesNo': respList.first.activitiesNo,
          'pageIndex': 1,
          'pageSize': 10,
        },
      )).rxRequest<
              Map<List<GamingDailyContestModel>, List<GamingContestBonusInfo>>>(
          (value) {
        final map =
            <List<GamingDailyContestModel>, List<GamingContestBonusInfo>>{};
        List<GamingContestBonusInfo> list = [];
        if (value['data']['bonusInfo'] is List) {
          list = (value['data']['bonusInfo'] as List)
              .map((e) =>
                  GamingContestBonusInfo.fromJson(e as Map<String, dynamic>))
              .toList();
        }
        map[respList] = list;
        return map;
      }).flatMap((value) {
        return Stream.value(value.data);
      });
    });
  }

  void changeBetting(String title) {
    _state.bettingTitle.value = title;
    _loadRealtimeStats();
  }

  @override
  void onClose() {
    disposeListen.call();
    SignalrProvider().off('OnWagerRank', method: _subscribeWagerRank);
    displayFiatCurrencySub.dispose();
    intervalList.complete();
    listSub.cancel();
    super.onClose();
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
  void onHidden() {
    // TODO: implement onHidden
  }
}
