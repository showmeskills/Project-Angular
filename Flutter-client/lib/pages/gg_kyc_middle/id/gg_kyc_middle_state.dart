import 'dart:convert';

import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';

import '../../../common/api/base/base_api.dart';
import '../../../common/api/kyc/models/gg_kyc_country.dart';
import '../../../common/components/extensions/gg_reg_exp.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/country_service.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';

class GGKycMiddleState {
  bool get nameValid {
    if (showFullName) {
      return fullNameController.value.isNotEmpty &&
          fullNameController.value.isPass;
    }
    return (firstNameController.value.isNotEmpty &&
            firstNameController.value.isPass) &&
        (lastNameController.value.isNotEmpty &&
            lastNameController.value.isPass);
  }

  bool get idCardValid =>
      idCardController.isNotEmpty && idCardController.isPass;
  bool get bankCardValid =>
      bankCardController.isNotEmpty && bankCardController.isPass;
  bool get phoneValid => phoneController.isNotEmpty && phoneController.isPass;
  bool get codeValid => codeController.isNotEmpty && codeController.isPass;

  bool get showFullName {
    final fullNameCountries = jsonDecode(MerchantService
            .sharedInstance.merchantConfigModel?.config?.fullNameCountries ??
        '');
    if (fullNameCountries is List) {
      return fullNameCountries.contains(currentCountry.value.iso);
    } else {
      return currentCountry.value.isChina ||
          currentCountry.value.isHK ||
          currentCountry.value.isTW ||
          currentCountry.value.isMO ||
          currentCountry.value.isVnm ||
          currentCountry.value.isTha;
    }
  }

  bool get isAsia {
    return KycService.sharedInstance.isAsia;
  }

  RxInt secondLeft = 90.obs;
  var phoneCodeState = PhoneCodeState.unSend.obs;
  final fullNameController = GamingTextFieldController().obs;

  /// 姓输入框
  final firstNameController = GamingTextFieldController().obs;

  /// 名输入框
  final lastNameController = GamingTextFieldController().obs;
  final idCardController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.chinaID,
        errorHint: localized("id_err"),
      ),
    ],
  );

  final bankCardController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator.number(localized("bank_card_tip01")),
    ],
  );

  final phoneController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator(
        reg: RegExp(r'^[\s\S]{0,16}$'),
        errorHint: localized("sms_ver_code05"),
      ),
    ],
  );

  late GamingTextFieldController codeController =
      GamingTextFieldController(validator: [
    GamingTextFieldValidator(
      reg: RegExp(r'^\d{6}$'),
    ),
  ]);

  RxBool isChina = false.obs;
  RxBool buttonEnable = false.obs;
  RxBool isLoading = false.obs;
  RxBool expandPhoneVer = false.obs;
  final currentSelectVerType = VerType.none.obs;

  late final currentCountry = () {
    final countryCode =
        AccountService.sharedInstance.gamingUser?.mobileRegionCode;
    if (countryCode != null) {
      var country = CountryService.sharedInstance.countryList
          .firstWhereOrNull((element) => element.iso == countryCode);
      if (country != null) {
        return country.obs;
      }
    }
    var country = CountryService.sharedInstance.currentCountry;
    return country.obs;
  }();

  final currentVerType = GamingKycCountryModel().obs;
}

enum PhoneCodeState {
  unSend,
  send,
  reSend,
}

enum VerType {
  none,
  idCard,
  passport,
  driverLicense,
}
