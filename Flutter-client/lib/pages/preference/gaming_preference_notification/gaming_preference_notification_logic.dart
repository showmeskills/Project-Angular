import 'package:gogaming_app/common/api/user_notice/models/gaming_notice_config.dart';
import 'package:gogaming_app/common/api/user_notice/user_notice_api.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import '../../../common/api/base/base_api.dart';

class GamingPreferenceNotificationLogic extends BaseController {
  GamingNoticeConfig? noticeConfig;
  RxString currentNoticeLanguage = localized('not_set').obs;

  List<String> curNotice = [];
  RxString curNoticeStr = ''.obs;

  RxBool isSys = false.obs;
  RxBool isTrade = false.obs;
  RxBool isActivities = false.obs;
  RxBool isNews = false.obs;

  List<String> allNotice = [
    'sys_noti',
    'trade_noti',
    'activities_noti',
    'news_noti'
  ];

  @override
  void onInit() {
    super.onInit();
    _loadNoticeSetting();
  }

  /// 获取通知设置
  void _loadNoticeSetting() {
    PGSpi(UserNotice.getNoticeConfig.toTarget())
        .rxRequest<GamingNoticeConfig?>((value) {
      return value['data'] is Map<String, dynamic>
          ? GamingNoticeConfig.fromJson(value['data'] as Map<String, dynamic>)
          : null;
    }).listen((event) {
      noticeConfig = event.data;
      setNotice();
    }).onError((Object error) {});
  }

  void setNotice() {
    noticeConfig?.noticeTypeList?.forEach((element) {
      if (element == 'System') {
        isSys.value = true;
      } else if (element == 'Transaction') {
        isTrade.value = true;
      } else if (element == 'Information') {
        isNews.value = true;
      } else if (element == 'Activity') {
        isActivities.value = true;
      }
    });
  }

  void save() {
    List<String> list = [];
    if (isSys.value) {
      list.add('System');
    }

    if (isTrade.value) {
      list.add('Transaction');
    }

    if (isNews.value) {
      list.add('Information');
    }

    if (isActivities.value) {
      list.add('Activity');
    }
    PGSpi(UserNotice.setReceiveNoticeTypes.toTarget(
      inputData: {'noticeTypeList': list},
    )).rxRequest<bool?>((value) {
      final data = value['data'];
      if (data is bool) {
        return data;
      } else {
        return null;
      }
    }).listen((value) {
      if (value.success) {
        AccountService().updateGamingUserInfo().listen((value) {
          /// 完成之后发送通知
          GamingEvent.changeNotificationInApp.notify();
        });
        Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.success,
          title: localized('successful'),
          message: localized('set_s'),
        );
      }
    }, onError: (Object e) {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('hint'),
        message: e.toString(),
      );
    });
  }
}
