import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_model.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_rank_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/game/game_api.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_provider_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_range_setting_model.dart';
import 'package:gogaming_app/common/api/game/models/play_game_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/common/service/game_webview_manager.dart';
import 'package:gogaming_app/common/service/ip_service.dart';
import 'package:gogaming_app/common/service/realtime_service/game_realtime_logic.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/header/gg_user_app_bar_controller.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/pages/tournament/common/tournament_web_socket.dart';

import '../../common/api/game/models/gaming_multip_label_model.dart';
import '../../common/tracker/analytics_manager.dart';
import '../main/main_logic.dart';
import 'game_detail_state.dart';

class GameDetailLogic extends BaseController
    with GetSingleTickerProviderStateMixin {
  GameDetailLogic({
    required this.gameId,
    required this.providerId,
  }) {
    state.gameData.update((value) {
      value?.gameId = gameId;
      value?.providerCatId = providerId;
    });
  }

  final String gameId;
  final String providerId;
  Timer? timer;
  int secondLeft = 5;

  final GameDetailState state = GameDetailState();
  ScrollController scrollController = ScrollController();
  late final StreamSubscription<dynamic> selectedCurrencySub;
  late Function updateListen;
  GGUserAppBarController get appBarController =>
      Get.find<GGUserAppBarController>();
  GamingGameModel get gameData => state.gameData.value;
  late TabController tabController = TabController(
    /// 直接设置为 0 跨级跳转的时候会出现无法跳转的问题，直接设置一个较短的时间则丝会出现
    animationDuration: const Duration(milliseconds: 150),
    vsync: this,
    length: 3,
    initialIndex: 0,
  );
  late final index = tabController.index.obs;

  late final TournamentWebSocket webSocket = TournamentWebSocket(
    onRankLeaderboard: onRankLeaderboard,
    onSelfRank: onSelfRank,
  );

  GameRealtimeLogic get realtimeController {
    final gameData = state.gameData.value;
    return Get.put(GameRealtimeLogic(
        gameData.gameId ?? '0', gameData.providerCatId ?? ''));
  }

  Worker? _worker;
  Worker? _worker2;

  @override
  void onInit() {
    super.onInit();
    updateListen = AccountService.sharedInstance.cacheUser.getBox!()
        .listenKey(AccountService.sharedInstance.cacheUser.key, (value) {
      _userDidUpdate();
    });

    selectedCurrencySub = CurrencyService().selectedCurrencyObs.listen((p0) {
      initCurrency();
      if (state.needTransfer) {
        goTransfer();
      } else {
        _preload();
      }
    });
    _getGameData();
    _getRealtimeData();
    tabController.addListener(_handleTabSelection);

    _worker = ever(state.displayCurrency, (callback) {
      initBetRangeSetting();
    });
    _worker2 = ever(state.tournament, (callback) {
      final codes = state.tournament.map((e) => e.tmpCode!);
      if (codes.isEmpty) {
        // 竞赛数据改变 ===> 销毁websocket
        webSocket.dispose();
      } else {
        // 竞赛数据改变 ===> 重置websocket add condition
        webSocket.init(
          rankLeaderboardAddCondition: (value) {
            return codes.contains(value.tmpCode);
          },
          selfRankAddCondition: (value) {
            return codes.contains(value.tmpCode);
          },
        );
      }
    });
  }

  void _handleTabSelection() {
    // resetTF();
    index.value = tabController.index;
    _getRealtimeData();
  }

  void _getRealtimeData() {
    realtimeController.changeIndex();
    if (1 == index.value) {
      realtimeController.loadMostWinner();
    } else if (2 == index.value) {
      realtimeController.loadLuckyWiner();
    }
  }

  void _getGameData() {
    // final gameData = state.gameData.value;
    final gameService = GameService();
    Rx.combineLatestList([
      gameService
          .gameInfo(gameData.gameId!, gameData.providerCatId!)
          .doOnData((event) {
        state.gameInfoLoading.value = false;
        if (event.data != null) {
          state.gameData(event.data);
          initCurrency();
        }
      }).flatMap((value) {
        List<String>? labelCodes =
            gameData.gameLabels?.map((e) => e.code).toList();
        return _loadRecommend(labelCodes: labelCodes ?? []);
      }),
      checkNeedTransfer().doOnData((event) {
        initCurrency();
      }),
      if (GameService().rangeSetting.value.providerSettingList.isNotEmpty)
        Stream.value(true)
      else
        GameService().loadRangeSetting(),
    ]).listen((event) {
      state.gameInfoLoading.value = false;
      if (state.gameData.value.isOnline) {
        setShowNotSupport();
        if (state.needTransfer) {
          goTransfer();
        } else {
          _preload();
        }
      } else {
        /// 游戏已下架的启动提示游戏下架并在 5 秒后自动返回首页
        _startTimer();
      }
    }, onError: (Object err) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
      state.gameInfoLoading.value = false;
    });
    state.gameInfoLoading.value = true;

    gameService.loadProvider().listen((event) {});
  }

  void _startTimer() {
    timer?.cancel();
    timer = Timer.periodic(const Duration(seconds: 1), (object) {
      if (secondLeft > 0) {
        secondLeft -= 1;
      } else {
        timer?.cancel();
        Get.until((route) => Get.currentRoute == Routes.main.route);
        Get.find<MainLogic>().changeSelectIndex(-1);
      }
    });
  }

  Stream<GoGamingResponse<GamingGameMultipleLabelModel>> _loadRecommend(
      {List<String>? labelCodes}) {
    return PGSpi(Game.getGameMultipleLabel.toTarget(
      inputData: {
        'labelCodes': labelCodes,
        "isRecomment": false,
        "gameCount": 25,
      },
    )).rxRequest<GamingGameMultipleLabelModel>((value) {
      final labelModel = GamingGameMultipleLabelModel.fromJson(
          value['data'] as Map<String, dynamic>);
      return labelModel;
    }).doOnData((event) {
      /// 过滤当剝游戝本身
      event.data.gameLists = event.data.gameLists
          .where((element) => element.id != state.gameData.value.id)
          .toList();
      state.recommendGame(event.data);
    });
  }

  void initBetRangeSetting() {
    final gameService = GameService();
    GamingGameRangeSettingModel model = gameService.rangeSetting.value;
    state.allRange.value = [];
    state.curRange.value = RangeSettingList(oddType: '', value: '');
    for (int i = 0; i < model.providerSettingList.length; i++) {
      ProviderSettingList list = model.providerSettingList[i];
      if (list.providerCatId == state.gameData.value.providerCatId) {
        List<CurrencySettingList> settingList = list.currencySettingList;
        for (int j = 0; j < settingList.length; j++) {
          CurrencySettingList cur = settingList[j];
          final isSame = gameService.displayCurrency(cur.currency) ==
              gameService
                  .displayCurrency(state.displayCurrency.value?.currency);
          if (isSame) {
            state.allRange.value = cur.rangeSettingList;
            state.curRange.value = cur.rangeSettingList[0];
            break;
          }
        }
      }
    }
  }

  void setRange(RangeSettingList range) {
    state.curRange.value = range;

    if (!state.needTransfer) {
      _preload();
    } else {
      _diposePreload();
    }
  }

  bool showRangeSetting() {
    return state.showRangeSetting();
  }

  Stream<bool> checkNeedTransfer() {
    appBarController.enterGameDetail(providerId);
    if (state.isLogin.value && state.gameInfoLoading.value == false) {
      return GameService().findTransferWallet(providerId).flatMap((event) {
        if (event != null) {
          state.transferWallet(event);
        }
        return Stream.value(true);
      });
    } else {
      return Stream.value(false);
    }
  }

  void viewDisappear() {
    appBarController.leaveGame();
  }

  void _showLoading(bool isTry) {
    if (isTry) {
      state.tryLinkLoading.value = true;
    } else {
      state.realLinkLoading.value = true;
    }
  }

  void _hiddenLoading(bool isTry) {
    if (isTry) {
      state.tryLinkLoading.value = false;
    } else {
      state.realLinkLoading.value = false;
    }
  }

  void playGame(bool isTry) {
    AnalyticsManager.logEvent(
        name: 'play_game',
        parameters: {"game_code": state.gameData.value.gameId});
    final game = state.gameData.value;
    final isOriginalGame =
        game.providerCatId == Config.currentConfig.gameConfig.originalProvider;
    if (isOriginalGame) {
      Toast.showFunDev();
      return;
    }

    /// 所在地区丝支挝游戝覝杝示丝支挝游戝
    if (state.showNoSupport.value) {
      Toast.showFailed(localized('provider_n_sup_region'));
      return;
    }
    _showLoading(isTry);
    _loadGameUrl(isTry).listen((event) async {
      if (state.playGameUrl.isNotEmpty == true) {
        _navigateToGame(isTry);
      } else {
        _showGameError(event);
      }
      _hiddenLoading(isTry);
    }, onError: (Object e) {
      _showGameError(e);
      _hiddenLoading(isTry);
    });
  }

  void _navigateToGame([bool isTry = false]) {
    state.openGame = true;
    final game = state.gameData.value;
    if (state.openInBroswer) {
      UrlSchemeUtil.openUrlWithBrowser(state.playGameUrl);
      Future.delayed(const Duration(microseconds: 10), () {
        state.openGame = false;
      });
    } else {
      Get.toNamed<dynamic>(
        Routes.webGame.route,
        arguments: {
          'gameLink': state.playGameUrl,
          'providerId': game.providerCatId,
          'gameId': game.gameId,
          'webview': ThirdGameWebViewManger.sharedInstance,
        },
      )?.then((value) async {
        state.openGame = false;
        await _diposePreload();
        _preload();
      });
    }
  }

  Stream<GoGamingResponse<PlayGameModel>?> _loadGameUrl([bool isTry = false]) {
    final game = state.gameData.value;
    final isOriginalGame =
        game.providerCatId == Config.currentConfig.gameConfig.originalProvider;
    if (isOriginalGame) {
      return Stream.value(null);
    }

    /// 所在地区丝支挝游戝覝杝示丝支挝游戝
    if (state.showNoSupport.value) {
      return Stream.value(null);
    }
    if (state.displayCurrency.value?.currency == null) {
      return Stream.value(null);
    }

    final currencyCode = state.currencyCode;
    return GameService()
        .getPlayGame(
      providerId: game.providerCatId!,
      gameId: game.gameId,
      currencyCode: currencyCode,
      gameCurrencyCode: state.displayCurrency.value!.currency!,
      isTry: isTry,
      agOddType: state.curRange.value.oddType,
      showModeIsDay: !ThemeManager().isDarkMode,
    )
        .doOnData((event) {
      if (event.success && event.data.playGameUrl?.isNotEmpty == true) {
        // 是否需要加载新的url
        final needLoad = event.data.playGameUrl! != state.playGameUrl;
        state.playGameUrl = event.data.playGameUrl!;
        state.openInBroswer = event.data.openInBroswer;
        // 浏览器打开就不需要预加载
        if (event.data.openInBroswer) return;
        state.preLoadTryMode = isTry;
        // 如果获取的链接和上次相同则不需要加载
        if (!needLoad) return;
        // 暂时修复 webview 无法复用的问题
        ThirdGameWebViewManger.sharedInstance.dispose().then((value) {
          Future.delayed(const Duration(milliseconds: 300), () {
            ThirdGameWebViewManger.sharedInstance
                .loadUrl(url: state.playGameUrl);
          });
        });
        // 上一次获取游戏模式和这一次不相同 需要销毁上一次的web缓冲数据
        // if (preLoadTryMode != isTry) {
        //   ThirdGameWebViewManger.sharedInstance.dispose().then((value) {
        //     Future.delayed(const Duration(milliseconds: 300), () {
        //       ThirdGameWebViewManger.sharedInstance
        //           .loadUrl(url: state.playGameUrl);
        //     });
        //   });
        // } else {
        //   ThirdGameWebViewManger.sharedInstance.loadUrl(url: state.playGameUrl);
        // }
      } else {
        _diposePreload();
      }
    });
  }

  void _preload() {
    if (!state.needTransfer && !state.openGame) {
      if (state.isLogin.value) {
        _loadGameUrl(false).listen((event) {}, onError: (Object e) {});
      } else {
        if (state.gameData.value.isTry ?? false) {
          _loadGameUrl(true).listen((event) {}, onError: (Object e) {});
        }
      }
    }
  }

  Future<void> _diposePreload() async {
    state.playGameUrl = '';
    await ThirdGameWebViewManger.sharedInstance.dispose();
  }

  void _showGameError(Object? error) {
    String errorDes = localized('gam_conn_err');
    if (error is GoGamingResponse && error.success == false) {
      errorDes = error.toString();
    }
    Toast.showFailed(errorDes);
  }

  /// 原页面刷新当剝游戝
  void setGame(GamingGameModel gameItem) {
    state.gameData(gameItem);
    state.tournament.value = [];
    _diposePreload();
    _getGameData();
    _getRealtimeData();
  }

  void initCurrency() {
    GamingCurrencyModel? model;
    if (state.isTransferGame) {
      /// 用户选中帝秝已绝转账就选中该帝秝 丝然还是转账的第一个帝秝
      final userCoin = state.transferWallet.value.currencies
          .firstWhereOrNull((e) => e.currency == state.currencyCode);
      GamingCurrencyModel? walletCurrency;
      if (userCoin?.isActivate == true) {
        walletCurrency = CurrencyService()[state.currencyCode];
      } else if (state.transferWallet.value.currencies.isNotEmpty) {
        final firstCurrency =
            state.transferWallet.value.currencies[0].currency ?? '';
        walletCurrency = CurrencyService()[firstCurrency];
      } else {
        /// 添加厂商支持的币种列表应对未登陆情况
        String? supportCurrency;
        supportCurrency = state.gameData.value.currencyRatio
                ?.firstWhereOrNull((e) => e.currency == state.currencyCode)
                ?.currency ??
            '';
        if (supportCurrency.isEmpty) {
          supportCurrency =
              state.gameData.value.currencyRatio?.first.currency ?? '';
        }
        model = CurrencyService()[supportCurrency];
      }
      if (walletCurrency != null) {
        model = walletCurrency;
      }
    } else {
      final gameService = GameService();
      final currency = state.currencyCode;
      final list = state.gameData.value.currencyRatio ?? [];
      if (list.isNotEmpty) {
        final findCurrency = list.firstWhere(
          (element) =>
              gameService.displayCurrency(element.currency!) ==
              gameService.displayCurrency(currency),
          orElse: () => list.first,
        );
        model = CurrencyService()[findCurrency.currency!];
      }
    }
    if (model != null) {
      state.displayCurrency(model);
    }
  }

  void _userDidUpdate() {
    state.isLogin.value = AccountService.sharedInstance.isLogin;
    state.preLoadTryMode = state.isLogin.value;
    _getGameData();
  }

  /// 跳转划转页面
  void goTransfer() {
    if (state.needTransfer) {
      _diposePreload();
      Get.toNamed<dynamic>(
        Routes.transfer.route,
        arguments: {"category": state.transferWallet.value.category},
      );
    }
  }

  void revertExpand() {
    state.detailExpand.value = !state.detailExpand.value;
  }

  void setDisplayCurrency(String currency) {
    final currencyModel = CurrencyService()[currency];
    state.displayCurrency(currencyModel);
    if (state.needTransfer) {
      goTransfer();
    } else {
      _preload();
    }
  }

  /// 添加收藝游戝
  void addFavoriteGame() {
    final id = state.gameData.value.id;
    if (id is int) {
      state.gameData.update((val) {
        val?.isFavorite = true;
      });
      GameService().addFavoriteGame(id).listen((event) {}, onError: (e) {});
    }
  }

  /// 移除收藝游戝
  void removeFavoriteGame() {
    final id = state.gameData.value.id;
    if (id is int) {
      state.gameData.update((val) {
        val?.isFavorite = false;
      });
      GameService().removeFavoriteGame(id).listen((event) {}, onError: (e) {});
    }
  }

  @override
  void onClose() {
    super.onClose();
    timer?.cancel();
    timer = null;
    selectedCurrencySub.cancel();
    updateListen.call();
    tabController.removeListener(_handleTabSelection);
    _worker?.dispose();
    ThirdGameWebViewManger.sharedInstance.dispose();
    _worker2?.dispose();
    webSocket.dispose();
    tabController.removeListener(_handleTabSelection);
  }

  void setShowNotSupport() {
    IPService.sharedInstance.getIpInfo().listen((event) {
      final provider = GameService.sharedInstance.provider.firstWhere(
          (element) =>
              element.providerCatId == state.gameData.value.providerCatId,
          orElse: () => GamingGameProviderModel());
      if (provider.countryCode != null &&
          provider.countryCode!.isNotEmpty &&
          provider.countryCode!.contains(event.countryCode) == false) {
        state.showNoSupport.value = true;
      } else {
        state.showNoSupport.value = false;
      }
    }).onError((Object error) {
      state.showNoSupport.value = false;
    });
  }

  void onRankLeaderboard(List<TournamentRankModel> event) {
    final old = {
      for (var e in state.tournament)
        e.tmpCode!: <String, TournamentRankModel>{
          for (var e2 in e.pageTable?.list ?? <TournamentRankModel>[])
            e2.uid!: e2
        }
    };

    for (var element in event) {
      if (old.containsKey(element.tmpCode)) {
        old[element.tmpCode!]?.addAll({
          element.uid!: element,
        });
      }
    }

    state.tournament.value = state.tournament.map((e) {
      final list = (old[e.tmpCode!]?.values.toList() ?? [])
        ..sort((a, b) => a.rankNumber!.compareTo(b.rankNumber!));
      return e.copyWith(
        pageTable: e.pageTable?.copyWith(
          list: list,
          total: list.length,
        ),
      );
    }).toList();
  }

  void onSelfRank(TournamentRankModel event) {
    final old = {
      for (TournamentModel e in state.tournament) e.tmpCode!: e.currentUserRank
    };

    if (old.containsKey(event.tmpCode)) {
      old[event.tmpCode!] = event;
    }

    state.tournament.value = state.tournament.map((e) {
      return e.copyWith(
        currentUserRank: old[e.tmpCode!],
      );
    }).toList();
  }
}
