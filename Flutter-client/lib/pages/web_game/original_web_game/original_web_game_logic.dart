import 'dart:async';

import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/webview/base_web_view_controller.dart';

import '../../../common/service/account_service.dart';
import '../../../common/service/event_service.dart';

class OriginalWebGameLogic extends GetxController {
  OriginalWebGameLogic(this.windowId);

  late final StreamSubscription<dynamic> selectedCurrencySub;
  final int windowId;

  // 用来记录是否原创游戏通知拦截更新余额
  bool tempUpdateBalanceLock = false;
  BaseWebViewController get webLogic =>
      Get.find<BaseWebViewController>(tag: windowId.toString());
  @override
  void onInit() {
    super.onInit();
    selectedCurrencySub = CurrencyService().selectedCurrencyObs.listen((p0) {
      //reload webview
      webLogic.onRefresh();
    });
  }

  @override
  void onClose() {
    super.onClose();
    AccountService.sharedInstance.updateBalanceLock = false;
    GamingEvent.signalrUpdateBalance.notify();
    selectedCurrencySub.cancel();
  }
}
