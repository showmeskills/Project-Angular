import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/device/device_api.dart';
import 'package:gogaming_app/common/api/device/models/gaming_device_history_model.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/base/go_gaming_response.dart';
import '../delegate/combination_single_render_controller.dart';

part 'device_state.dart';

class DashboardDeviceLogic extends CombinationController {
  late final SingleRenderViewController _controller =
      SingleRenderViewController(
    autoLoadData: false,
    initialState: RenderState.loading,
  );
  @override
  SingleRenderViewController get controller => _controller;

  final state = DashboardDeviceState();

  @override
  void onInit() {
    super.onInit();
    ever<GoGamingPagination<GamingDeviceHistoryModel>>(state._data, (v) {
      loadCompleted(
        state: v.total == 0 ? LoadState.empty : LoadState.successful,
      );
    });
  }

  @override
  Stream<void> onLoadDataStream() {
    return PGSpi(Device.history.toTarget(
      input: {
        'pageIndex': 1,
        'pageSize': 3,
      },
    )).rxRequest<GoGamingPagination<GamingDeviceHistoryModel>>((value) {
      return GoGamingPagination<GamingDeviceHistoryModel>.fromJson(
        itemFactory: (e) => GamingDeviceHistoryModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    }).doOnData((event) {
      state._data.value = GoGamingPagination(
        total: event.data.count,
        list: event.data.list,
      );
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  void reset(List<GamingDeviceHistoryModel> data) {
    state._data.value = GoGamingPagination(
      total: data.length,
      list: data,
    );
  }
}
