import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';

import '../../common/lang/locale_lang.dart';
import '../../common/service/country_service.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';

class GGKycAdvanceState {
  final placeController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator.length(
        min: 5,
        errorHint: localized('fill_again'),
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
    var country = CountryService.sharedInstance.currentCountry;
    if ((KycService.sharedInstance.info.value?.countryCode?.isNotEmpty ??
            false) &&
        (CountryService.sharedInstance.country?.isNotEmpty ?? false)) {
      country = CountryService.sharedInstance
          .country![KycService.sharedInstance.info.value?.countryCode]!;
    }
    return country.obs;
  }();

  RxBool continueEnable = false.obs;
}
