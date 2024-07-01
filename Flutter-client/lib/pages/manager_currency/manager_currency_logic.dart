import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

class ManagerCurrencyLogic extends BaseController {
  final defaultCurrency = CurrencyService.sharedInstance.selectedCurrencyObs;

  late List<dynamic> hiddenList = CurrencyService.sharedInstance.hiddenList.val;
  final isSaving = false.obs;

  bool get isLogin => AccountService.sharedInstance.isLogin;

  List<GamingCurrencyModel> get currencyList =>
      CurrencyService.sharedInstance.currencyList;

  List<GamingCurrencyModel> get fiatList =>
      CurrencyService.sharedInstance.fiatList;

  List<GamingCurrencyModel> get cryptoList =>
      CurrencyService.sharedInstance.cryptoList;
  @override
  void onReady() {
    super.onReady();
    _getDefaultCurrency();
  }

  void setDefaultCurrency(String currency) {
    PGSpi(Account.setDefaultCurrency.toTarget(
      inputData: {'defaultCurrencyType': currency},
    )).rxRequest<bool?>((value) {
      final data = value['data'];
      if (data is bool) {
        return data;
      } else {
        return null;
      }
    }).listen((value) {
      if (value.success) {
        AccountService.sharedInstance.userSetting?.defaultCurrencyType =
            currency;
        _updateDefaultCurrency();
        Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.success,
          title: localized('successful'),
          message: localized('set_s'),
        );
      }
    }, onError: (e) {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('hint'),
        message: localized('set_f'),
      );
    });
  }

  void _getDefaultCurrency() {
    if (AccountService.sharedInstance.userSetting != null) {
      _updateDefaultCurrency();
    } else if (isLogin) {
      AccountService.sharedInstance.updateGamingUserInfo().listen((event) {
        _updateDefaultCurrency();
      }, onError: (e) {});
    }
  }

  void _updateDefaultCurrency() {
    final defaultCurrencyType =
        AccountService.sharedInstance.userSetting?.defaultCurrencyType ?? '';
    final currencyModel = CurrencyService.sharedInstance[defaultCurrencyType];
    if (currencyModel != null) {
      defaultCurrency(currencyModel);
      CurrencyService.sharedInstance.selectedCurrencyObs(currencyModel);
    }
  }

  bool isChecked(GamingCurrencyModel model) {
    return !hiddenList.contains(model.currency);
  }

  void revertCheck(GamingCurrencyModel model) {
    if (isChecked(model)) {
      hiddenList.add(model.currency);
    } else {
      hiddenList.remove(model.currency);
    }
    update([model.currency ?? '']);
  }

  void saveCheckStatus() {
    CurrencyService.sharedInstance.hiddenList.val = hiddenList;
    Get.back<dynamic>();
  }

  bool isSelectedCurrency(GamingCurrencyModel model) {
    return CurrencyService.sharedInstance.selectedCurrency.currency ==
        model.currency;
  }

// @override
// void onClose() {
//   // TODO: implement onClose
//   super.onClose();
// }
}
