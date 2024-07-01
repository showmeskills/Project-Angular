import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/api/history/models/gaming_transfer_history_model.dart';
import 'package:gogaming_app/common/api/history/models/gaming_transfer_wallet_select_model.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';

import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part 'gaming_wallet_history_transfer_state.dart';

class GamingWalletHistoryTransferLogic extends BaseController
    with RefreshControllerMixin {
  final state = GamingWalletHistoryTransferState();
  GamingWalletHistoryLogic get baseController =>
      Get.find<GamingWalletHistoryLogic>();

  @override
  void onInit() {
    super.onInit();
    _loadWalletsType();
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
        if (baseController.state.index != 2) return;
        loadCryptoHistory();
      };

  @override
  LoadCallback? get onRefresh => null;

  /// 数字货币
  void loadCryptoHistory() {
    if (state.dataIndex == 1 && state.historyData.isNotEmpty) {
      state.historyData.clear();
    }
    refreshCompleted(
      state: LoadState.loading,
    );
    getHistoryTransferCryptoList(state.dataIndex).listen((event) {
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

  /// 加载钱包类型
  void _loadWalletsType() {
    PGSpi(History.getTransferWalletSelect.toTarget())
        .rxRequest<List<GamingTransferWalletSelectType>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => GamingTransferWalletSelectType.fromJson(
                e as Map<String, dynamic>))
            .toList();
      } else {
        return [];
      }
    }).listen((event) {
      if (event.success) {
        baseController.setDefaultWallet(event.data);
        onLoadMore(1);
      }
    }).onError((Object error) {
      Toast.showFailed(error.toString());
    });
  }

  /// 加载数据
  Stream<GoGamingResponse<GoGamingPagination<GamingTransferHistoryItemModel>>>
      getHistoryTransferCryptoList(int pageIndex) {
    String currency = baseController.state.currency?.currency ?? '';
    if (currency == localized('all')) {
      currency = '';
    }

    Map<String, dynamic> reqParams = {
      'FromWallet': baseController.state.fromWallet?.code,
      'ToWallet': baseController.state.toWallet?.code,
      'StartTime': baseController.state.startTime?.millisecondsSinceEpoch,
      'EndTime': baseController.state.endTime?.millisecondsSinceEpoch,
      'Status': baseController.state.curStatus?.code ?? -1,
      'PageSize': 10,
      'PageIndex': pageIndex,
      'Currency': currency,
    };

    return PGSpi(History.getTransferHistory.toTarget(input: reqParams))
        .rxRequest<GoGamingPagination<GamingTransferHistoryItemModel>>((value) {
      state.dataIndex++;
      return GoGamingPagination<GamingTransferHistoryItemModel>.fromJson(
        itemFactory: (e) => GamingTransferHistoryItemModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    });
  }
}
