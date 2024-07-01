import 'dart:math';

import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_activity_model/gaming_activity_model.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/base/go_gaming_response.dart';
import '../delegate/combination_single_render_controller.dart';

part 'activity_state.dart';

class DashboardActivityLogic extends CombinationController {
  late final SingleRenderViewController _controller =
      SingleRenderViewController(
    autoLoadData: false,
    initialState: RenderState.loading,
  );
  @override
  SingleRenderViewController get controller => _controller;

  final state = DashboardActivityState();

  @override
  void onInit() {
    super.onInit();
    ever<List<GamingActivityModel>>(state._data, (v) {
      loadCompleted(
        state: v.isEmpty ? LoadState.empty : LoadState.successful,
      );
    });
  }

  @override
  Stream<void> onLoadDataStream() {
    return PGSpi(Bonus.activityInfo.toTarget(
      input: {'equipment': 'Web'},
    )).rxRequest<List<GamingActivityModel>>((value) {
      final data = value['data']['list'] as List<dynamic>? ?? [];
      final List<GamingActivityModel> list = [];

      for (var element in data) {
        final l = ((element as Map<String, dynamic>)['list'] as List<dynamic>);
        if (l.isNotEmpty) {
          list.addAll(l.map(
              (e) => GamingActivityModel.fromJson(e as Map<String, dynamic>)));
        }
      }
      final end = min(list.length, 4);
      return (list..sort((a, b) => a.sort.compareTo(b.sort)))
          .getRange(0, end)
          .toList();
    }).doOnData((event) {
      state._data.assignAll(event.data);
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }
}
