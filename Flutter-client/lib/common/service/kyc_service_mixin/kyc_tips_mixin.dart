import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/kyc/kyc.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/pages/advanced_certification/common/advanced_certification_util.dart';
import 'package:gogaming_app/widget_header.dart';

mixin KycTipsMixin {
  final _authenticateEuFormType = <AuthenticateEuFormType>[].obs;
  List<AuthenticateEuFormType> get authenticateEuFormType =>
      _authenticateEuFormType;

  bool get needKycIntermediate =>
      _authenticateEuFormType.contains(AuthenticateEuFormType.kycIntermediate);

  bool get needKycAdvanced =>
      _authenticateEuFormType.contains(AuthenticateEuFormType.kycAdvanced);

  /// 是否手动关闭
  final _isCloseTips = true.obs;
  bool get isCloseTips => _isCloseTips.value;

  void refreshKycTips({
    bool dialogPrompt = false,
  }) {
    loadAuthenticateEuFormType(dialogPrompt: dialogPrompt)
        .listen(null, onError: (err) {});
  }

  Stream<List<AuthenticateEuFormType>> loadAuthenticateEuFormType({
    bool dialogPrompt = false,
  }) {
    return (AccountService.sharedInstance.isLogin &&
                !KycService.sharedInstance.isAsia
            ? PGSpi(Kyc.queryAuthenticateForEu.toTarget())
                .rxRequest<List<AuthenticateEuFormType>>((value) {
                return (value['data'] as List<dynamic>).map((e) {
                  return AuthenticateEuFormType.fromValue(e['type'] as String);
                }).toList();
              }).flatMap((value) {
                return Stream.value(value.data);
              })
            : Stream.value(<AuthenticateEuFormType>[]))
        .doOnData((event) {
      _authenticateEuFormType.value = event;
      _isCloseTips.value = !needKycIntermediate;
      if (dialogPrompt) {
        if (event.contains(AuthenticateEuFormType.kycAdvanced) ||
            event.contains(AuthenticateEuFormType.kycIntermediate)) {
          String? route;
          if (needKycIntermediate) {
            route = Routes.kycMiddle.route;
          } else if (needKycAdvanced) {
            route = Routes.kycAdvance.route;
          }
          if (route != null) {
            KycService.sharedInstance.showKycEuDialog(
              route,
            );
          }
        } else if (event.contains(AuthenticateEuFormType.edd)) {
          AdvancedCertificationUtil.showCertificationDialog();
        }
      }
    });
  }

  void closeTips() {
    _isCloseTips.value = true;
  }

  void resetTips() {
    _authenticateEuFormType.value = [];
    _isCloseTips.value = true;
  }
}
