import 'package:gogaming_app/common/api/vip/models/gaming_vip_benefits_model.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/controller_header.dart';

class VipRightDesLogic extends BaseController {
  GamingVipBenefitsModel? get benefitsModel => VipService().benefitsModel;

  @override
  void onReady() {
    super.onReady();

    showLoading();
    VipService().vipBenefit().listen((event) {
      hideLoading();
      update();
    }, onError: (e) {
      hideLoading();
    });
  }

// @override
// void onClose() {
//   // TODO: implement onClose
//   super.onClose();
// }
}
