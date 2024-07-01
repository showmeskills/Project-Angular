import '../../../../common/api/base/base_api.dart';
import '../../poa/gg_kyc_poa_logic.dart';
import 'gg_kyc_replenish_poa_upload_page.dart';

class GGKycReplenishPOALogic extends GGKycPOALogic {
  GGKycReplenishPOALogic(this.documentId);
  final int documentId;

  @override
  void pressContinue() {
    Get.to<dynamic>(
      () => GGKycReplenishPOAUploadPage(
        state.currentCountry.value.iso,
        state.areaCodeController.text.value,
        state.cityController.text.value,
        state.placeController.text.value,
        documentId,
      ),
    );
  }
}
