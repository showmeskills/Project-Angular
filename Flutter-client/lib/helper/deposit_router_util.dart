import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_bonus_selector.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/widget_header.dart';

import '../common/service/biometric_service.dart';
import '../common/service/coupon_service.dart';
import '../common/service/merchant_service/merchant_service.dart';

class DepositRouterUtil {
  static final _cryptoRoutes = [
    Routes.preDeposit.route,
    Routes.cryptoDeposit.route,
  ];
  static final _currencyRoutes = [
    Routes.preDeposit.route,
    Routes.currencyDepositPreSubmit.route,
    Routes.currencyDepositSubmit.route,
    Routes.currencyDepositResultConfirm.route,
    Routes.currencyDepositVirtualResultConfirm.route
  ];

  static void close() {
    Get.until((route) =>
        !_cryptoRoutes.contains(route.settings.name) &&
        !_currencyRoutes.contains(route.settings.name));
  }

  static void goDepositHome({bool replace = false}) {
    if (!CurrencyService.sharedInstance.selectedCurrency.isDigital) {
      goCurrencyDeposit(null, replace);
    } else {
      _navigate(Routes.preDeposit.route, replace: replace);
    }
  }

  static void goCryptoDeposit([String? currency, bool replace = false]) {
    final phoneVerifyCryptoDeposit = MerchantService.sharedInstance
            .merchantConfigModel?.config?.phoneVerifyCryptoDeposit ??
        false;
    if (!(AccountService().gamingUser?.isBindMobile ?? false) &&
        phoneVerifyCryptoDeposit) {
      _navigate(
        Routes.bindMobile.route,
        arguments: {
          'onSuccess': () {
            _navigate(
              Routes.cryptoDeposit.route,
              arguments: {
                'currency': currency,
              },
              replace: true,
            );
          },
        },
        replace: replace,
      );
    } else {
      _navigate(
        Routes.cryptoDeposit.route,
        arguments: {
          'currency': currency,
        },
        replace: replace,
      );
    }
  }

  static void _goCurrencyDepositEU([String? currency, bool replace = false]) {
    GamingBonusSelector.show2(
      currency: CurrencyService.sharedInstance
          .getSelectedFiatCurrency(currency)
          .currency!,
      usedPIQ: true,
      selectedNo: CouponService.sharedInstance.bonusActivitiesNo,
      onConfirm: (model) {
        _navigate(
          Routes.currencyDepositPreSubmit.route,
          arguments: {
            'currency': currency,
            'bonus': model,
            'unknowtmpcode': model == null,
          },
          replace: replace,
        );
      },
    );
  }

  static void goCurrencyDeposit([String? currency, bool replace = false]) {
    if (!AccountService().isLogin) {
      _navigate(
        (BiometricService.sharedInstance.canBiometricLogin())
            ? Routes.biometricLogin.route
            : Routes.login.route,
        replace: replace,
      );
      return;
    }
    // 判断是欧洲用户且开启了新的欧洲存款红利
    if (!KycService.sharedInstance.isAsia &&
        Config.sharedInstance.environment.useNewEUDepositBonus) {
      // kyc事件监听回调
      void callback() {
        GamingEvent.kycPrimarySuccess.unsubscribe(callback);
        // 处理特殊情况，例如未做kyc认证前根据ip等暂时断定该用户为欧洲用户，但是用户做了亚洲kyc，则不弹出红利选择
        if (!KycService.sharedInstance.isAsia &&
            Config.sharedInstance.environment.useNewEUDepositBonus) {
          _goCurrencyDepositEU(currency, replace);
        } else {
          _navigate(
            Routes.currencyDepositPreSubmit.route,
            arguments: {
              'currency': currency,
            },
            replace: replace,
          );
        }
      }

      // 检查是否通过初级KYC
      KycService.sharedInstance.checkPrimaryDialog(
        () {
          _goCurrencyDepositEU(currency, replace);
        },
        Get.overlayContext!,
        arguments: {
          'closeAfterSuccess': true,
        },
        onFail: () {
          // kyc未认证，监听kyc成功事件
          GamingEvent.kycPrimarySuccess.subscribe(callback);
        },
        onDismiss: () {
          GamingEvent.kycPrimarySuccess.unsubscribe(callback);
        },
      );
      return;
    }

    _navigate(
      Routes.currencyDepositPreSubmit.route,
      arguments: {
        'currency': currency,
      },
      replace: replace,
    );
  }

  static void _navigate(
    String page, {
    dynamic arguments,
    bool replace = false,
  }) {
    if (replace) {
      Get.offNamed<void>(page, arguments: arguments);
    } else {
      Get.toNamed<void>(page, arguments: arguments);
    }
  }
}
