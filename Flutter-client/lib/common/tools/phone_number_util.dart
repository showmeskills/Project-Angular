import 'package:phone_number/phone_number.dart';

import '../utils/util.dart';

class GGPhoneNumberUtil {
  static final _plugin = PhoneNumberUtil();
  static Future<bool> isValidPhoneNumber(
      {required String phoneNumber, required String isoCode}) async {
    if (GGUtil.parseStr(phoneNumber).isEmpty ||
        GGUtil.parseStr(isoCode).isEmpty) {
      return false;
    }
    try {
      return await _plugin.validate(phoneNumber, regionCode: isoCode);
    } catch (e) {
      return false;
    }
  }
}
