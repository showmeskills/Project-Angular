import 'package:base_framework/base_controller.dart';

import '../../../../common/api/nonsticky/models/gaming_nonsticky_list_model.dart';
import '../../../../common/api/nonsticky/models/gaming_wallet_overview_model.dart';

class NoneStickyState {
  final walletOverview = GamingNonstickyWalletOverviewModel().obs;

  final activatedModel = GamingNonstickyModel().obs;

  final unactivatedModel = GamingNonstickyListModel().obs;
}
