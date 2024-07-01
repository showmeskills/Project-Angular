import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/vip/models/gaming_user_vip_model.dart';
import 'package:gogaming_app/common/api/vip/models/gaming_vip_setting_model.dart';
import 'package:gogaming_app/common/api/vip/vip_api.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/widget_header.dart';

import '../delegate/combination_single_render_controller.dart';

part 'vip_state.dart';

class DashboardVipLogic extends CombinationController {
  late final SingleRenderViewController _controller =
      SingleRenderViewController(
    autoLoadData: false,
    initialState: RenderState.loading,
  );
  @override
  SingleRenderViewController get controller => _controller;

  final state = DashboardVipState();

  @override
  Stream<void> onLoadDataStream() {
    final level = VipService.sharedInstance.vipLevel;
    return VipService.sharedInstance.getVipSetting(level).doOnData((event) {
      state._setting(event);
      loadCompleted(
        state: LoadState.successful,
      );
    });
  }
}
