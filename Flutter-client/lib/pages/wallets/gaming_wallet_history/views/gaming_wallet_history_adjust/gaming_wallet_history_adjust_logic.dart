import 'package:flutter/foundation.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/api/history/models/gaming_history_adjust.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part 'gaming_wallet_history_adjust_state.dart';

class GamingWalletHistoryAdjustLogic extends BaseController
    with RefreshControllerMixin {
  final state = GamingWalletHistoryAdjustState();
  GamingWalletHistoryLogic get baseController =>
      Get.find<GamingWalletHistoryLogic>();

  @override
  void onInit() {
    super.onInit();
    onLoadMore(1);
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
        if (baseController.state.index != 4) return;
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
    getHistoryAdjustList(state.dataIndex).listen((event) {
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

  /// 加载数据
  Stream<GoGamingResponse<GoGamingPagination<GamingHistoryAdjust>>>
      getHistoryAdjustList(int pageIndex) {
    String currency = baseController.state.currency?.currency ?? '';
    if (currency == localized('all')) {
      currency = '';
    }

    Map<String, dynamic> reqParams = {
      "Category": baseController.state.curAdjustAccount.category,
      "Status": baseController.state.curStatus?.code ?? 0,
      'StartTime': baseController.state.startTime?.millisecondsSinceEpoch,
      'EndTime': baseController.state.endTime?.millisecondsSinceEpoch,
      'PageSize': 10,
      'PageIndex': pageIndex,
      'Currency': currency,
    };

    debugPrint('getHistoryAdjustList reqParams = $reqParams');

    return PGSpi(History.getAdjustList.toTarget(input: reqParams))
        .rxRequest<GoGamingPagination<GamingHistoryAdjust>>((value) {
      state.dataIndex++;
      return GoGamingPagination<GamingHistoryAdjust>.fromJson(
        itemFactory: (e) => GamingHistoryAdjust.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    });
  }
}
