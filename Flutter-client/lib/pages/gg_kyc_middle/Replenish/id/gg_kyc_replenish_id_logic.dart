import 'package:gogaming_app/pages/gg_kyc_middle/replenish/id/gg_kyc_replenish_id_upload_page.dart';

import '../../../../common/api/base/base_api.dart';
import '../../id/gg_kyc_middle_logic.dart';

class GGKycReplenishIDLogic extends GGKycMiddleLogic {
  GGKycReplenishIDLogic(this.documentId);
  final int documentId;

  @override
  void submit() {
    Get.to<void>(
      GGKycReplenishIDUploadPage(
        documentId: documentId,
        countryModel: state.currentVerType.value,
        verType: state.currentSelectVerType.value,
        countryCode: state.currentCountry.value.iso,
        fullName: state.fullNameController.value.text.value,
        firstName: state.firstNameController.value.text.value,
        lastName: state.lastNameController.value.text.value,
      ),
    );
  }
}
