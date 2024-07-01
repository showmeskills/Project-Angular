import 'dart:async';

import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_range_setting_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_transfer_wallet.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/common/service/game_webview_manager.dart';
import 'package:gogaming_app/common/service/ip_service.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/pages/base/page_state.dart';

import '../../../common/service/event_service.dart';
import '../../../common/tracker/analytics_manager.dart';
import '../../../config/game_config.dart';
import '../../main/main_logic.dart';
import 'game_play_ready_state.dart';

class GamePlayReadyLogic extends BaseController {
  GamePlayReadyLogic({
    required this.providerId,
    this.identify,
    this.gameId,
    required this.webview,
    required this.gameLink,
    required this.hideWebView,
    required this.matchInfo,
  }) {
    initLink = gameLink.value;
  }

  late final GamePlayReadyState state = GamePlayReadyState();

  /// 厂商id
  final String providerId;

  final Map<String, dynamic> matchInfo;

  /// 游戏类别名
  final String? identify;

  /// 游戏id
  final String? gameId;

  late final StreamSubscription<dynamic> selectedCurrencySub;

  late String initLink;

  final RxString gameLink;

  final RxBool hideWebView;

  final GameWebViewManagerImpl webview;

  Worker? _worker;

  Timer? timer;
  int secondLeft = 5;

  @override
  void onInit() {
    super.onInit();
    selectedCurrencySub = CurrencyService().selectedCurrencyObs.listen((p0) {
      _setupGameCurrency();
      if (state.needTransfer) {
        goTransfer();
      }
      autoPlayGame().listen((event) {});
    });

    _worker = ever(state.gameCurrency, (callback) {
      initBetRangeSetting();
    });
    loadData(autoGame: initLink.isEmpty);
    GamingEvent.login.subscribe(_refreshLogin);
  }

  void _refreshLogin() {
    if ((state.providerModel?.isSport ?? false) && (state.providerModel?.isTry ?? false)) {
      loadData(autoGame: true);
      return;
    }
    loadData(autoGame: initLink.isEmpty);
  }

  void loadData({bool autoGame = true}) {
    if (pageState == PageState.loading) return;

    showLoading();
    bool dataNotReady = state.providerModel == null ||
        state.transferWallet.value.providerId.isEmpty;
    Rx.combineLatestList([
      getProviderInfo(),
      checkNeedTransfer(),
      if (GameService().rangeSetting.value.providerSettingList.isNotEmpty)
        Stream.value(true)
      else
        GameService().loadRangeSetting(),
    ]).doOnData((value) {
      _setupGameCurrency();
      //数据加载成功第一次检查转账 防止重复弹出转账
      if (dataNotReady && state.needTransfer) {
        goTransfer();
      }

      // url不存在则尝试自动进入游戏
      if (autoGame) {
        autoPlayGame().listen((event) {});
      }
      // return autoGame ? autoPlayGame() : Stream.value(true);
    }).listen((event) {
      hideLoading();
    }, onError: (Object e) {
      hideLoading();
      Toast.showFailed(e.toString());
      _setupGameCurrency();
      if (state.needTransfer) {
        goTransfer();
      }
    });
  }

  void initBetRangeSetting() {
    final gameService = GameService();
    GamingGameRangeSettingModel model = gameService.rangeSetting.value;
    state.allRange.value = [];
    state.curRange.value = RangeSettingList(oddType: '', value: '');
    for (int i = 0; i < model.providerSettingList.length; i++) {
      ProviderSettingList list = model.providerSettingList[i];
      if (list.providerCatId == providerId) {
        List<CurrencySettingList> settingList = list.currencySettingList;
        for (int j = 0; j < settingList.length; j++) {
          CurrencySettingList cur = settingList[j];
          final isSame = gameService.displayCurrency(cur.currency) ==
              gameService.displayCurrency(state.gameCurrency.value?.currency);
          if (isSame) {
            state.allRange.value = cur.rangeSettingList;
            state.curRange.value = cur.rangeSettingList[0];
            break;
          }
        }
      }
    }
  }

