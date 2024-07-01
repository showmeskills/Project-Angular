import 'package:file_picker/file_picker.dart';
import 'package:gogaming_app/common/api/risk_form/risk_form_api.dart';
import 'package:gogaming_app/helper/http_uploader.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../common/api/kyc/models/gg_kyc_document_model.dart';
import '../../../../common/api/kyc/models/gg_kyc_upload.dart';
import '../../../../common/lang/locale_lang.dart';
import '../../../../common/service/kyc_service.dart';
import '../../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../../../helper/perimission_util.dart';
import '../../../../common/api/kyc/kyc.dart';
import 'dart:io';

class GGKycReplenishLogic extends BaseController {
  GGKycReplenishLogic({
    required this.paymentMethod,
    required this.customize,
  });

  final PaymentMethod? paymentMethod;
  final Customize? customize;

  RxBool buttonEnable = false.obs;
  RxBool isLoading = false.obs;
  final imageFilePath = ''.obs;
  final picker = ImagePicker();

  Future<bool> _requestPermission([bool openGallery = false]) {
    if (openGallery) {
      return GamingPermissionUtil.photos();
    } else {
      return GamingPermissionUtil.camera();
    }
  }

  void submit() {
    isLoading.value = true;
    Rx.combineLatestList([
      _uploadImage(imageFilePath.value),
    ]).flatMap((value) {
      if (paymentMethod != null) {
        Map<String, dynamic> reqParams = {
          "id": paymentMethod?.id,
          "paymentName": paymentMethod?.type,
        };
        if (value.first.isNotEmpty) {
          reqParams["screenshotProof"] = value.first;
          reqParams['originalFileName'] = imageFilePath.value.split('/').last;
        }
        return PGSpi(
                RiskFormApi.uploadpaymentmethod.toTarget(inputData: reqParams))
            .rxRequest<dynamic>((value) {
          return value;
        });
      } else {
        Map<String, dynamic> reqParams = {
          "id": customize?.id,
          "customizeName": customize?.type,
        };
        if (value.first.isNotEmpty) {
          reqParams["customizeValue"] = value.first;
          reqParams['originalFileName'] = imageFilePath.value.split('/').last;
        }
        return PGSpi(RiskFormApi.uploadcustomize.toTarget(inputData: reqParams))
            .rxRequest<dynamic>((value) {
          return value;
        });
      }
    }).doOnData((event) {
      isLoading.value = false;
      if (event.success == true) {
        /// 成功后退出当前页面
        Get.back<dynamic>();
        KycService.sharedInstance.showReviewDialog();
        KycService.sharedInstance.refreshKycTips();
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

  Stream<String> _uploadImage(String filePath) {
    if (filePath.isEmpty) {
      return Stream.value("");
    }
    Map<String, dynamic> reqParams = {
      "type": "Kyc",
      "fileName": filePath.split('/').last,
    };
    return PGSpi(Kyc.createUploadUrl.toTarget(inputData: reqParams))
        .rxRequest<GamingKycUploadModel>((value) {
      return GamingKycUploadModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).flatMap((data) {
      if (data.success) {
        String fulUrl = data.data.fullUrl ?? '';
        return HttpUploader.upload(
          uploadUrl: data.data.url ?? '',
          fullUrl: fulUrl,
          file: File(filePath),
          contentType: filePath.toLowerCase().endsWith('.pdf')
              ? 'application/pdf'
              : 'image/jpeg',
        );
      } else {
        return Stream.value('');
      }
    });
  }

  void selectFile() async {
    GamingPermissionUtil.fileLibrary().then((value) async {
      if (value) {
        final result = await FilePicker.platform.pickFiles(
          type: FileType.custom,
          allowedExtensions: ['pdf'],
        );
        if (result == null) {
          Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: localized("image_failed"),
          );
          return;
        }
        imageFilePath.value = result.files.single.path!;
        if (imageFilePath.value.isNotEmpty) {
          buttonEnable.value = true;
        }
      }
    });
  }

  void selectImage(bool isFront, {bool openGallery = true}) async {
    _requestPermission(openGallery).then((value) async {
      if (value) {
        XFile? imageFile = await picker.pickImage(
            source: openGallery ? ImageSource.gallery : ImageSource.camera,
            imageQuality: 60);
        if (imageFile == null) {
          Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: localized("image_failed"),
          );
          return;
        }
        imageFilePath.value = imageFile.path;
        if (imageFilePath.value.isNotEmpty) {
          buttonEnable.value = true;
        }
      }
    });
  }
}
