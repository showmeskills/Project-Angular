import 'package:base_framework/base_framework.dart';
import 'package:expandable/expandable.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/api/game_order/models/gaming_wager_day_total/gaming_wager_day_total_model.dart';
import 'package:gogaming_app/common/api/game_order/models/gaming_wager_day_total/gaming_wager_day_total_stat_model.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_date_range_selector/gaming_date_range_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_date_range_selector/src/gaming_date_range.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_wager_status_selector.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/api/game_order/models/gaming_wager_status_model.dart';

part 'game_order_state.dart';

abstract class BaseGameOrderLogic<T> extends GetxController
    with SingleRenderControllerMixin {
  BaseGameOrderLogic({
    this.gameType = GameType.sportsBook,
    required this.state,
  });

  final GameType gameType;
  final IGameOrderState<T> state;

  late final GamingWagerStatusSelector _statusSelector =
      GamingWagerStatusSelector(gameType: gameType);

  GamingWagerStatusSelector get statusSelector => _statusSelector;

  @override
  void onInit() {
    super.onInit();
    everAll([state._dateRange, state._status], (v) {
      loadData().listen(null, onError: (p0, p1) {});
    });
  }

  @override
  void Function()? get onLoadData => () {
        loadData(true).listen(null, onError: (p0, p1) {});
      };

  Stream<void> loadData([bool isRefresh = false]) {
    loadCompleted(state: LoadState.loading);
    return Rx.combineLatestList([
      isRefresh ? _statusSelector.loadDataStream() : Stream.value(true),
      loadTotalStat(),
    ]).doOnData((event) {
      loadCompleted(
        state: state.dayTotal.isEmpty ? LoadState.empty : LoadState.successful,
      );
    }).doOnError((err, p1) {
      loadCompleted(state: LoadState.failed);
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  Stream<GamingWagerDayTotalModel> loadTotalStat() {
    return PGSpi(GameOrder.getWagerDayTotal.toTarget(
      input: {
        'gameType': gameType.value,
        if (!state.status.isAll) 'wagerStatus': state.status.code,
        ...state.dateRange.toTimestamp(),
      },
    )).rxRequest<GamingWagerDayTotalModel>((value) {
      return GamingWagerDayTotalModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      state.total = event;
      state.dayTotal = {
        for (var e in event.list) e: GameOrderDayItemState(),
      };
      // 加载第一个day的list
      if (state.dayTotal.isNotEmpty) {
        loadListData(state.dayTotal.keys.first)
            .listen(null, onError: (p0, p1) {});
      }
    });
  }

  GameOrderDayItemState<T> findItemState(GamingWagerDayTotalStatModel key) {
    return state.dayTotal[key]!;
  }

  ExpandableController findExpandableController(
      GamingWagerDayTotalStatModel key) {
    return findItemState(key).expandableController;
  }

  GoGamingPagination<T> dataFactory(Map<String, dynamic> value);

  Stream<void> loadListData(GamingWagerDayTotalStatModel key) {
    final item = findItemState(key);
    item.isLoading = true;
    final strat = DateTime.parse(key.day).add(DateTime.now().timeZoneOffset);
    return PGSpi(GameOrder.getWagerList.toTarget(
      input: {
        'gameType': gameType.value,
        if (!state.status.isAll) 'wagerStatus': state.status.code,
        'page': item.page,
        'pageSize': item.pageSize,
        'beginTime': strat.millisecondsSinceEpoch,
        'endTime': strat.add(const Duration(days: 1)).millisecondsSinceEpoch,
      },
    )).rxRequest<GoGamingPagination<T>>(dataFactory).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      if (item.page == 1) {
        item.loaded = true;
        item.data = event;
      } else {
        item.data = item.data.apply(event);
      }
      if (item.data.total > item.data.count) {
        item.page += 1;
      }
      if (!item.expandableController.expanded) {
        item.expandableController.expanded = true;
      }
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      item.isLoading = false;
    });
  }

  void toggle(GamingWagerDayTotalStatModel key) {
    final item = findItemState(key);
    if (!item.expandableController.expanded && !item.loaded) {
      loadListData(key).listen(null, onError: (p0, p1) {});
    } else {
      item.expandableController.toggle();
    }
  }

  void loadMore(GamingWagerDayTotalStatModel key) {
    final item = findItemState(key);
    if (item.isLoading) {
      return;
    }
    loadListData(key).listen(null, onError: (p0, p1) {});
  }

  void openStatusSelector() {
    if (controller.state.renderState == RenderState.loading) {
      Toast.showTryLater();
      return;
    }
    _statusSelector.show(selected: state.status).then((value) {
      if (value != null) {
        state.status = value;
      }
    });
  }

  void openDateSelector() {
    if (controller.state.renderState == RenderState.loading) {
      Toast.showTryLater();
      return;
    }

    GamingDateRangeSelector.show(
      selected: state.dateRange,
      isUtc: true,
    ).then((value) {
      if (value != null) {
        if (value != GamingDateRangeType.custom) {
          state.dateRange = GamingDateRange.fromType(value, isUtc: true);
        } else {
          GamingDateRangeSelector.showCustom(
            selected: state.dateRange,
            isUtc: true,
          ).then((value) {
            if (value != null) {
              state.dateRange = value;
            }
          });
        }
      }
    });
  }

  String getStatusText(String code) {
    return _statusSelector.getStatusText(code);
  }
}
