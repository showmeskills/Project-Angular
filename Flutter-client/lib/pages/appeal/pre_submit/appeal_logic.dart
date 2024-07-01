import 'package:base_framework/base_framework.dart';
import 'package:gogaming_app/common/api/appeal/appeal_api.dart';
import 'package:gogaming_app/common/api/appeal/models/gaming_appeal_model.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

part 'appeal_state.dart';

class AppealLogic extends BaseController with RefreshControllerMixin {
  final state = AppealState();

  @override
  LoadCallback? get onRefresh => null;

  @override
  LoadCallback? get onLoadMore => (p1) {
        loadData(p1).listen(null, onError: (p0, p1) {});
      };

  @override
  void onInit() {
    super.onInit();
    onLoadMore?.call(1);
  }

  Stream<GoGamingPagination<GamingAppealModel>> loadData(int page,
      [bool showLoading = true]) {
    if (showLoading) {
      loadMoreCompleted(state: LoadState.loading);
    }
    return _loadData(page).doOnData((event) {
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
    });
  }

  Stream<GoGamingPagination<GamingAppealModel>> _loadData(int page) {
    return PGSpi(Appeal.list.toTarget(
      input: {
        'page': page,
        'pageSize': 10,
      },
    )).rxRequest<GoGamingPagination<GamingAppealModel>>((value) {
      return GoGamingPagination<GamingAppealModel>.fromJson(
        itemFactory: (e) => GamingAppealModel.fromJson(e),
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

  void changeType(int type) {
    state._type.value = type;
  }

  void refreshData() {
    state._type.value = null;
    loadData(1, false).listen(null, onError: (p0, p1) {});
  }
}
