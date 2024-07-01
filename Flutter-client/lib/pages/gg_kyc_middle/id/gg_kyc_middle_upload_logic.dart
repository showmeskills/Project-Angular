import 'dart:io';

import 'package:gogaming_app/helper/http_uploader.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/perimission_util.dart';
import 'package:image_picker/image_picker.dart';
import 'package:gogaming_app/common/api/kyc/kyc.dart';
import 'package:iovation_flutter/iovation_flutter.dart';

import '../../../common/api/kyc/models/gg_kyc_upload.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/event_service.dart';
import '../../../common/service/kyc_service.dart';

class GGKycMiddleUploadLogic extends BaseController {
  RxBool buttonEnable = false.obs;
  RxBool isLoading = false.obs;
  final frontImageFilePath = ''.obs;
  final backImageFilePath = ''.obs;
  final picker = ImagePicker();
  String currentIdType = '';

  late int needUploadImageNum;

  void submit(String countryCode, String fullName, String firstName,
      String lastName, String idType) {
    currentIdType = idType;

    /// 亚洲流程直接提交
    if (KycService.sharedInstance.isAsia) {
      _pullAsiaDocument(countryCode, fullName, firstName, lastName, idType);
      return;
    }

    /// poa 已经通过则不进入 poa 认证页面,直接提交
    if (KycService().userVerificationForEu?.poaFileStatus == 2) {
      _pullIDDocument(countryCode, fullName, firstName, lastName, idType);
      return;
    }
    Get.toNamed<dynamic>(Routes.kycPOA.route);
  }

  void _pullIDDocument(String countryCode, String fullName, String firstName,
      String lastName, String idType) {
    isLoading.value = true;
    Rx.combineLatestList([
      uploadImage(frontImageFilePath.value),
      uploadImage(backImageFilePath.value),
    ]).flatMap((value) {
      Map<String, dynamic> reqParams = {
        "firstName":
            KycService.sharedInstance.userVerificationForEu?.firstName ?? '',
        "lastName":
            KycService.sharedInstance.userVerificationForEu?.lastName ?? '',
        "address":
            KycService.sharedInstance.userVerificationForEu?.address ?? '',
        "country": countryCode,
        "idType": idType,
        "dob": KycService.sharedInstance.userVerificationForEu?.birthDay ?? '',
      };

      if (value.first.isNotEmpty) {
        reqParams["frontsideImage"] = value.first;
        reqParams['originalFileName'] =
            frontImageFilePath.value.split('/').last;
      }

      if (value[1].isNotEmpty) {
        reqParams["backsideImage"] = value[1];
        reqParams['originalFileName2'] =
            backImageFilePath.value.split('/').last;
      }

      return IovationFlutter.getBlackBox().asStream().flatMap((blackBox) {
        return PGSpi(Kyc.intermediateidcardforeu.toTarget(inputData: {
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

        /// 退出 kyc 中级认证页面
        Get.back<dynamic>();
        if (Get.currentRoute != Routes.kycHome.route) {
          /// 如果返回后的页面不是 kyc 首页则再进入到 kyc 首页
          Get.toNamed<dynamic>(Routes.kycHome.route);
        }
        GamingEvent.kycMiddleSuccess.notify();
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

  void _pullAsiaDocument(String countryCode, String fullName, String firstName,
      String lastName, String idType) {
    isLoading.value = true;
    Rx.combineLatestList([
      uploadImage(frontImageFilePath.value),
      uploadImage(backImageFilePath.value),
    ]).flatMap((value) {
      Map<String, dynamic> reqParams = {
        "countryCode": countryCode,
        "idType": idType,
      };
      if (value.first.isNotEmpty) {
        reqParams["frontsideImage"] = value.first;
      }
      if (value[1].isNotEmpty) {
        reqParams["backsideImage"] = value[1];
      }
      if (fullName.isNotEmpty) reqParams["fullName"] = fullName;
      if (firstName.isNotEmpty) reqParams["firstName"] = firstName;
      if (lastName.isNotEmpty) reqParams["lastName"] = lastName;
      return IovationFlutter.getBlackBox().asStream().flatMap((blackBox) {
        return PGSpi(Kyc.globalIntermediate.toTarget(inputData: {
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

        /// 退出 kyc 中级认证页面
        Get.back<dynamic>();
        if (Get.currentRoute != Routes.kycHome.route) {
          /// 如果返回后的页面不是 kyc 首页则再进入到 kyc 首页
          Get.toNamed<dynamic>(Routes.kycHome.route);
        }
        GamingEvent.kycMiddleSuccess.notify();
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
          contentType: 'image/jpeg',
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

        if (isFront) {
          frontImageFilePath.value = imageFile.path;
        } else {
          backImageFilePath.value = imageFile.path;
        }

        if (needUploadImageNum == 1 && frontImageFilePath.value.isNotEmpty) {
          buttonEnable.value = true;
        } else if (needUploadImageNum == 2 &&
            frontImageFilePath.value.isNotEmpty &&
            backImageFilePath.value.isNotEmpty) {
          buttonEnable.value = true;
        }
      }
    });
  }
}
