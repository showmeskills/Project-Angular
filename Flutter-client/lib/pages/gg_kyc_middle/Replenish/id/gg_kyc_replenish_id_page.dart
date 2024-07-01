import 'package:flutter/material.dart';

import '../../../../common/api/base/base_api.dart';
import '../../id/gg_kyc_middle_logic.dart';
import '../../id/gg_kyc_middle_page.dart';
import 'gg_kyc_replenish_id_logic.dart';

class GGKycReplenishIDPage extends GGKycMiddlePage {
  const GGKycReplenishIDPage({super.key, required this.documentId});

  final int documentId;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          GGKycReplenishIDPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory GGKycReplenishIDPage.argument(Map<String, dynamic> arguments) {
    final int documentId = arguments['documentId'] as int;
    return GGKycReplenishIDPage(documentId: documentId);
  }

  @override
  GGKycMiddleLogic get logic => Get.find<GGKycReplenishIDLogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(GGKycReplenishIDLogic(documentId));
    return content(context);
  }
}
