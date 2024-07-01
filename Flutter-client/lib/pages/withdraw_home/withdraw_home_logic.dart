import 'package:gogaming_app/controller_header.dart';

class WithdrawHomeLogic extends BaseController {
  // @override
  // void onReady() {
  //   // TODO: implement onReady
  //   super.onReady();
  // }

  // @override
  // void onClose() {
  //   // TODO: implement onClose
  //   super.onClose();
  // }

  // void onCryptoPressed() {
  //   showLoading();
  //   KycService.sharedInstance.checkPrimaryDialog(() {
  //     checkAllowWithdrawal(() {
  //       Get.toNamed<dynamic>(Routes.withdrawal.route);
  //     });
  //   }, Get.overlayContext!);
  // }

  // void checkAllowWithdrawal(VoidCallback onSuccess) {
  //   WalletService().allowWithdrawal().listen((event) {
  //     hideLoading();
  //     if (event) {
  //       onSuccess();
  //     } else {
  //       DialogUtil(
  //         context: Get.overlayContext!,
  //         iconPath: R.commonDialogErrorBig,
  //         iconWidth: 80.dp,
  //         iconHeight: 80.dp,
  //         title: localized('hint'),
  //         content: localized('clear_bonus'),
  //         contentMaxLine: 3,
  //         leftBtnName: '',
  //         rightBtnName: localized('i_ha_kn00'),
  //         onRightBtnPressed: () {
  //           Get.back<void>();
  //           Get.until((route) => Get.currentRoute == Routes.main.route);
  //           Get.find<MainLogic>().changeSelectIndex(4);
  //         },
  //       ).showNoticeDialogWithTwoButtons();
  //     }
  //   }, onError: (e) {
  //     hideLoading();
  //     Toast.showTryLater();
  //   });
  // }

  // void onCurrencyPressed() {
  //   showLoading();

  //   KycService.sharedInstance.checkMiddleDialog(() {
  //     checkAllowWithdrawal(() {
  //       Get.offAndToNamed<void>(Routes.fiatWithdraw.route);
  //     });
  //   }, Get.overlayContext!);
  // }
}
