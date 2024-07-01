import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/models/gaming_model.dart';

final gamingAccountCreator = <Type, Function>{
  GamingGoogleInfo: (Map<String, dynamic> json) =>
      GamingGoogleInfo.fromJson(json)
};

class GamingGoogleInfo implements GamingModel {
  String manualEntryKey = '';
  String qrCodeImageUrl = '';
  bool mobileHasVerified = false;

  GamingGoogleInfo.fromJson(Map<String, dynamic> json) {
    manualEntryKey = GGUtil.parseStr(json["manualEntryKey"]); //
    qrCodeImageUrl = GGUtil.parseStr(json["qrCodeUrl"]);
    mobileHasVerified = GGUtil.parseBool(json["mobileHasVerified"]);
  }
}
