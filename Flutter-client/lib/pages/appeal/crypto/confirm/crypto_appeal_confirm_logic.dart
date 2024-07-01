import 'package:gogaming_app/common/api/appeal/appeal_api.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/appeal/common/appeal_common_utils_mixin.dart';
import 'package:gogaming_app/pages/appeal/crypto/submit/crypto_appeal_submit_logic.dart';
import 'package:gogaming_app/pages/appeal/pre_submit/appeal_logic.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';

class CryptoAppealConfirmLogic extends BaseController
    with AppealCommonUtilsMixin {
  CryptoAppealSubmitLogic get submitLogic =>
      Get.find<CryptoAppealSubmitLogic>();

  final _loading = false.obs;
  bool get loading => _loading.value;

  void submit() {
    _loading.value = true;
    PGSpi(Appeal.depositByCoin.toTarget(
      inputData: submitLogic.toSubmitTarget(),
    )).rxRequest<String?>((value) {
      return value['data'] as String?;
    }).doOnData((event) {
      Get.findOrNull<AppealLogic>()?.refreshData();
      showSubmitSuccessfulDialog(id: event.data!);
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      _loading.value = false;
    }).listen(null, onError: (p0, p1) {});
  }
}
