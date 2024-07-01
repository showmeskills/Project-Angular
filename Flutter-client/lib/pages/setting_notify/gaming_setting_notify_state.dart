part of 'gaming_setting_notify_logic.dart';

class GamingSettingNotifyState {
  late TabController tabController;
  RxInt curIndex = 0.obs;
  RxString curType = ''.obs;
  // 是否显示已读消息
  RxBool showBeenReade = true.obs;

  /// 未读数量
  GoGamingNoticeAmount? noticeAmount;
  late final _curNoticeAmount = noticeAmount.obs;
  GoGamingNoticeAmount? get curNoticeAmount => _curNoticeAmount.value;

  /// 通知内容呢
  final listData = GamingNotificationList(total: 0, list: []).obs;
  GamingNotificationList get curListData => listData.value;
}