  void _setupGameCurrency() {
    if ((state.providerModel?.isSport ?? false) && (state.providerModel?.isTry ?? false)) {
      _setSportCurrency();
      return;
    }
    GamingCurrencyModel? model;
    if (state.isTransferGame) {
      /// 用户选中币种已经转账就选中该币种 不然还是转账的第一个币种
      final userCoin = state.transferWallet.value.currencies
          .firstWhereOrNull((e) => e.currency == state.userCurrency.currency);
      if (userCoin?.isActivate == true) {
        model = CurrencyService()[state.userCurrency.currency!];
      } else if (state.transferWallet.value.currencies.isNotEmpty) {
        final firstCurrency =
            state.transferWallet.value.currencies[0].currency ?? '';
        model = CurrencyService()[firstCurrency];
      } else {
        /// 添加厂商支持的币种列表应对未登陆情况
        String? supportCurrency;
        supportCurrency = state.providerModel?.currencies
                .firstWhereOrNull((e) => e == state.userCurrency.currency) ??
            '';
        if (supportCurrency.isEmpty) {
          supportCurrency = state.providerModel?.currencies.first ?? '';
        }
        model = CurrencyService()[supportCurrency];
      }
    } else {
      final gameService = GameService();
      final currency = CurrencyService().selectedCurrency.currency;
      final list = state.providerModel?.currencies ?? [];
      if (list.isNotEmpty) {
        final findCurrency = list.firstWhere(
          (element) =>
              gameService.displayCurrency(element) ==
              gameService.displayCurrency(currency),
          orElse: () => list.first,
        );
        model = CurrencyService()[findCurrency];
      }
    }
    if (model != null) {
      state.gameCurrency.value = model;
    }
  }

  Stream<bool> getProviderInfo() {
    final provider = GameService()
        .provider
        .firstWhereOrNull((element) => element.providerCatId == providerId);
    if (provider != null) {
      state.providerModel = provider;
      setShowNotSupport();
      return Stream.value(true);
    } else {
      return GameService().loadProvider().flatMap((value) {
        final provider = value
            .firstWhereOrNull((element) => element.providerCatId == providerId);
        if (provider != null) {
          state.providerModel = provider;
          setShowNotSupport();
          return Stream.value(true);
        } else {
          setShowOffLine();
          return Stream.value(false);
        }
      });
    }
  }

