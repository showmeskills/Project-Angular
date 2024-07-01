import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/api/history/models/gaming_bonus_grant_type_model.dart';
import 'package:gogaming_app/common/api/history/models/gaming_bonus_model.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';

import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part 'gaming_wallet_history_bonus_state.dart';

class GamingWalletHistoryBonusLogic extends BaseController
    with RefreshControllerMixin {
  final state = GamingWalletHistoryBonusState();
  GamingWalletHistoryLogic get baseController =>
      Get.find<GamingWalletHistoryLogic>();

  @override
  void onInit() {
    super.onInit();
    _loadBonusType();
    GamingEvent.refreshHistoryWallet.subscribe(() {
      state.dataIndex = 1;
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
        if (baseController.state.index != 3) return;
        loadHistory();
      };

  @override
  LoadCallback? get onRefresh => null;

  void loadHistory() {
    if (state.dataIndex == 1 && state.historyData.isNotEmpty) {
      state.historyData.clear();
    }
    refreshCompleted(
      state: LoadState.loading,
    );
    getHistoryBonusCryptoList(state.dataIndex).listen((event) {
      state.historyData.addAll(event.data.list);
      loadMoreCompleted(
        state: LoadState.successful,
        total: event.data.total,
        count: state.historyData.length,
      );
    }).onError((p0, p1) {
      refreshCompleted(
        state: LoadState.failed,
      );
    });
  }

  /// 加载红利发放方式
  void _loadBonusType() {
    PGSpi(History.getGrantTypeSelect.toTarget())
        .rxRequest<List<GamingBonusGrantTypeModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) =>
                GamingBonusGrantTypeModel.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        return [];
      }
    }).listen((event) {
      if (event.success) {
        baseController.setDefaultAllBonus(event.data);
        onLoadMore(1);
      }
    }).onError((Object error) {
      Toast.showFailed(error.toString());
    });
  }

  /// 加载数据
  Stream<GoGamingResponse<GoGamingPagination<GamingBonusModel>>>
      getHistoryBonusCryptoList(int pageIndex) {
    String currency = baseController.state.currency?.currency ?? '';
    if (currency == localized('all')) {
      currency = '';
    }

    Map<String, dynamic> reqParams = {
      'GrantType': baseController.state.curBonusType?.code,
      'Currency': currency,
      'StartTime': baseController.state.startTime?.millisecondsSinceEpoch,
      'EndTime': baseController.state.endTime?.millisecondsSinceEpoch,
      'PageSize': 10,
      'PageIndex': pageIndex,
    };

    return PGSpi(History.getBonusGrantList.toTarget(input: reqParams))
        .rxRequest<GoGamingPagination<GamingBonusModel>>((value) {
      state.dataIndex++;
      return GoGamingPagination<GamingBonusModel>.fromJson(
        itemFactory: (e) => GamingBonusModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    });
  }
}
