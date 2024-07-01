import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/api/game_order/models/gaming_recent_order_model.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/base/go_gaming_response.dart';
import '../delegate/combination_single_render_controller.dart';

part 'game_order_state.dart';

class DashboardGameOrderLogic extends CombinationController {
  late final SingleRenderViewController _controller =
      SingleRenderViewController(
    autoLoadData: false,
    initialState: RenderState.loading,
  );
  @override
  SingleRenderViewController get controller => _controller;

  final state = DashboardGameOrderState();

  @override
  void onInit() {
    super.onInit();
    ever<GoGamingPagination<GamingRecentOrderModel>>(state._data, (v) {
      loadCompleted(
        state: v.total == 0 ? LoadState.empty : LoadState.successful,
      );
    });
  }

  @override
  Stream<void> onLoadDataStream() {
    return PGSpi(GameOrder.recentOrder.toTarget(
      input: {
        'pageIndex': 1,
        'pageSize': 9,
      },
    )).rxRequest<GoGamingPagination<GamingRecentOrderModel>>((value) {
      return GoGamingPagination<GamingRecentOrderModel>.fromJson(
        itemFactory: (e) => GamingRecentOrderModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    }).doOnData((event) {
      state._data.value = event.data;
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }
}