  void setShowOffLine() {
    state.gameOffLine.value = true;

    /// 如果没有找到匹配的厂商即认为游戏已经下架
    state.playGameSupportError.value = localized('provider_n_sup_region');
    _startTimer();
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

  void setShowNotSupport() {
    IPService.sharedInstance.getIpInfo().listen((event) {
      if (state.providerModel?.countryCode != null &&
          state.providerModel!.countryCode!.isNotEmpty &&
          state.providerModel!.countryCode!.contains(event.countryCode) ==
              false) {
        state.playGameSupportError.value = localized('provider_n_sup_region');
      } else {
        state.playGameSupportError.value = '';
      }
    }).onError((Object error) {
      state.playGameSupportError.value = '';
    });
  }

  Stream<GamingOverviewTransferWalletModel?> checkNeedTransfer() {
    if (AccountService().isLogin) {
      return GameService().findTransferWallet(providerId).doOnData((event) {
        if (event != null) {
          state.transferWallet(event);
        }
      });
    } else {
      return Stream.value(null);
    }
  }

  void setRange(RangeSettingList range) {
    state.curRange.value = range;
  }

  void setGameCurrency(String currency) {
    final currencyModel = CurrencyService()[currency];
    if (currencyModel != null) {
      state.gameCurrency.value = currencyModel;

      autoPlayGame().listen((event) {});
    }
    if (state.needTransfer) {
      goTransfer();
    }
  }

  void _setSportCurrency() {
    GamingCurrencyModel? model;
    final currencyCode = CurrencyService().selectedCurrency.currency;
    String? gameCurrencyCode = state.providerModel?.currencies
        .firstWhereOrNull((element) => currencyCode == element);
    if (gameCurrencyCode == null &&
        (state.providerModel?.currencies.contains('USDT') ?? false)) {
      gameCurrencyCode = 'USDT';
    }
    gameCurrencyCode ??= state.providerModel?.currencies.first;
    model = CurrencyService().getModelByCurrency(gameCurrencyCode ?? '');
    state.gameCurrency.value = model;
  }

  Stream<bool> autoPlayGame() {
    final isTryMode = (state.providerModel?.isSport ?? false) &&
        (state.providerModel?.isTry ?? false) &&
        !(AccountService.sharedInstance.isLogin);
    final stream =
        state.playGameSupportError.value.isEmpty && state.canAutoPlayGame
            ? _playGame(tryMode: isTryMode)
            : Stream.value(null);
    return stream.flatMap((value) {
      if (value?.isNotEmpty == true) {
        // 如果可以自动进入游戏则显示webview隐藏游戏币种选择
        if (state.canAutoPlayGame) {
          gameLink.value = value!;
          hideWebView.value = false;
          return Stream.value(true);
        }
      }
      // 显示游戏币种选择，如果没有游戏链接则隐藏webview
      // if (initLink.isEmpty) {
      hideWebView.value = true;
      // } else {
      //   hideWebView.value = false;
      // }
      gameLink.value = _setGameLink('');
      return Stream.value(false);
    });
  }

  String _setGameLink(String value) {
    String newValue = value;

    /// 应对 OB 体育需要偏转到特定页面
    if (value.isNotEmpty &&
        providerId == GameConfig.sportProviderId &&
        matchInfo.isNotEmpty) {
      final matchId = matchInfo['matchId'] as String;
      newValue = '$newValue&mid=$matchId';
    }
    return newValue;
  }

  /// 预加载游戏
  Stream<String?> _playGame({bool? tryMode}) {
    final isOriginalGame =
        providerId == Config.currentConfig.gameConfig.originalProvider;
    if (isOriginalGame) {
      Toast.showFunDev();
      return Stream.value(null);
    }
    if (state.gameCurrency.value?.currency == null) {
      _showGameError(null);
      return Stream.value(null);
    }

    if (tryMode == true) {
      state.tryLinkLoading.value = true;
    } else {
      state.realLinkLoading.value = true;
    }
    final currencyCode = state.userCurrency.currency;
    return GameService()
        .getPlayGame(
      providerId: providerId,
      gameId: gameId,
      currencyCode: currencyCode!,
      gameCurrencyCode: state.gameCurrency.value!.currency!,
      isTry: tryMode ?? false,
      agOddType: state.curRange.value.oddType,
      showModeIsDay: !ThemeManager().isDarkMode,
    )
        .doOnData((event) {
      if (tryMode == true) {
        state.tryLinkLoading.value = false;
      } else {
        state.realLinkLoading.value = false;
      }
      final playGameUrl = event.data.playGameUrl;
      state.openInBroswer = event.data.openInBroswer;
      if (event.success &&
          playGameUrl is String &&
          playGameUrl.isNotEmpty == true &&
          !state.openInBroswer) {
        if (gameLink.value != playGameUrl) {
          // 个别游戏直接调用loadUrl无效，需要销毁webview重新加载，例如：OG真人
          webview.dispose(false).then((value) {
            Future.delayed(const Duration(milliseconds: 300), () {
              webview.loadUrl(url: _setGameLink(playGameUrl));
            });
          });
        }
        state.playGameError.value = '';
      } else {
        _showGameError(event);
      }
    }).doOnError((p0, p1) {
      if (tryMode == true) {
        state.tryLinkLoading.value = false;
      } else {
        state.realLinkLoading.value = false;
      }
      _showGameError(p0);
    }).flatMap((event) {
      if (event.success != true) return Stream.value(null);
      return Stream.value(event.data.playGameUrl);
    });
  }

  void _showGameError(Object? error) {
    String errorDes = localized('gam_conn_err');
    if (error is GoGamingResponse && error.success == false) {
      errorDes = error.toString();
    }
    Toast.showFailed(errorDes);
    state.playGameError.value = errorDes;
  }

  void playGame({bool? tryMode}) {
    AnalyticsManager.logEvent(
        name: 'play_game', parameters: {"game_code": gameId});

    /// 所在地区不支持游戏要提示不支持游戏
    if (state.playGameSupportError.value.isNotEmpty) {
      Toast.showFailed(state.playGameSupportError.value);
      return;
    }
    if (initLink.isEmpty) {
      if (state.playGameError.value.isNotEmpty) {
        Toast.showFailed(state.playGameError.value);
      } else {
        _playGame(tryMode: tryMode).listen((event) {
          if (state.openInBroswer) {
            UrlSchemeUtil.openUrlWithBrowser(event!);
            return;
          }
          if (event?.isNotEmpty == true) {
            hideWebView.value = false;
            gameLink.value = _setGameLink(event!);
          }
        });
      }
    } else {
      _playGame().listen((event) {
        if (state.openInBroswer) {
          UrlSchemeUtil.openUrlWithBrowser(event!);
          return;
        }
        if (event?.isNotEmpty == true) {
          hideWebView.value = false;
          gameLink.value = _setGameLink(event!);
        }
      });
    }
  }

  /// 跳转划转页面
  void goTransfer() {
    if (state.needTransfer && AccountService().isLogin) {
      hideWebView.value = true;
      gameLink.value = _setGameLink('');
      webview.dispose(false);
      Get.toNamed<dynamic>(
        Routes.transfer.route,
        arguments: {"category": state.transferWallet.value.category},
      );
    }
  }

  @override
  void onClose() {
    super.onClose();
    selectedCurrencySub.cancel();
    GamingEvent.login.unsubscribe(_refreshLogin);
    _worker?.dispose();
    if (initLink.isEmpty) {
      webview.dispose();
    }
    timer?.cancel();
    timer = null;
    // webview.dispose();
  }
}
