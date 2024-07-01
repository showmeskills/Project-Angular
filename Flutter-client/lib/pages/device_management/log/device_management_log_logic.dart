import 'package:base_framework/base_framework.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/device/device_api.dart';
import 'package:gogaming_app/common/api/device/models/gaming_device_log_model.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

part 'device_management_log_state.dart';

class DeviceManagementLogLogic extends BaseController
    with RefreshControllerMixin {
  final state = DeviceManagementLogState();

  final int id;

  DeviceManagementLogLogic(this.id);

  @override
  LoadCallback? get onRefresh => (p) {
        refreshCompleted(state: LoadState.loading);
        _loadData(p).doOnData((event) {
          refreshCompleted(
            state: LoadState.successful,
            count: state.data.count,
            total: event.total,
          );
        }).doOnError((err, p1) {
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
          refreshCompleted(state: LoadState.failed);
        }).listen(null, onError: (p0, p1) {});
      };

  @override
  LoadCallback? get onLoadMore => (p) {
        loadMoreCompleted(state: LoadState.loading);
        _loadData(p).doOnData((event) {
          loadMoreCompleted(
            state: LoadState.successful,
            count: state.data.count,
            total: event.total,
          );
        }).doOnError((err, p1) {
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
          loadMoreCompleted(state: LoadState.failed);
        }).listen(null, onError: (p0, p1) {});
      };

  Stream<GoGamingPagination<GamingDeviceLogModel>> _loadData(int page) {
    return PGSpi(Device.getDeviceLog.toTarget(input: {
      'deviceId': id,
      'pageIndex': page,
      'pageSize': 10,
    })).rxRequest<GoGamingPagination<GamingDeviceLogModel>>((value) {
      return GoGamingPagination<GamingDeviceLogModel>.fromJson(
        itemFactory: (e) => GamingDeviceLogModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      if (page == 1) {
        state._data.value = event;
      } else {
        state._data.value = state.data.apply(event);
      }
    });
  }
}
