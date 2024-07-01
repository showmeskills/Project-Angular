import 'dart:async';

import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/api/history/models/gaming_account_activity_model.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_date_range_selector/src/gaming_date_range.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/account_activity/common/account_activity_type_enum.dart';
import 'package:gogaming_app/widget_header.dart';

part 'account_activity_state.dart';

abstract class AccountActivityBaseLogic extends GetxController
    with RefreshControllerMixin {
  final IAccountActivityState state;
  final AccountActivityType type;

  AccountActivityBaseLogic({
    required this.state,
    required this.type,
  }) {
    if (type == AccountActivityType.login) {
      state._dateRange.value = GamingDateRange.days(90);
    }
  }

  @override
  void onInit() {
    super.onInit();
    everAll([state._dateRange, state._status], (v) {
      reInitial();
    });
  }

  @override
  LoadCallback? get onRefresh => (p) {
        refreshCompleted(state: LoadState.loading);
        loadData(p).doOnData((event) {
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
        loadData(p).doOnData((event) {
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

  Stream<GoGamingPagination<GamingAccountActivityModel>> loadData(int page) {
    late PGSpiTarget target;
    if (type == AccountActivityType.login) {
      target = History.loginHistory.toTarget(input: {
        'pageIndex': page,
        'pageSize': 10,
        ...state.dateRange.toTimestamp(startKey: 'start', endKey: 'end'),
      });
    } else {
      target = History.operationHistory.toTarget(input: {
        'pageIndex': page,
        'pageSize': 10,
        'status': state.status.value,
        ...state.dateRange.toTimestamp(startKey: 'start', endKey: 'end'),
      });
    }
    return PGSpi(target)
        .rxRequest<GoGamingPagination<GamingAccountActivityModel>>((value) {
      return GoGamingPagination<GamingAccountActivityModel>.fromJson(
        itemFactory: (e) => GamingAccountActivityModel.fromJson(e),
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

  void confirm(GamingDateRange dateRange, AccountActivityStatus status) {
    state._dateRange.value = dateRange;
    state._status.value = status;
    Get.back<void>();
  }
}
