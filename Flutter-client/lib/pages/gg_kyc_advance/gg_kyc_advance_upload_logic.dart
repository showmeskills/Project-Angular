import 'dart:io';

import 'package:gogaming_app/helper/http_uploader.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/perimission_util.dart';
import 'package:image_picker/image_picker.dart';
import 'package:iovation_flutter/iovation_flutter.dart';

import '../../common/api/kyc/kyc.dart';
import '../../common/api/kyc/models/gg_kyc_upload.dart';
import '../../common/lang/locale_lang.dart';

class GGKycAdvanceUploadLogic extends BaseController {
  RxBool buttonEnable = false.obs;
  RxBool isLoading = false.obs;
  final imageFilePath = ''.obs;
  final picker = ImagePicker();

  void submit(
      String countryCode, String postalCode, String city, String address) {
    isLoading.value = true;
    Rx.combineLatestList([
      _uploadImage(imageFilePath.value),
    ]).flatMap((value) {
      Map<String, dynamic> reqParams = {
        "countryCode": countryCode,
        "postalCode": postalCode,
        "city": city,
        "address": address,
      };
      if (value.first.isNotEmpty) {
        reqParams["networkImgeUrl"] = value.first;
      }
      return IovationFlutter.getBlackBox().asStream().flatMap((blackBox) {
        return PGSpi(Kyc.kycAdvanced.toTarget(inputData: {
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

        /// 退出 kyc 高级认证页面
        Get.back<dynamic>();
        if (Get.currentRoute != Routes.kycHome.route) {
          /// 如果返回后的页面不是 kyc 首页则再进入到 kyc 首页
          Get.toNamed<dynamic>(Routes.kycHome.route);
        }
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
        imageFilePath.value = imageFile.path;
        if (imageFilePath.value.isNotEmpty) {
          buttonEnable.value = true;
        }
      }
    });
  }
}
