import 'package:flutter/foundation.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/api/history/models/gaming_crypto_history_model.dart';
import 'package:gogaming_app/common/api/history/models/gaming_currency_history_model.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part 'gaming_wallet_history_withdraw_state.dart';

class GamingWalletHistoryWithdrawLogic extends BaseController
    with RefreshControllerMixin {
  final state = GamingWalletHistoryWithdrawState();
  GamingWalletHistoryLogic get baseController =>
      Get.find<GamingWalletHistoryLogic>();

  @override
  void onInit() {
    super.onInit();
    onLoadMore(1);
    GamingEvent.refreshHistoryWallet.subscribe(() {
      state.cryptoDataIndex = 1;
      state.currencyDataIndex = 1;
      onLoadMore(1);
    });
  }

  @override
  void onClose() {
    GamingEvent.refreshHistoryWallet.unsubscribe(() {});
    super.onClose();
  }

  @override
  LoadCallback get onLoadMore => (p) async {
        if (baseController.state.index != 1) return;
        if (baseController.state.isDigital.value) {
          loadCryptoHistory();
        } else {
          loadCurrencyHistory();
        }
      };

  @override
  LoadCallback? get onRefresh => null;

  /// 数字货币
  void loadCryptoHistory() {
    if (state.cryptoDataIndex == 1 && state.cryptoData.isNotEmpty) {
      state.cryptoData.clear();
    }
    refreshCompleted(
      state: LoadState.loading,
    );
    getHistoryWithdrawCryptoList(state.cryptoDataIndex).listen((event) {
      state.cryptoData.addAll(event.data.list);
      loadMoreCompleted(
        state: LoadState.successful,
        total: event.data.total,
        count: state.cryptoData.length,
      );
    }).onError((p0, p1) {
      refreshCompleted(
        state: LoadState.failed,
      );
    });
  }

  /// 请求数字货币提现记录
  Stream<GoGamingResponse<GoGamingPagination<GamingCryptoHistoryModel>>>
      getHistoryWithdrawCryptoList(int pageIndex) {
    String currency = baseController.state.currency?.currency ?? '';
    if (currency == localized('all')) {
      currency = '';
    }
    Map<String, dynamic> reqParams = {
      'category': 'withdraw',
      'StartTime': baseController.state.startTime?.millisecondsSinceEpoch,
      'EndTime': baseController.state.endTime?.millisecondsSinceEpoch,
      'PageSize': 10,
      'PageIndex': pageIndex,
      'Currency': currency,
      'OrderStatus': baseController.state.curStatus?.code ?? '',
    };
    return PGSpi(History.crypto.toTarget(
      input: reqParams,
    )).rxRequest<GoGamingPagination<GamingCryptoHistoryModel>>((value) {
      debugPrint('value = $value');
      state.cryptoDataIndex++;
      return GoGamingPagination<GamingCryptoHistoryModel>.fromJson(
        itemFactory: (e) => GamingCryptoHistoryModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    });
  }

  /// 法币
  void loadCurrencyHistory() {
    if (state.currencyDataIndex == 1 && state.currencyData.isNotEmpty) {
      state.currencyData.clear();
    }
    refreshCompleted(
      state: LoadState.loading,
    );
    getHistoryWithdrawCurrencyList(state.currencyDataIndex).listen((event) {
      state.currencyData.addAll(event.data.list);
      loadMoreCompleted(
        state: LoadState.successful,
        total: event.data.total,
        count: state.currencyData.length,
      );
    }).onError((p0, p1) {
      refreshCompleted(
        state: LoadState.failed,
      );
    });
  }

  /// 请求法币货币充值记录
  Stream<GoGamingResponse<GoGamingPagination<GamingCurrencyHistoryModel>>>
      getHistoryWithdrawCurrencyList(int pageIndex) {
    String currency = baseController.state.currency?.currency ?? '';
    if (currency == localized('all')) {
      currency = '';
    }
    Map<String, dynamic> reqParams = {
      'category': 'withdraw',
      'StartTime': baseController.state.startTime?.millisecondsSinceEpoch,
      'EndTime': baseController.state.endTime?.millisecondsSinceEpoch,
      'PageSize': 10,
      'PageIndex': pageIndex,
      'Currency': currency,
      'OrderStatus': baseController.state.curStatus?.code ?? '',
    };

    return PGSpi(History.currency.toTarget(
      input: reqParams,
    )).rxRequest<GoGamingPagination<GamingCurrencyHistoryModel>>((value) {
      state.currencyDataIndex++;
      return GoGamingPagination<GamingCurrencyHistoryModel>.fromJson(
        itemFactory: (e) => GamingCurrencyHistoryModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    });
  }
}
