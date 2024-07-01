import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/currency_ratio.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_range_setting_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_transfer_wallet.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/api/game/models/gaming_multip_label_model.dart';

class GameDetailState {
  GameDetailState();

  String playGameUrl = '';
  bool openInBroswer = false;
  bool preLoadTryMode = false;
  bool openGame = false;

  /// 游戏币种
  final displayCurrency = () {
    GamingCurrencyModel? value;
    return value.obs;
  }();

  /// 用户当前币种
  String get currencyCode => CurrencyService().selectedCurrency.currency!;

  final isLogin = AccountService.sharedInstance.isLogin.obs;
  final gameData = GamingGameModel().obs;
  final recommendGame = GamingGameMultipleLabelModel(gameLists: []).obs;

  /// 转账钱包
  final transferWallet =
      GamingOverviewTransferWalletModel(category: '', providerId: '').obs;

  /// 是否需要钱包划转
  bool get needTransfer {
    //游戏钱包未转账或者当前游戏币种未转账
    final transferWallet = this.transferWallet.value;
    final gameCoinActive = transferWallet.currencies
        .firstWhereOrNull((e) => e.currency == displayCurrency.value?.currency)
        ?.isActivate;
    return isTransferGame &&
        (transferWallet.isFirst || gameCoinActive == false);
  }

  bool get isTransferGame => transferWallet.value.providerId.isNotEmpty;

  /// 是否展开详情
  final detailExpand = false.obs;
  final realLinkLoading = false.obs;
  final tryLinkLoading = false.obs;
  final gameInfoLoading = false.obs;

  /// 当前厂商下，当前游戏，当前货币类型下总投注范围
  final allRange = <RangeSettingList>[].obs;

  /// 当前选择的投注范围
  final curRange = RangeSettingList(oddType: '', value: '').obs;
  bool showRangeSetting() {
    return allRange.isNotEmpty && curRange.value.oddType != '';
  }

  GamingGameCurrencyRatio? get selectCurrencyRatio {
    final selectCurrency = displayCurrency.value?.currency;
    var currencyRatio2 = gameData.value.currencyRatio;
    if (currencyRatio2?.isNotEmpty == true) {
      final selectRatio = currencyRatio2!.firstWhere(
        (element) => element.currency == selectCurrency,
        orElse: () => currencyRatio2.first,
      );
      return selectRatio;
    } else {
      return null;
    }
  }

  /// "金额将以1:1000进行展示"提示是否显示
  bool get showBalanceHint {
    final currencyRatio = selectCurrencyRatio;
    return currencyRatio?.ratio != null && currencyRatio!.ratio! > 1;
  }

  RxBool showNoSupport = false.obs;

  final tournament = <TournamentModel>[].obs;

  final tournamentLoaded = false.obs;
}
