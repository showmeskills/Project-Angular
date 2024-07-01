import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/coupon_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/tracker/event.dart';
import 'package:gogaming_app/common/tracker/gaming_data_collection.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/webview/base_web_view_controller.dart';
import 'package:gogaming_app/controller_header.dart';

class PreDepositLogic extends BaseController {
  bool get isPrimaryPassed => KycService.sharedInstance.primaryPassed;

  bool get isIntermediatePassed => KycService.sharedInstance.intermediatePassed;

  bool get isAdvancePassed => KycService.sharedInstance.advancePassed;

  late final isLogin = AccountService.sharedInstance.isLogin.obs;
  late Function disposeListen;

  @override
  void onInit() {
    super.onInit();
    disposeListen = AccountService.sharedInstance.cacheUser.getBox!()
        .listenKey(AccountService.sharedInstance.cacheUser.key, (value) {
      _userDidUpdate();
    });
    // if (isLogin.value) {
    //   _loadKycData();
    // }
  }

  @override
  void onClose() {
    CouponService.sharedInstance.clearBonusActivitiesNo();
    super.onClose();
  }

  void _userDidUpdate() {
    // if (!isLogin.value && AccountService.sharedInstance.isLogin) {
    //   _loadKycData();
    // }
    isLogin.value = AccountService.sharedInstance.isLogin;
  }

  // void _loadKycData() {
  //   KycService.sharedInstance.updateKycData().listen(null, onError: (err, p1) {
  //     Toast.showTryLater();
  //   });
  // }

  void creditCardBuy() {
    Map<String, dynamic> dataMap = {"actionvalue1": 2};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.clickDeposit, dataMap: dataMap);

    showLoading();
    CurrencyService().getCurrencyPurchase().listen((event) {
      hideLoading();
      if (event?.contains('http') == true) {
        // 跳转第三方网页
        Get.toNamed<dynamic>(
          Routes.webview.route,
          arguments: {
            'link': event,
            'title': localized('buy_coins'),
            'backMode': WebViewBackMode.onlyExit,
          },
        );
      } else {
        Toast.showTryLater();
      }
    }, onError: (Object error) {
      hideLoading();
      if (error is GoGamingResponse) {
        Toast.showFailed(error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }
}
