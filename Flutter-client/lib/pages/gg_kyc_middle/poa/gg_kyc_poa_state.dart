import 'package:base_framework/base_controller.dart';

import '../../../common/components/extensions/gg_reg_exp.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/account_service.dart';
import '../../../common/service/country_service.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';

class GGKycPOAState {
  final placeController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.notEmpty,
        errorHint: localized('sen_dj'),
      ),
    ],
  );

  final areaCodeController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator.length(
        min: 1,
        errorHint: localized('required_msg'),
      ),
    ],
  );

  final cityController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator.length(
        min: 1,
        errorHint: localized('required_msg'),
      ),
    ],
  );

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
    return CountryService.sharedInstance.currentCountry.obs;
  }();

  RxBool continueEnable = false.obs;
}
