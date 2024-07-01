import 'package:gogaming_app/common/api/announcement/announcement_api.dart';
import 'package:gogaming_app/common/api/announcement/models/gaming_announcement_model.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/base/go_gaming_response.dart';
import '../delegate/combination_single_render_controller.dart';

part 'announcement_state.dart';

class DashboardAnnouncementLogic extends CombinationController {
  late final SingleRenderViewController _controller =
      SingleRenderViewController(
    autoLoadData: false,
    initialState: RenderState.loading,
  );
  @override
  SingleRenderViewController get controller => _controller;

  final state = DashboardAnnouncementState();

  @override
  void onInit() {
    super.onInit();
    ever<List<GamingAnnouncementModel>>(state._data, (v) {
      loadCompleted(
        state: v.isEmpty ? LoadState.empty : LoadState.successful,
      );
    });
  }

  @override
  Stream<void> onLoadDataStream() {
    return PGSpi(Announcement.getAnnouncement.toTarget(
      input: {'ClientType': 'Web'},
    )).rxRequest<List<GamingAnnouncementModel>>((value) {
      return (value['data'] as List)
          .map((e) =>
              GamingAnnouncementModel.fromJson(e as Map<String, dynamic>))
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
