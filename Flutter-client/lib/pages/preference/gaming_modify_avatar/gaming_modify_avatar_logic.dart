import 'dart:io';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_upload_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/helper/http_uploader.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/helper/perimission_util.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:image_picker/image_picker.dart';

import '../../../common/api/account/models/gaming_user_model.dart';
import '../../../common/api/base/base_api.dart';

class GamingModifyAvatarLogic extends BaseController {
  GamingUserModel? userModel;

  List<String> avatarIcons = [
    'avatar-1',
    'avatar-2',
    'avatar-3',
    'avatar-4',
    'avatar-5'
  ];

  RxString curIcon = ''.obs;
  // 1 本地默认的，2 上传图片
  RxInt imageType = 1.obs;

  final picker = ImagePicker();
  final imageFilePath = ''.obs;
  RxBool isLoading = false.obs;
  @override
  void onInit() {
    super.onInit();
    _initAvatar();
  }

  void _initAvatar() {
    userModel = AccountService.sharedInstance.gamingUser;
    final defaultAvatarApp =
        MerchantService().merchantConfigModel?.defaultAvatarApp;
    if (defaultAvatarApp?.isNotEmpty == true) {
      avatarIcons = [];
      defaultAvatarApp!.asMap().forEach((index, value) {
        avatarIcons.add('avatar-${index + 1}');
      });
    }
  }

  void setAvatar() {
    isLoading.value = true;
    if (imageType.value == 1) {
      setAvatarWithDefault(curIcon.value.replaceAll('_', '-'));
    } else {
      _uploadImage(imageFilePath.value).listen((event) {
        setAvatarWithDefault(event);
      }).onError((value) {
        isLoading.value = false;
      });
    }
  }

  void setAvatarWithDefault(String iconPath) {
    PGSpi(Account.modifyAvatar.toTarget(
      inputData: {'avatar': iconPath},
    )).rxRequest<bool?>((value) {
      final data = value['data'];
      if (data is bool) {
        return data;
      } else {
        return null;
      }
    }).listen((value) {
      if (value.success) {
        AccountService().updateGamingUserInfo().listen((value) {
          GamingEvent.changeAvatar.notify();
        });
        Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.success,
          title: localized('successful'),
          message: localized('set_s'),
        );
        isLoading.value = false;
        Navigator.of(Get.overlayContext!).pop();
      }
    }, onError: (e) {
      isLoading.value = false;
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('hint'),
        message: localized('set_f'),
      );
    });
  }

  Future<bool> _requestPermission([bool openGallery = false]) {
    if (openGallery) {
      return GamingPermissionUtil.photos();
    } else {
      return GamingPermissionUtil.camera();
    }
  }

  Future<String> selectImage({bool openGallery = true}) async {
    return _requestPermission().then((value) async {
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
          return '';
        }

        imageFilePath.value = imageFile.path;
        return imageFilePath.value;
      } else {
        return '';
      }
    });
  }

  Stream<String> _uploadImage(String filePath) {
    if (filePath.isEmpty) {
      return Stream.value("");
    }
    Map<String, dynamic> reqParams = {
      "type": "User",
      "fileName": filePath.split('/').last,
    };
    return PGSpi(Account.createUploadUrl.toTarget(inputData: reqParams))
        .rxRequest<GamingUploadModel>((value) {
      return GamingUploadModel.fromJson(value['data'] as Map<String, dynamic>);
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
    }).doOnError((error, stackTrace) {
      if (error is GoGamingResponse) {
        Toast.showFailed(error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

  void changeImageType() {
    if (imageType.value == 1) {
      imageType.value = 2;
    } else {
      imageType.value = 1;
    }

    curIcon.value = '';
    imageFilePath.value = '';
  }

  bool enableSure() {
    if (imageType.value == 1) return curIcon.value.isNotEmpty;
    if (imageType.value == 2) return imageFilePath.value.isNotEmpty;
    return false;
  }
}
