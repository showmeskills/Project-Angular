import 'package:flutter/material.dart';

import '../../../../common/api/base/base_api.dart';
import '../../poa/gg_kyc_address_upload_logic.dart';
import '../../poa/gg_kyc_address_upload_page.dart';
import 'gg_kyc_replenish_poa_upload_logic.dart';

class GGKycReplenishPOAUploadPage extends GGKycAddressUploadPage {
  const GGKycReplenishPOAUploadPage(super.countryCode, super.postalCode,
      super.city, super.address, this.documentId,
      {super.key});

  final int documentId;

  @override
  GGKycAddressUploadLogic get logic => Get.find<GGKycReplenishPOAUploadLogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(GGKycReplenishPOAUploadLogic(documentId));
    return content(context);
  }
}
