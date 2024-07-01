import 'dart:math';

import 'package:big_dart/big_dart.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_aggs_wallet_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_main_wallet.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_transfer_wallet.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/wallet_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/base/go_gaming_response.dart';
import '../delegate/combination_single_render_controller.dart';

part 'wallet_state.dart';

class DashboardWalletLogic extends CombinationController
    with GetTickerProviderStateMixin {
  late final SingleRenderViewController _controller =
      SingleRenderViewController(
    autoLoadData: false,
    initialState: RenderState.loading,
  );
  @override
  SingleRenderViewController get controller => _controller;

  late TabController tabController;

  final state = DashboardWalletState();

  @override
  void onInit() {
    super.onInit();
    _initTabController(state.wallets.length);
    ever<List<GamingAggsWalletModel>>(state._wallets, (value) {
      _initTabController(value.length);
    });
  }

  void _initTabController(int length) {
    tabController =
        TabController(length: length, vsync: this, initialIndex: state.index);
    tabController.removeListener(_tabListenner);
    tabController.addListener(_tabListenner);
  }

  void _tabListenner() {
    if (state.index != tabController.index) {
      state._index.value = tabController.index;
      onTouchedIndex(-1);
    }
  }

  void onTouchedIndex(int index) {
    state._pieTouchedIndex.value = index;
  }

  void toggleEncryption() {
    state._encryption.value = !state.encryption;
  }

  @override
  Stream<void> onLoadDataStream() {
    return CurrencyService().updateRate().flatMap((event) {
      return WalletService().overview().flatMap((value) {
        return Rx.combineLatestList([
          _loadMainWalletBalance(value.overviewWallet),
          _loadTransfeWalletBalance(value.transferWallet),
        ]);
      }).flatMap((value) {
        final wallets = <GamingAggsWalletModel>[];
        for (final e in value) {
          if (e.isEmpty) break;
          wallets.addAll(e);
        }
        return Stream.value(wallets);
      });
    }).doOnData((event) {
      state._wallets.value = event;
      state._index.value =
          state.index > state.wallets.length - 1 ? 0 : state.index;
      state._pieTouchedIndex.value = -1;
      loadCompleted(
        state: LoadState.successful,
      );
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  Stream<List<GamingAggsWalletModel>> _loadTransfeWalletBalance(
      List<GamingOverviewTransferWalletModel> transferWallet) {
    final wallets = transferWallet..removeWhere((wallet) => wallet.isFirst);
    if (wallets.isEmpty) {
      return Stream.value([]);
    }
    return WalletService().loadTransferWalletBalance(transferWallet);
  }

  Stream<List<GamingAggsWalletModel>> _loadMainWalletBalance(
      GamingOverviewMainWalletModel mainWallet) {
    return WalletService.sharedInstance.loadMainWallet().flatMap((event) {
      return Stream.value([
        GamingAggsWalletModel(
          category: mainWallet.category.toLowerCase(),
          currencies: mainWallet.currencies.map((e) {
            return GamingAggsWalletCurrencyModel(
              currency: e.currency,
              totalBalance: e.balance,
              rate: CurrencyService().getUSDTRate(e.currency),
            );
          }).toList(),
        )
      ]);
    });
  }
}
