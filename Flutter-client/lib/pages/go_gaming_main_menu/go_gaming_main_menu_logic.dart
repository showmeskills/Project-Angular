import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_aggs_wallet_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_wallet_overview_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_transfer_wallet.dart';
import 'package:gogaming_app/common/api/wallet/wallet_api.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/im/im_manager.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/service/shorebird_service.dart';
import 'package:gogaming_app/common/service/upgrade_app_service.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/common/service/wallet_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/update/update_dialog.dart';
import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/widget_header.dart';
import '../../common/api/user_notice/user_notice_api.dart';
import '../../models/notice/go_gaming_notice_amount.dart';
import '../base/base_controller.dart';
import 'go_gaming_main_menu_state.dart';

class GoGamingMainMenuLogic extends BaseController
    with GetTickerProviderStateMixin {
  final GoGamingMainMenuState state = GoGamingMainMenuState();
  static SnackbarController? snackbarController;
  static Timer? _timer;
  late Animation<double> arrowTurns;
  late AnimationController arrowController;

  late Animation<double> arrowTurns2;
  late AnimationController arrowController2;

  bool get isPrimaryPassed => KycService.sharedInstance.primaryPassed;
  bool get isIntermediatePassed => KycService.sharedInstance.intermediatePassed;
  bool get isAdvancePassed => KycService.sharedInstance.advancePassed;

  final allNoticeAmount = 0.obs;

  int get vipLevel => VipService.sharedInstance.vipInfo?.currentVipLevel ?? 0;

  GamingWalletOverviewModel? walletOverview;
  List<GamingOverviewTransferWalletModel> get overviewWalletList =>
      walletOverview?.transferWallet ?? [];

  bool get chatEnabled => IMManager().access.value;

  final walletsTypes = [
    'wallet_over',
    'main',
    "ky_wal",
    "ry_wal",
    "ag_wal",
    "bc_manage",
    "dc_add_management",
    "trans_history"
  ].obs;

  final orderTypes = [
    's_order',
    'l_order',
    "ca_order",
    "che_order",
  ];

  void _loadUnreadNoticeAmount() async {
    PGSpi(UserNotice.getNoticeCount.toTarget()).rxRequest<void>((value) {
      if (value['data'] != null && value['data'] is Map) {
        GoGamingNoticeAmount amount = GoGamingNoticeAmount.fromJson(
            value['data'] as Map<String, dynamic>);
        allNoticeAmount.value = amount.all ?? 0;
      }
    }).listen((event) {});
  }

  /// 加载钱包数据
  void _loadWalletInfo() async {
    PGSpi(Wallet.overview.toTarget())
        .rxRequest<GamingWalletOverviewModel>((value) {
      GamingWalletOverviewModel walletOverview =
          GamingWalletOverviewModel.fromJson(
              value['data'] as Map<String, dynamic>);
      return walletOverview;
    }).listen((event) {
      walletOverview = event.data;
      walletsTypes.clear();
      walletsTypes.add('wallet_over');
      walletsTypes.add('main');

      /// 添加网络请求的数据
      for (var walletInfo in overviewWalletList) {
        walletsTypes.add(walletInfo.category.toLowerCase());
      }

      walletsTypes.add('bc_manage');
      walletsTypes.add('dc_add_management');
      walletsTypes.add('trans_history');
    }).onError((Object error) {});
  }

  @override
  void onInit() {
    super.onInit();
    // loadData();
    arrowController = AnimationController(
        duration: const Duration(milliseconds: 200), vsync: this);
    arrowTurns = arrowController.drive(Tween<double>(begin: 0.0, end: -0.25)
        .chain(CurveTween(curve: Curves.easeIn)));

    arrowController2 = AnimationController(
        duration: const Duration(milliseconds: 200), vsync: this);
    arrowTurns2 = arrowController2.drive(Tween<double>(begin: 0.0, end: -0.25)
        .chain(CurveTween(curve: Curves.easeIn)));

    GamingEvent.signalrOnSiteMail.subscribe(_loadUnreadNoticeAmount);
  }

  void loadData() {
    _checkAppUpdate();
    _loadWalletInfo();
    _loadUnreadNoticeAmount();
  }

  void _checkAppUpdate() {
    UpdateType needUpdate =
        UpgradeAppService.sharedInstance.checkIfNeedUpdate();

    final updateRedDot = needUpdate == UpdateType.updateTypeForced ||
        needUpdate == UpdateType.updateTypeOptional;
    if (updateRedDot) {
      if (snackbarController == null) {
        snackbarController = Get.snackbar(
          localized('new_version_discovered'), // title
          localized('click_check'),
          icon: const Icon(Icons.alarm),
          shouldIconPulse: true,
          onTap: (GetSnackBar snack) {
            snackbarController?.close(withAnimations: false);
            UpdateApp().updateDialog();
          },
          barBlur: 20,
          isDismissible: true,
          duration: null,
        );
        _timer = Timer(const Duration(seconds: 4), () {
          snackbarController?.close(withAnimations: true);
        });
        snackbarController?.future.then((value) {
          snackbarController = null;
          _timer?.cancel();
        });
      }
    } else {
      ShorebirdService.sharedInstance.update().then((value) {
        if (value == true) {
          Toast.showSuccessful(localized('update_successful_tips'));
        }
      });
    }
  }

  @override
  void onClose() {
    arrowController.dispose();
    arrowController2.dispose();
    GamingEvent.signalrOnSiteMail.unsubscribe(_loadUnreadNoticeAmount);
    super.onClose();
  }

  void onClickAccountSafe() {
    Get.back<dynamic>();
    Get.toNamed<dynamic>(Routes.accountSecurity.route);
  }

  void onPressWithdraw() {
    Get.back<dynamic>();
    Get.toNamed<void>(Routes.withdrawHome.route);
  }

  /// 点击钱包总览
  void onPressWalletHome() {
    Get.until((route) => Get.currentRoute == Routes.main.route);
    Get.find<MainLogic>().changeSelectIndex(4);
  }

  void onPressTransferWallet(String category) {
    final GamingAggsWalletModel wallet =
        GamingAggsWalletModel.fromTransferWallet(overviewWalletList.singleWhere(
            (element) => element.category.toLowerCase() == category));
    final route = '${Routes.transferWallet.route}/${wallet.providerId!}';
    Get.back<dynamic>();

    if (Get.previousRoute != route && Get.currentRoute != route) {
      WalletService.sharedInstance.openTransferWallet(wallet);
    }
  }

  void onPressMainWallet() {
    if (walletOverview != null) {
      Get.back<dynamic>();
      WalletService.sharedInstance
          .openMainWallet(walletOverview!.overviewWallet);
    }
  }

  void onPressOrder(String title) {
    late GameType gameType;
    switch (title) {
      case 's_order':
        gameType = GameType.sportsBook;
        break;
      case 'l_order':
        gameType = GameType.lottery;
        break;
      case 'ca_order':
        gameType = GameType.casino;
        break;
      case 'che_order':
        gameType = GameType.chess;
        break;
    }
    final route = Routes.gameOrder.route;
    Get.back<dynamic>();
    if (Get.previousRoute != route && Get.currentRoute != route) {
      Get.toNamed<dynamic>(route, arguments: {
        'gameType': gameType.value,
      });
    }
  }
}
