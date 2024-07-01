import 'dart:async';

import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/account_service.dart';

import '../../../common/api/base/go_gaming_response.dart';
import '../../../common/api/game/models/gaming_game_provider_model.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/currency/currency_service.dart';
import '../../../common/service/event_service.dart';
import '../../../common/service/game_service.dart';
import '../../../common/service/game_webview_manager.dart';
import '../../../common/service/ip_service.dart';
import '../../../common/theme/theme_manager.dart';
import '../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../../config/config.dart';
import '../../base/base_controller.dart';

class ListGameLogic extends BaseController {
  ListGameLogic({required this.webview, required this.currentProvider});

  final GlobalKey stackKey = GlobalKey();
  final gameLink = ''.obs;
  final playGameError = ''.obs;
  final selectedCurrency = ''.obs;
  final GameWebViewManagerImpl webview;
  final GamingGameProviderModel currentProvider;

  late final StreamSubscription<dynamic> selectedCurrencySub;

  String? get ua => ThirdGameWebViewManger.sharedInstance
      .getUserAgent(providerId: currentProvider.providerCatId);

  @override
  void onInit() {
    super.onInit();

    GamingEvent.login.subscribe(_refreshLogin);
    selectedCurrencySub = CurrencyService().selectedCurrencyObs.listen((p0) {
      _loadGameLink().listen((event) {});
    });
    webview.dispose().then((value) {
      if (AccountService.sharedInstance.isLogin ||
          (currentProvider.isTry ?? false)) {
        loadPlayGame();
      }
    });
  }

  @override
  void onClose() {
    super.onClose();
    selectedCurrencySub.cancel();
    GamingEvent.login.unsubscribe(_refreshLogin);
  }

  void _refreshLogin() {
    loadPlayGame();
  }

  void loadPlayGame() {
    showLoading();
    final provider = GameService().provider.firstWhereOrNull(
        (element) => element.providerCatId == currentProvider.providerCatId);
    _getProviderInfo(provider).flatMap((value) {
      if (value == false) {
        return Stream.value(localized('provider_n_sup_region'));
      }
      return _setShowNotSupport(provider);
    }).flatMap((value) {
      playGameError.value = value;
      return _playGame(provider);
    }).listen((event) {
      hideLoading();
      gameLink.value = event!;
    }, onError: (e) {
      hideLoading();
    });
  }

  Stream<String?> _playGame(GamingGameProviderModel? providerModel) {
    final isOriginalGame = currentProvider.providerCatId ==
        Config.currentConfig.gameConfig.originalProvider;
    if (isOriginalGame) {
      Toast.showFunDev();
      return Stream.value(null);
    }
    final currencyCode = CurrencyService().selectedCurrency.currency;
    String? gameCurrencyCode = providerModel?.currencies
        .firstWhereOrNull((element) => currencyCode == element);
    if (gameCurrencyCode == null &&
        (providerModel?.currencies.contains('USDT') ?? false)) {
      gameCurrencyCode = 'USDT';
    }
    gameCurrencyCode ??= providerModel?.currencies.first;
    selectedCurrency.value = gameCurrencyCode!;
    return _loadGameLink();
  }

  Stream<String?> _loadGameLink() {
    return GameService()
        .getPlayGame(
      providerId: currentProvider.providerCatId ?? '',
      currencyCode: CurrencyService().selectedCurrency.currency!,
      gameCurrencyCode: selectedCurrency.value,
      showModeIsDay: !ThemeManager().isDarkMode,
      isTry: (!AccountService().isLogin && (currentProvider.isTry ?? false)),
    )
        .doOnData((event) {
      final playGameUrl = event.data.playGameUrl;
      if (event.success &&
          playGameUrl is String &&
          playGameUrl.isNotEmpty == true &&
          !event.data.openInBroswer) {
        if (gameLink.value != playGameUrl) {
          // 个别游戏直接调用loadUrl无效，需要销毁webview重新加载，例如：OG真人
          webview.dispose(false).then((value) {
            Future.delayed(const Duration(milliseconds: 300), () {
              webview.loadUrl(url: playGameUrl);
            });
          });
        }
        playGameError.value = '';
      } else {
        _showGameError(event);
      }
    }).doOnError((p0, p1) {
      _showGameError(p0);
    }).flatMap((event) {
      if (event.success != true) return Stream.value(null);
      return Stream.value(event.data.playGameUrl);
    });
  }

  Stream<bool> _getProviderInfo(GamingGameProviderModel? providerModel) {
    if (providerModel != null) {
      return Stream.value(true);
    } else {
      final provider = GameService().provider.firstWhereOrNull(
          (element) => element.providerCatId == currentProvider.providerCatId);
      if (provider != null) {
        return Stream.value(true);
      } else {
        return Stream.value(false);
      }
    }
  }

  Stream<String> _setShowNotSupport(GamingGameProviderModel? providerModel) {
    return IPService.sharedInstance.getIpInfo().flatMap((value) {
      if (providerModel?.countryCode != null &&
          (providerModel?.countryCode?.isNotEmpty ?? false) &&
          providerModel?.countryCode!.contains(value.countryCode) == false) {
        return Stream.value(localized('provider_n_sup_region'));
      } else {
        return Stream.value('');
      }
    });
  }

  void _showGameError(Object? error) {
    String errorDes = localized('gam_conn_err');
    if (error is GoGamingResponse && error.success == false) {
      errorDes = error.toString();
    }
    Toast.showFailed(errorDes);
    playGameError.value = errorDes;
  }

  void changeSelectedCurrency(String currency) {
    selectedCurrency.value = currency;
    _loadGameLink().listen((event) {});
  }
}
