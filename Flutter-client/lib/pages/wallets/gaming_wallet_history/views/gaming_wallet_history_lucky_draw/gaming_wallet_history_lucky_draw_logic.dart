import 'package:gogaming_app/common/api/lucky_spin/lucky_spin_api.dart';
import 'package:gogaming_app/common/api/lucky_spin/models/game_lucky_spin_draw_model.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part 'gaming_wallet_history_lucky_draw_state.dart';

class GamingWalletHistoryLuckyDrawLogic extends BaseController
    with RefreshControllerMixin {
  final state = GamingWalletHistoryLuckyDrawState();
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
        if (baseController.state.index != 6) {
          return;
        }
        loadCryptoHistory();
      };

  @override
  LoadCallback? get onRefresh => null;

  void loadCryptoHistory() {
    if (state.dataIndex == 1 && state.historyData.isNotEmpty) {
      state.historyData.clear();
    }
    refreshCompleted(
      state: LoadState.loading,
    );
    getHistoryLuckyDrawList(state.dataIndex).listen((event) {
      state.historyData.addAll(event.data.histories);
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
  Stream<GoGamingResponse<GameLuckySpinDrawModel>> getHistoryLuckyDrawList(
      int pageIndex) {
    Map<String, dynamic> reqParams = {
      'startTime': baseController.state.startTime?.millisecondsSinceEpoch,
      'endTime': baseController.state.endTime?.millisecondsSinceEpoch,
      'pageSize': 10,
      'pageIndex': pageIndex,
    };
    return PGSpi(
            LuckySpinApi.getTurnTableSpinHistory.toTarget(input: reqParams))
        .rxRequest<GameLuckySpinDrawModel>((value) {
      state.dataIndex++;
      GameLuckySpinDrawModel model = GameLuckySpinDrawModel.fromJson(
          value['data'] as Map<String, dynamic>);
      return model;
    });
  }
}
