import 'package:gogaming_app/common/api/user_notice/models/gaming_notification_list.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/setting_notify/gaming_setting_notify_logic.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingSettingNotifyAllLogic extends BaseController
    with RefreshControllerMixin {
  GamingSettingNotifyLogic get baseController =>
      Get.find<GamingSettingNotifyLogic>();
  int curIndex = 1;
  @override
  void onInit() {
    super.onInit();
    loadNotifyList(1);
  }

  @override
  LoadCallback get onLoadMore => (p) async {
        loadNotifyList(curIndex);
      };

  void loadNotifyList(int index) {
    if (index == 1 &&
        baseController.state.listData.value.list != null &&
        baseController.state.listData.value.list!.isNotEmpty) {
      baseController.state.listData.value.list!.clear();
    }

    refreshCompleted(
      state: LoadState.loading,
    );
    baseController.getNotifyList(curIndex).listen((event) {
      if (index != 1) {
        List<GamingNotificationItem> list =
            baseController.state.listData.value.list ?? [];
        event.data.list!.insertAll(0, list);
      }
      baseController.state.listData.value = event.data;
      if (event.success) {
        curIndex++;
      }
      refreshCompleted(
        state: LoadState.successful,
        hasMoreData: false,
      );
      loadMoreCompleted(
        state: LoadState.successful,
        total: baseController.state.listData.value.total,
        count: baseController.state.listData.value.list!.length,
      );
    }).onError((p0, p1) {
      refreshCompleted(
        state: LoadState.failed,
      );
    });
  }

  @override
  LoadCallback? get onRefresh => null;
}
