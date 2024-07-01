import '../../../../common/api/base/base_api.dart';
import '../../../../helper/withdraw_router_util.dart';
import '../../../base/base_controller.dart';

class FiatWithdrawResultLogic extends BaseController {
  void close() {
    Get.back<void>();
    WithdrawRouterUtil.close();
  }
}
