import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/api/base/go_gaming_response.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import 'logics/activity_logic.dart';
import 'logics/announcement_logic.dart';
import 'logics/device_logic.dart';
import 'logics/game_order_logic.dart';
import 'logics/vip_logic.dart';
import 'logics/wallet_logic.dart';
import 'logics/user_info_logic.dart';

class DashboardLogic extends GetxController with RefreshControllerMixin {
  final RefreshViewController _controller = RefreshViewController(
    autoLoadData: false,
    initialState: RenderState.successful,
  );
  @override
  RefreshViewController get controller => _controller;

  late final DashboardVipLogic vipLogic;
  late final DashboardUserInfoLogic userInfoLogic;
  late final DashboardWalletLogic walletLogic;
  late final DashboardAnnouncementLogic announcementLogic;
  late final DashboardDeviceLogic deviceLogic;
  late final DashboardActivityLogic activityLogic;
  late final DashboardGameOrderLogic gameOrderLogic;

  @override
  void onInit() {
    super.onInit();
    vipLogic = Get.put(DashboardVipLogic());
    userInfoLogic = Get.put(DashboardUserInfoLogic());
    walletLogic = Get.put(DashboardWalletLogic());
    announcementLogic = Get.put(DashboardAnnouncementLogic());
    deviceLogic = Get.put(DashboardDeviceLogic());
    activityLogic = Get.put(DashboardActivityLogic());
    gameOrderLogic = Get.put(DashboardGameOrderLogic());

    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.visitWalletMainPage);
  }

  @override
  void onReady() {
    super.onReady();
    onRefresh?.call(1);
  }

  @override
  LoadCallback? get onRefresh => (p1) {
        refreshCompleted(state: LoadState.loading);
        Rx.combineLatestList<void>([
          vipLogic.onLoadDataStream(),
          // userInfoLogic.onLoadDataStream(),
          walletLogic.onLoadDataStream(),
          announcementLogic.onLoadDataStream(),
          deviceLogic.onLoadDataStream(),
          activityLogic.onLoadDataStream(),
          gameOrderLogic.onLoadDataStream(),
        ]).doOnData((event) {
          refreshCompleted(state: LoadState.successful, hasMoreData: false);
        }).doOnError((err, p1) {
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
          refreshCompleted(state: LoadState.failed);
        }).listen(null, onError: (p0, p1) {});
      };

  /// 点击钱包总览
  void onPressWalletHome() {
    Get.until((route) => Get.currentRoute == Routes.main.route);
    Get.find<MainLogic>().changeSelectIndex(4);
  }
}
