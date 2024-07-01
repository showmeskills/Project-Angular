import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/ip_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/service/shorebird_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/register_bonus_dialog/register_bonus_dialog.dart';
import 'package:gogaming_app/common/widgets/update/update_dialog.dart';

import 'package:gogaming_app/config/global_setting.dart';

import 'package:gogaming_app/controller_header.dart';

import 'package:gogaming_app/pages/customer_service/zendesk_service.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:launch_queue/launch_queue.dart';

import '../../common/service/biometric_service.dart';
import '../../common/service/fingerprint_service/fingerprint_service.dart';
import '../../common/service/upgrade_app_service.dart';
import '../online_activity/activity_home/activity_home_logic.dart';
import 'main_state.dart';

class MainLogic extends BaseController with GetTickerProviderStateMixin {
  final MainState state = MainState();
  late final TabController tabController;
  RxInt currentSelectIndex = 0.obs;
  RxBool showBottomBar = true.obs;
  final zendeskService = ZendeskService.sharedInstance;
  BuildContext? context;

  @override
  void onInit() {
    super.onInit();
    tabController = TabController(
      length: 5,
      vsync: this,
    );
    GamingEvent.userRegistered.subscribe(_registered);
    GamingEvent.login.subscribe(_refreshLogin);
    loadFromFuture();
    // _loadRiskAbnormalMember();
    FingerprintService.init();
    _loadKycAuthenticateEuFormType();
  }

  void _registered() {
    LaunchQueue.sharedInstance.addEvent<void>(LaunchEvent(() {
      return RegisterBonusDialog.show();
    }, priority: 999));
  }

  void _refreshLogin() {
    LaunchQueue.sharedInstance.addEvent<void>(LaunchEvent(() async {
      _loadHasDepositTx();
    }));
  }

  /// 是坦有首存
  void _loadHasDepositTx() {
    PGSpi(History.hasDepositTx.toTarget()).rxRequest<bool>((value) {
      final data = value['data'];
      if (data is bool) {
        return GGUtil.parseBool(data);
      } else {
        return false;
      }
    }).listen((event) {
      if (event.success && event.data == false) {
        goToDeposit();
      }
      _loadKycAuthenticateEuFormType();
      // _loadRiskAbnormalMember();
    }).onError((Object error) {
      // _loadRiskAbnormalMember();

      _loadKycAuthenticateEuFormType();
    });
  }

  void goToDeposit() {
    IPService.sharedInstance.getIpInfo(force: true).listen((event) {
      // 判断 event.countryCurrency 是虚拟帝还是法帝
      final currency = GGUtil.parseStr(event.countryCurrency);
      if (currency.isNotEmpty) {
        Get.toNamed<void>(
          Routes.preDeposit.route,
          arguments: {
            "onBack": () {
              Get.offAndToNamed<dynamic>(Routes.couponHome.route);
            }
          },
        );
      }
    }).onError((Object error) {});
  }

  void loadFromFuture() async {
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      UpgradeAppService.sharedInstance.configParameter().listen((event) {
        UpdateType needUpdate =
            UpgradeAppService.sharedInstance.checkIfNeedUpdate();
        // 只有强制更新才弹窗提示
        if (needUpdate == UpdateType.updateTypeForced) {
          UpdateApp().updateDialog();
        } else if (needUpdate == UpdateType.updateTypeNotRequired) {
          // 无需更新时检查热更新补丁
          ShorebirdService.sharedInstance.update().then((value) {
            if (value == true) {
              Toast.showSuccessful(localized('update_successful_tips'));
            }
          });
        }
        GGUtil.removePreviouslyInstalledAPK();
      });
    });
  }

  /// 是坦风控
  void _loadRiskAbnormalMember() {
    GlobalSetting.sharedInstance.isRiskClose.value = false;
    GlobalSetting.sharedInstance.updateRiskState().listen((event) {
      GlobalSetting.sharedInstance.queryNormalRiskFormAndDialog();
    });
  }

  /// 检测当前用户是否需要显示KYC中级横幅
  void _loadKycAuthenticateEuFormType() {
    KycService.sharedInstance.refreshKycTips(dialogPrompt: true);
  }

  @override
  void onClose() {
    super.onClose();
    GamingEvent.login.unsubscribe(_refreshLogin);
    GamingEvent.userRegistered.unsubscribe(_registered);
  }

  void _onLogin() {
    if (BiometricService.sharedInstance.canBiometricLogin()) {
      Get.toNamed<dynamic>(Routes.biometricLogin.route);
    } else {
      Get.toNamed<dynamic>(Routes.login.route);
    }
  }

  void changeSelectIndex(int selectIndex) {
    FocusManager.instance.primaryFocus?.unfocus();
    if (selectIndex == -1) {
      tabController.animateTo(0, duration: Duration.zero);
    } else {
      if (selectIndex == 4 && !AccountService().isLogin) {
        _onLogin();
        return;
      }
      if (selectIndex == 0) {
        if (context != null) {
          Scaffold.maybeOf(context!)?.openDrawer();
        }
      } else if (3 == selectIndex) {
        CustomerServiceRouter().toNamed();
      } else {
        tabController.animateTo(selectIndex, duration: Duration.zero);
        currentSelectIndex.value = selectIndex;
      }
      didChangeSelectIndex();
    }
  }

  void didChangeSelectIndex() {
    if (currentSelectIndex.value == 2) {
      if (GetInstance().isRegistered<ActivityHomeLogic>()) {
        ActivityHomeLogic logic = Get.find<ActivityHomeLogic>();
        logic.requestData();
        GamingDataCollection.sharedInstance
            .startTimeEvent(TrackEvent.visitPromotion);
      }
    } else {
      GamingDataCollection.sharedInstance
          .submitDataPoint(TrackEvent.visitPromotion);
    }
  }

  void closeMenu() {
    if (context != null) {
      Scaffold.maybeOf(context!)?.closeDrawer();
    }
  }
}
