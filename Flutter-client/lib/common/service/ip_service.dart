import 'package:gogaming_app/common/api/auth/auth_api.dart';
import 'package:gogaming_app/common/api/auth/models/gaming_ip_model.dart';
import 'package:gogaming_app/helper/sentry_util.dart';

import '../api/base/base_api.dart';

class IPService {
  factory IPService() => _getInstance();

  static IPService get sharedInstance => _getInstance();

  static IPService? _instance;

  static IPService _getInstance() {
    _instance ??= IPService._internal();
    return _instance!;
  }

  IPService._internal();

  GamingIpModel? ipModel;

  Stream<GamingIpModel> getIpInfo({bool force = false}) {
    if (ipModel == null || force == true) {
      return PGSpi(Auth.getIpInfo.toTarget()).rxRequest<Map<String, dynamic>>(
          (value) {
        return value['data'] as Map<String, dynamic>;
      }, useCache: false).flatMap((event) {
        return Stream.value(_storeIP(event.data));
      });
    }
    return Stream.value(ipModel!);
  }

  GamingIpModel _storeIP(Map<String, dynamic> json) {
    SentryUtil.initUser();
    ipModel = GamingIpModel.fromJson(json);
    return ipModel!;
  }
}
