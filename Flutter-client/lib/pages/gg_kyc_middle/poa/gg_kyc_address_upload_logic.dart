import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/helper/http_uploader.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/perimission_util.dart';
import 'package:image_picker/image_picker.dart';
import 'package:iovation_flutter/iovation_flutter.dart';

import '../../../common/api/kyc/kyc.dart';
import '../../../common/api/kyc/models/gg_kyc_upload.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/kyc_service.dart';
import '../id/gg_kyc_middle_upload_logic.dart';

class GGKycAddressUploadLogic extends BaseController {
  RxBool buttonEnable = false.obs;
  RxBool isLoading = false.obs;
  final imageFilePath = ''.obs;
  final picker = ImagePicker();
  List<String> networkImgeUrls = <String>[];

  void submit(
      String countryCode, String postalCode, String city, String address) {
    /// id 已经通过不请求 id 流程
    if (KycService().userVerificationForEu?.idFileStatus == 2) {
      _pullPOADocument(countryCode, postalCode, city, address);
      return;
    }
    _pullDocument(countryCode, postalCode, city, address);
  }

  void _pullPOADocument(
      String countryCode, String postalCode, String city, String address) {
    isLoading.value = true;
    Rx.combineLatestList([
      uploadImage(imageFilePath.value),
    ]).flatMap((value) {
      networkImgeUrls.assignAll(value);
      Map<String, dynamic> reqParams = {
        "address": address,
        "city": city,
        "postalCode": postalCode,
        "country": countryCode,
        "clientKey": Config.tenantId,
        "uid": AccountService.sharedInstance.gamingUser?.uid ?? '',
      };

      if (networkImgeUrls.first.isNotEmpty) {
        reqParams["networkImgeUrl"] = networkImgeUrls.first;
        reqParams['originalFileName'] = imageFilePath.value.split('/').last;
      }

      return IovationFlutter.getBlackBox().asStream().flatMap((blackBox) {
        return PGSpi(Kyc.intermediatepoaforeu.toTarget(inputData: {
          ...reqParams,
          "iovationBlackbox": blackBox,
        })).rxRequest<dynamic>((value) {
          return value;
        });
      });
    }).doOnData((event) {
      isLoading.value = false;
      if (event.success == true) {
        /// 成功后退出当前页面
        Get.back<dynamic>();

        Get.until((route) => !Routes.kycRoutes.contains(route.settings.name));
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

  void _pullDocument(
      String countryCode, String postalCode, String city, String address) {
    GGKycMiddleUploadLogic middleUploadLogic =
        Get.find<GGKycMiddleUploadLogic>();
    isLoading.value = true;
    Rx.combineLatestList([
      uploadImage(imageFilePath.value),
      uploadImage(middleUploadLogic.frontImageFilePath.value),
      uploadImage(middleUploadLogic.backImageFilePath.value),
    ]).flatMap((value) {
      networkImgeUrls.assignAll(value);
      Map<String, dynamic> reqParams = {
        "firstName":
            KycService.sharedInstance.userVerificationForEu?.firstName ?? '',
        "lastName":
            KycService.sharedInstance.userVerificationForEu?.lastName ?? '',
        "address": address,
        "country": countryCode,
        "idType": middleUploadLogic.currentIdType,
        "dob": KycService.sharedInstance.userVerificationForEu?.birthDay ?? '',
      };

      if (networkImgeUrls[1].isNotEmpty) {
        reqParams["frontsideImage"] = networkImgeUrls[1];
        reqParams['originalFileName'] =
            middleUploadLogic.frontImageFilePath.value.split('/').last;
      }

      if (networkImgeUrls[2].isNotEmpty) {
        reqParams["backsideImage"] = networkImgeUrls[2];
        reqParams['originalFileName2'] =
            middleUploadLogic.backImageFilePath.value.split('/').last;
      }

      return IovationFlutter.getBlackBox().asStream().flatMap((blackBox) {
        return PGSpi(Kyc.intermediateidcardforeu.toTarget(inputData: {
          ...reqParams,
          "iovationBlackbox": blackBox,
        })).rxRequest<dynamic>((value) {
          return value;
        });
      });
    }).flatMap((value) {
      Map<String, dynamic> reqParams = {
        "address": address,
        "city": city,
        "postalCode": postalCode,
        "country": countryCode,
        "clientKey": Config.tenantId,
        "uid": AccountService.sharedInstance.gamingUser?.uid ?? '',
      };

      if (networkImgeUrls.first.isNotEmpty) {
        reqParams["networkImgeUrl"] = networkImgeUrls.first;
        reqParams['originalFileName'] = imageFilePath.value.split('/').last;
      }

      return IovationFlutter.getBlackBox().asStream().flatMap((blackBox) {
        return PGSpi(Kyc.intermediatepoaforeu.toTarget(inputData: {
          ...reqParams,
          "iovationBlackbox": blackBox,
        })).rxRequest<dynamic>((value) {
          return value;
        });
      });
    }).doOnData((event) {
      isLoading.value = false;
      if (event.success == true) {
        /// 成功后退出当前页面
        Get.back<dynamic>();

        Get.until((route) => !Routes.kycRoutes.contains(route.settings.name));
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

  Stream<String> uploadImage(String filePath) {
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

  Future<bool> _requestPermission([bool openGallery = false]) {
    if (openGallery) {
      return GamingPermissionUtil.photos();
    } else {
      return GamingPermissionUtil.camera();
    }
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
