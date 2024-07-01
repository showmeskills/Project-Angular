import 'dart:ui';

import 'package:base_framework/base_controller.dart';
import 'package:big_dart/big_dart.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_aggs_wallet_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_wallet_currency.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_wallet_overview_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_main_wallet.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';

class WalletHomeState {
  /// 资产是否加密
  final obscureFund = false.obs;

  /// 总览信息
  final walletOverview = GamingWalletOverviewModel(
    uid: '',
    overviewWallet: GamingOverviewMainWalletModel(category: ''),
    bonusDetail: [],
  ).obs;

  /// usdt到当前币种的汇率
  final selectedExchange = 0.0.obs;

  /// 提款限额
  final takeLimit = 0.00.obs;

  String get takeLimitText =>
      NumberPrecision(takeLimit.value).balanceText(false);

  final transferWallets = <GamingAggsWalletModel>[].obs;

  /// 当前选中币种
  GamingCurrencyModel get selectedCurrency =>
      CurrencyService().selectedCurrency;

  String get currency => selectedCurrency.currency ?? '';

  /// 总资产
  String get totalText => NumberPrecision(totalAsset).balanceText(false);

  /// 总资产=主钱包资产+转账钱包资产+抵用金余额
  double get totalAsset {
    final mainBalance = mainTotal;
    final transferBalance = transferWallets.isEmpty
        ? Big(0)
        : transferWallets
            .map((element) => element.total)
            .reduce((a, b) => a + b);
    final total = mainBalance + transferBalance.toNumber() + totalBonus;
    return total;
  }

  /// 主账户总资产
  String get mainTotalText => NumberPrecision(mainTotal).balanceText(false);

  double get mainTotal => walletOverview.value.overviewWallet.totalBalance;

  /// 待确定USDT
  String get totalFreezeText =>
      walletOverview.value.overviewWallet.totalFreezeText;
  double get totalFreeze =>
      walletOverview.value.overviewWallet.totalFreezeAmount.toDouble();

  /// 真人娱乐场非粘性奖金
  double get liveCasinoTotalAmount =>
      walletOverview.value.nonStickyBonusWallet
          .firstWhereOrNull((element) {
            return element.category == 'NSLiveCasino';
          })
          ?.totalAmount
          ?.toDouble() ??
      0;
  String get liveCasinoTotalAmountText =>
      NumberPrecision(liveCasinoTotalAmount).balanceText(false);

  /// 娱乐场非粘性奖金
  double get casinoTotalAmount =>
      walletOverview.value.nonStickyBonusWallet
          .firstWhereOrNull((element) {
            return element.category == 'NSSlotGame';
          })
          ?.totalAmount
          ?.toDouble() ??
      0;
  String get casinoTotalAmountText =>
      NumberPrecision(casinoTotalAmount).balanceText(false);

  /// 总红利
  String get totalBonusText => NumberPrecision(totalBonus).balanceText(false);

  /// 抵用金余额
  double get totalBonus => walletOverview.value.totalBonus;

  /// 非粘性奖金余额
  num get totalNonStickyBonus => walletOverview.value.totalNonStickyBonus;

  /// 钱包对应的描述
  final walletDesc = {
    'main': 'w_view_main_tip',
    'kychess': 'ky_start',
    'boyachess': 'boya_desc',
    'agslot': 'new_ag_desc',
    'sgwinchess': 'sg_win_desc',
    'golden': 'golden_desc',
    'baison': 'baison_desc',
    'fchunter': 'fchunter_desc',
    'yychess': 'yychess_desc',
    'gpichess': 'gpichess_desc',
    'jdbgame': "jdb_desc",
    'bbinlive': 'bbinlive_desc',
  };

  final clearWithdrawCurrencies = <GamingWalletOverviewCurrencyModel>[].obs;

  String get clearWithdrawHint =>
      '${FeeService().confirmClearWithdrawlimitTips} ${clearWithdrawCurrencies.map((element) => element.currency).join("、")}';

  /// 待确认余额问号位置
  final freezePosition = Offset.zero.obs;

  /// 抵用金问号位置
  final bonusPosition = Offset.zero.obs;

  /// 真人娱乐场奖金问号位置
  final liveCasinoPosition = Offset.zero.obs;

  /// 娱乐场奖金问号位置
  final slotPosition = Offset.zero.obs;

  /// 提款限额问号位置
  final withdrawPosition = Offset.zero.obs;
}
