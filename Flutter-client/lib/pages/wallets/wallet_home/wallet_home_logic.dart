import 'dart:async';

import 'package:gogaming_app/common/api/wallet/models/gaming_aggs_wallet_model.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/common/service/wallet_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

import 'wallet_home_state.dart';

class WalletHomeLogic extends BaseController {
  final WalletHomeState state = WalletHomeState();

  late StreamSubscription<dynamic> userBalanceSub;
  late StreamSubscription<dynamic> currencySub;

  CurrencyService get currencyService => CurrencyService();

  WalletService get walletService => WalletService();

  @override
  void onInit() {
    super.onInit();
    //订阅余额更新
    userBalanceSub = AccountService().userBalances.listen((p0) {
      getWalletViewData();
    });
    // 订阅选中币种更新
    currencySub = currencyService.selectedCurrencyObs.listen((p0) {
      _updateSelectCurrencyRate();
      update(['header']);
    });
  }

  /// 刷新钱包数据
  void getWalletViewData() {
    if (!AccountService().isLogin) return;
    getClearWithdrawalLimitCurrency();

    showLoading();
    // 先更新汇率和钱包总览信息
    currencyService.updateRate().flatMap((value) {
      return WalletService().overview().doOnData((event) {
        state.walletOverview(event);
      });
    }).flatMap((value) {
      updateRate();
      // 获取转账钱包信息
      return walletService
          .loadTransferWalletBalance(state.walletOverview.value.transferWallet);
    }).listen((value) {
      hideLoading();

      final wallets = <GamingAggsWalletModel>[];
      if (value.isNotEmpty) {
        wallets.addAll(value);
        state.transferWallets.assignAll(wallets);
      }
      update();
    }, onError: (Object err) {
      hideLoading();
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  void getClearWithdrawalLimitCurrency() {
    walletService.getClearWithdrawal().listen((event) {
      state.clearWithdrawCurrencies.assignAll(event);
    }, onError: (e) {});
  }

  /// 刷新汇率对应数据
  void updateRate() {
    _updateSelectCurrencyRate();

    final currencies = state.walletOverview.value.overviewWallet.currencies;
    final takeLimit = currencies.isEmpty
        ? 0.00
        : currencies.map((e) {
            if (e.withdrawLimit > 0) {
              final rate = CurrencyService().getUSDTRate(e.currency, 0.0);
              return e.withdrawLimit * rate;
            }
            return 0.0;
          }).reduce((a, b) => a + b);
    state.takeLimit.value = takeLimit;
  }

  void _updateSelectCurrencyRate() {
    state.selectedExchange.value = currencyService.getUSDTRate(
        currencyService.selectedCurrency.currency, 0.00);
  }

  /// 转换usdt到用户选择币种
  String usdtConvert(dynamic num) {
    final currency = state.selectedCurrency;

    final result = NumberPrecision(num)
        .divide(NumberPrecision(state.selectedExchange.value));

    return result.balanceText(currency.isDigital);
  }

  /// 改变加密显示
  void changeSecure() {
    state.obscureFund.value = !state.obscureFund.value;
    update();
  }

  /// 清除提款限额
  void clearWithdraw() {
    walletService.clearWithdrawalLimit().listen((event) {
      if (event) {
        state.clearWithdrawCurrencies.assignAll([]);
        getWalletViewData();
        Toast.showSuccessful(FeeService().withdrawlimitSuccess);
      } else {
        Toast.showFailed(FeeService().withdrawlimitFail);
      }
    }, onError: (e) {
      Toast.showFailed(FeeService().withdrawlimitFail);
    });
  }

  /// 清除抵用券
  void clearCredit() {
    walletService.clearCredit().listen((event) {
      if (event) {
        Toast.showSuccessful(localized('bonus_success'));
        getWalletViewData();
      } else {
        Toast.showFailed(localized('bonus_fail'));
      }
    }, onError: (Object e) {
      if (e is GoGamingResponse) {
        Toast.showFailed(e.message);
      } else {
        Toast.showFailed(localized('bonus_fail'));
      }
    });
  }

  @override
  void onClose() {
    super.onClose();
    userBalanceSub.cancel();
    currencySub.cancel();
  }
}
