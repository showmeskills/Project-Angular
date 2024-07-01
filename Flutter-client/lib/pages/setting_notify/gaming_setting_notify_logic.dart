import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/user_notice/models/gaming_notification_list.dart';
import 'package:gogaming_app/common/api/user_notice/user_notice_api.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/models/notice/go_gaming_notice_amount.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
part 'gaming_setting_notify_state.dart';

class GamingSettingNotifyLogic extends BaseController
    with RefreshControllerMixin, GetSingleTickerProviderStateMixin {
  final state = GamingSettingNotifyState();

  List<String> typeList = [];
  final limitOverlay = GamingOverlay();

  @override
  void onInit() {
    super.onInit();
    typeList = [
      '',
      'Activity',
      'System',
      'Information',
      'Transaction',
    ];
    _initTabController(5);
    _loadUnreadNoticeAmount();
  }

  void _initTabController(int length) {
    state.tabController = TabController(
        length: length, vsync: this, initialIndex: state.curIndex.value);
    state.tabController.removeListener(_tabListener);
    state.tabController.addListener(_tabListener);
  }

  void _tabListener() {
    if (state.curIndex.value != state.tabController.index) {
      state.curIndex.value = state.tabController.index;
      state.curType.value = typeList[state.curIndex.value];
      state.listData.value.list!.clear();
      loadNotifyList(1);
    }
  }

  @override
  LoadCallback get onLoadMore => (p) async {
        loadNotifyList(p);
      };

  @override
  LoadCallback? get onRefresh => null;

  void loadNotifyList(int index) {
    if (index == 1 &&
        state.listData.value.list != null &&
        state.listData.value.list!.isNotEmpty) {
      state.listData.value.list!.clear();
    }

    refreshCompleted(
      state: LoadState.loading,
    );
    getNotifyList(index).listen((event) {
      if (index != 1) {
        List<GamingNotificationItem> list = state.listData.value.list ?? [];
        event.data.list!.addAll(list);
      }
      state.listData.value = event.data;

      refreshCompleted(
        state: LoadState.successful,
        hasMoreData: false,
      );
      loadMoreCompleted(
        state: LoadState.successful,
        total: state.listData.value.total,
        count: state.listData.value.list!.length,
      );
    }).onError((p0, p1) {
      refreshCompleted(
        state: LoadState.failed,
      );
    });
  }

  /// 加载数据
  Stream<GoGamingResponse<GamingNotificationList>> getNotifyList(
      int pageIndex) {
    Map<String, dynamic> reqParams = {
      'Page': pageIndex,
      'PageSize': 10,
    };

    if (state.curType.value.isNotEmpty) {
      reqParams['noticeType'] = state.curType.value;
    }

    if (state.showBeenReade.value == false) {
      reqParams['isReaded'] = false;
    }

    return PGSpi(UserNotice.getNoticeListType.toTarget(input: reqParams))
        .rxRequest<GamingNotificationList>((value) {
      return GamingNotificationList.fromJson(
        value['data'] as Map<String, dynamic>,
      );
    });
  }

  void _loadUnreadNoticeAmount() async {
    PGSpi(UserNotice.getNoticeCount.toTarget())
        .rxRequest<GoGamingNoticeAmount?>((value) {
      if (value['data'] != null && value['data'] is Map) {
        GoGamingNoticeAmount amount = GoGamingNoticeAmount.fromJson(
            value['data'] as Map<String, dynamic>);
        return amount;
      } else {
        return null;
      }
    }).listen((event) {
      _setCurNoticeAmount(event.data);
    }).onError((Object error) {});
  }

  void _setCurNoticeAmount(GoGamingNoticeAmount? amount) {
    state.noticeAmount = amount;
    state._curNoticeAmount(amount);
  }

  /// 已读消息
  void readNotice(List<int> list) async {
    PGSpi(UserNotice.readNotice.toTarget(inputData: {"idList": list}))
        .rxRequest<bool>((value) {
      return value['data'] == true;
    }).listen((event) {
      if (event.success) {
        loadNotifyList(1);
        _loadUnreadNoticeAmount();
      }
    }).onError((Object error) {});
  }

  /// 是否显示已读未读
  void showBeenRead(bool isRead) {
    state.showBeenReade.value = isRead;
    loadNotifyList(1);
  }

  /// 清除已读
  void deleteAll() {
    PGSpi(UserNotice.deleteAll.toTarget(inputData: {"noticeType": null}))
        .rxRequest<bool>((value) {
      return value['data'] == true;
    }).listen((event) {
      if (event.success) {
        loadNotifyList(1);
        _loadUnreadNoticeAmount();
        Toast.showSuccessful(localized('noti_all_de'));
      }
    }).onError((Object error) {});
  }

  /// 已读所有
  void readAll() {
    if (state.curNoticeAmount?.all == 0) {
      Toast.showFailed(localized("noti_allread"));
      return;
    }

    PGSpi(UserNotice.readAll.toTarget(inputData: {"noticeType": null}))
        .rxRequest<bool>((value) {
      return value['data'] == true;
    }).listen((event) {
      if (event.success) {
        loadNotifyList(1);
        _loadUnreadNoticeAmount();
        Toast.showSuccessful(localized('noti_allread'));
      }
    }).onError((Object error) {});
  }
}
