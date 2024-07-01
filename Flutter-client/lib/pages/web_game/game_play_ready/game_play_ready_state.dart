import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/currency_ratio.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_provider_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_range_setting_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_transfer_wallet.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/game_service.dart';

class GamePlayReadyState {
  GamePlayReadyState();

  /// 游戏厂商
  GamingGameProviderModel? providerModel;

  /// 游戏币种
  final gameCurrency = () {
    GamingCurrencyModel? value;
    return value.obs;
  }();

  /// 用户选择币种
  GamingCurrencyModel get userCurrency => CurrencyService().selectedCurrency;

  bool get isTransferGame => providerModel?.isTransfer ?? false;

  /// 转账钱包
  final transferWallet =
      GamingOverviewTransferWalletModel(category: '', providerId: '').obs;

  /// 加载游戏链接中
  final realLinkLoading = false.obs;

  /// 试玩游戏链接加载中
  final tryLinkLoading = false.obs;

  final gameOffLine = false.obs;

  List<String>? get supportGameCurrencies => providerModel?.currencies;

  /// 自否能够自动进入游戏
  bool get canAutoPlayGame {
    /// 体育游戏可以直接进入游戏中
    if ((providerModel?.isSport ?? false) && (providerModel?.isTry ?? false)) {
      return true;
    }
    final gameService = GameService();
    final isSameCurrency =
        gameService.displayCurrency(gameCurrency.value?.currency) ==
            gameService.displayCurrency(userCurrency.currency);

    return canPreloadGame && isSameCurrency;
  }

  bool get canPreloadGame {
    final isLogin = AccountService().isLogin;
    final showBalanceHint = this.showBalanceHint;
    final needTransfer = this.needTransfer;
    final hasBetRange = this.hasBetRange;

    return isLogin && !showBalanceHint && !hasBetRange && !needTransfer;
  }

  bool get hasBetRange {
    return showRangeSetting();
  }

  /// 当前厂商下，当前游戏，当前货币类型下总投注范围
  final allRange = <RangeSettingList>[].obs;

  /// 当前选择的投注范围
  final curRange = RangeSettingList(oddType: '', value: '').obs;
  bool showRangeSetting() {
    return allRange.isNotEmpty && curRange.value.oddType != '';
  }

  /// 是否需要钱包划转
  bool get needTransfer {
    //游戏钱包未转账或者当前游戏币种未转账
    final transferWallet = this.transferWallet.value;
    final gameCoinActive = transferWallet.currencies
        .firstWhereOrNull((e) => e.currency == gameCurrency.value?.currency)
        ?.isActivate;
    return isTransferGame && (transferWallet.isFirst || gameCoinActive != true);
  }

  /// "金额将以1:xx进行展示"提示是否显示
  bool get showBalanceHint {
    final result = currencyRatio;
    return result != null && result.ratio! > 1;
  }

  GamingGameCurrencyRatio? get currencyRatio {
    final result = providerModel?.currencyRatio?.firstWhereOrNull(
        (element) => element.currency == gameCurrency.value?.currency);
    return result;
  }

  final playGameError = ''.obs;
  final playGameSupportError = ''.obs;
  bool openInBroswer = false;
}
