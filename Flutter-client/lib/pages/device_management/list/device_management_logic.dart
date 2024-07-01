import 'dart:math';

import 'package:base_framework/base_framework.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/device/device_api.dart';
import 'package:gogaming_app/common/api/device/models/gaming_device_history_model.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/dashboard/logics/device_logic.dart';

part 'device_management_state.dart';

class DeviceManagementLogic extends BaseController with RefreshControllerMixin {
  final state = DeviceManagementState();

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

  Stream<GoGamingPagination<GamingDeviceHistoryModel>> _loadData(int page) {
    return PGSpi(Device.history.toTarget(input: {
      'pageIndex': page,
      'pageSize': 10,
    })).rxRequest<GoGamingPagination<GamingDeviceHistoryModel>>((value) {
      return GoGamingPagination<GamingDeviceHistoryModel>.fromJson(
        itemFactory: (e) => GamingDeviceHistoryModel.fromJson(e),
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

  DashboardDeviceLogic? _findDashboardDeviceLogic() {
    try {
      return Get.find<DashboardDeviceLogic>();
    } catch (e) {
      return null;
    }
  }

  void delete(int id) {
    SmartDialog.showLoading<void>();
    PGSpi(Device.delete.toTarget(inputData: {
      'deviceId': id,
    })).rxRequest<void>((value) {}).doOnData((event) {
      state._data.value = state.data.copyWith(
        total: state.data.total - 1,
        list: List.from(state.data.list)
          ..removeWhere((element) => element.id == id),
      );
      _findDashboardDeviceLogic()?.reset(
          state.data.list.getRange(0, min(3, state.data.count)).toList());
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }
}
