import 'package:flutter/material.dart';

import '../../../../common/api/base/base_api.dart';
import '../../poa/gg_kyc_poa_logic.dart';
import '../../poa/gg_kyc_poa_page.dart';
import 'gg_kyc_replenish_poa_logic.dart';

class GGKycReplenishPOAPage extends GGKycPOAPage {
  const GGKycReplenishPOAPage({super.key, required this.documentId});

  final int documentId;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          GGKycReplenishPOAPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory GGKycReplenishPOAPage.argument(Map<String, dynamic> arguments) {
    final int documentId = arguments['documentId'] as int;
    return GGKycReplenishPOAPage(documentId: documentId);
  }

  @override
  GGKycPOALogic get logic => Get.find<GGKycReplenishPOALogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(GGKycReplenishPOALogic(documentId));
    return content(context);
  }
}
