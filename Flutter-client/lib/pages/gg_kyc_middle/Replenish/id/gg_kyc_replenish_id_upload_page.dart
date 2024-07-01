import 'package:flutter/material.dart';

import '../../../../common/api/base/base_api.dart';
import '../../id/gg_kyc_middle_upload_logic.dart';
import '../../id/gg_kyc_middle_upload_page.dart';
import 'gg_kyc_replenish_id_upload_logic.dart';

class GGKycReplenishIDUploadPage extends GGKycMiddleUploadPage {
  const GGKycReplenishIDUploadPage(
      {super.key,
      required this.documentId,
      required super.countryModel,
      required super.verType,
      required super.countryCode,
      required super.fullName,
      required super.firstName,
      required super.lastName});

  final int documentId;

  @override
  GGKycMiddleUploadLogic get logic => Get.find<GGKycReplenishIDUploadLogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(GGKycReplenishIDUploadLogic(documentId));
    return content(context);
  }
}
