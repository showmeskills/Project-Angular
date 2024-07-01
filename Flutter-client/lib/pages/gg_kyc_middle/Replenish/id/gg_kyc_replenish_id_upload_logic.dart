import '../../../../common/api/base/base_api.dart';
import '../../../../common/lang/locale_lang.dart';
import '../../../../common/service/kyc_service.dart';
import '../../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../../../router/app_pages.dart';
import '../../id/gg_kyc_middle_upload_logic.dart';
import 'package:gogaming_app/common/api/risk_form/risk_form_api.dart';

class GGKycReplenishIDUploadLogic extends GGKycMiddleUploadLogic {
  GGKycReplenishIDUploadLogic(this.documentId);
  final int documentId;

  @override
  void submit(String countryCode, String fullName, String firstName,
      String lastName, String idType) {
    _replenish(countryCode, fullName, firstName, lastName, idType);
  }

  void _replenish(String countryCode, String fullName, String firstName,
      String lastName, String idType) {
    isLoading.value = true;
    Rx.combineLatestList([
      uploadImage(frontImageFilePath.value),
      uploadImage(backImageFilePath.value),
    ]).flatMap((value) {
      Map<String, dynamic> reqParams = {
        "country": countryCode,
        "id": documentId,
        "idType": idType,
      };
      if (value.first.isNotEmpty) {
        reqParams["frontImage"] = value.first;
        reqParams['originalFrontImageName'] =
            frontImageFilePath.value.split('/').last;
      }
      if (value[1].isNotEmpty) {
        reqParams["backImage"] = value[1];
        reqParams['originalBackImageName'] =
            backImageFilePath.value.split('/').last;
      }
      return PGSpi(
              RiskFormApi.uploadidverification.toTarget(inputData: reqParams))
          .rxRequest<dynamic>((value) {
        return value;
      });
    }).doOnData((event) {
      isLoading.value = false;
      if (event.success == true) {
        /// 成功后退出当前页面
        Get.back<dynamic>();

        /// 退出 kyc 中级认证页面
        Get.back<dynamic>();
        if (Get.currentRoute != Routes.kycHome.route) {
          /// 如果返回后的页面不是 kyc 首页则再进入到 kyc 首页
          Get.toNamed<dynamic>(Routes.kycHome.route);
        }
        KycService.sharedInstance.showReviewDialog();
      }
    }).doOnError((err, p1) {
      isLoading.value = false;
      if (err is GoGamingResponse) {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: err.toString());
      } else {
        Toast.showTryLater();
      }
    }).listen((event) {});
  }
}
