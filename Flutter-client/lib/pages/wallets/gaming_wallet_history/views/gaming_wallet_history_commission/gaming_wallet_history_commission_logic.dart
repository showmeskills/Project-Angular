import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/api/history/models/gaming_commission_model.dart';
import 'package:gogaming_app/common/api/history/models/gaming_commission_type.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';

import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part 'gaming_wallet_history_commission_state.dart';

class GamingWalletHistoryCommissionLogic extends BaseController
    with RefreshControllerMixin {
  final state = GamingWalletHistoryCommissionState();
  GamingWalletHistoryLogic get baseController =>
      Get.find<GamingWalletHistoryLogic>();

  @override
  void onInit() {
    super.onInit();
    _loadType();
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
        if (baseController.state.index != 5) return;
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
    getHistoryCommissionList(state.dataIndex).listen((event) {
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
  void _loadType() {
    PGSpi(History.getCommissionType.toTarget())
        .rxRequest<List<CommissionType>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => CommissionType.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        return [];
      }
    }).listen((event) {
      if (event.success) {
        baseController.setDefaultAllCommissionType(event.data);
        onLoadMore(1);
      }
    }).onError((Object error) {
      Toast.showFailed(error.toString());
    });
  }

  /// 加载数据
  Stream<GoGamingResponse<GoGamingPagination<GamingCommissionModel>>>
      getHistoryCommissionList(int pageIndex) {
    String returnType = baseController.state.curCommissionType.code;
    if (returnType == localized('all')) {
      returnType = '';
    }

    Map<String, dynamic> reqParams = {
      "ReturnType": returnType, //全部的话，传空
      'StartTime': baseController.state.startTime?.millisecondsSinceEpoch,
      'EndTime': baseController.state.endTime?.millisecondsSinceEpoch,
      'PageSize': 10,
      'PageIndex': pageIndex,
    };
    return PGSpi(History.getCommissionHistory.toTarget(input: reqParams))
        .rxRequest<GoGamingPagination<GamingCommissionModel>>((value) {
      state.dataIndex++;
      return GoGamingPagination<GamingCommissionModel>.fromJson(
        itemFactory: (e) => GamingCommissionModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    });
  }
}
