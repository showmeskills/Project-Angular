import 'dart:async';
import 'dart:io';

// ignore: depend_on_referenced_packages
import 'package:gogaming_app/helper/http_uploader.dart';
import 'package:path/path.dart' as path;
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_upload_model.dart';
import 'package:gogaming_app/common/api/appeal/appeal_api.dart';
import 'package:gogaming_app/common/api/appeal/models/gaming_currency_appeal_detail_model.dart';
import 'package:gogaming_app/common/api/appeal/models/gaming_tx_info_model.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/perimission_util.dart';
import 'package:gogaming_app/pages/appeal/common/appeal_common_utils_mixin.dart';
import 'package:gogaming_app/pages/appeal/pre_submit/appeal_logic.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:image_picker/image_picker.dart';
// ignore: depend_on_referenced_packages
import 'package:video_compress/video_compress.dart';

part 'currency_appeal_submit_state.dart';

class CurrencyAppealSubmitLogic extends BaseController
    with AppealCommonUtilsMixin {
  final String? id;

  CurrencyAppealSubmitLogic(this.id);

  final state = CurrencyAppealSubmitState();
  final orderNumTextFieldController = GamingTextFieldController(validator: [
    GamingTextFieldValidator.length(
      min: 1,
      errorHint: localized('require_field'),
    ),
  ]);
  final amountTextFieldController = GamingTextFieldController();
  final descTextFieldController = GamingTextFieldController(
    showClearIcon: false,
  );
  Worker? _worker;
  Worker? _worker2;
  Worker? _worker3;

  @override
  void onInit() {
    super.onInit();
    _worker = debounce<String>(orderNumTextFieldController.text, (v) {
      final orderNum = v;
      if (orderNum.isNotEmpty && orderNum != state._txInfo.value?.orderNum) {
        _loadTxInfo(orderNum);
      }
    });

    _worker2 = everAll([
      state._txInfo,
      amountTextFieldController.text,
    ], (v) {
      state._enable.value =
          state.txInfo != null && amountTextFieldController.text.isNotEmpty;
    });

    _worker3 = ever<List<String>>(state._images, (v) {
      state._uploadMissing.value = v.isEmpty;
    });

    if (id != null) {
      _loadAppealDetail();
    }
  }

  @override
  void onClose() {
    _worker?.dispose();
    _worker2?.dispose();
    _worker3?.dispose();
    super.onClose();
  }

  void _loadAppealDetail() {
    SmartDialog.showLoading<void>();
    PGSpi(Appeal.getCurrencyDepositById.toTarget(
      input: {
        'appealId': id!,
      },
    )).rxRequest<GamingCurrencyAppealDetailModel>((value) {
      final data = value['data'] as Map<String, dynamic>;
      return GamingCurrencyAppealDetailModel.fromJson(data);
    }).doOnData((event) {
      state._detail.value = event.data;
      state._txInfo.value = state.detail!.toTxInfoModel();
      orderNumTextFieldController.textController.text = state.detail!.orderNum!;
      amountTextFieldController.textController.text =
          state.detail!.amount!.stripTrailingZeros();
      _worker3?.dispose();
      if (state.detail?.needUploadVideo ?? false) {
        _worker3 = ever<String>(state._video, (v) {
          state._uploadMissing.value = v.isEmpty;
        });
      } else {
        _worker3 = ever<List<String>>(state._images, (v) {
          state._uploadMissing.value = v.isEmpty;
        });
      }
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }

  void _loadTxInfo(String orderNum) {
    SmartDialog.showLoading<void>();
    PGSpi(Appeal.getTxInfo.toTarget(
      input: {
        'orderNum': orderNum,
      },
    )).rxRequest<GamingTxInfoModel?>((value) {
      final data = value['data'] as Map<String, dynamic>?;
      if (data == null) {
        return null;
      }
      return GamingTxInfoModel.fromJson(data);
    }).doOnData((event) {
      state._txInfo.value = event.data;
      amountTextFieldController.textController.text =
          state.txInfo!.amount!.stripTrailingZeros();

      orderNumTextFieldController.addFieldError(hint: '', showErrorHint: false);
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        state._txInfo.value = null;
        Toast.showFailed(err.message);
        orderNumTextFieldController.addFieldError(hint: err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }

  Stream<String> _upload(String filePath, [bool showLoading = true]) {
    if (filePath.isEmpty) {
      return Stream.value('');
    }
    if (showLoading) {
      state._uploading.value = true;
      SmartDialog.showLoading<void>();
    }
    Map<String, dynamic> reqParams = {
      'type': 'Appeal',
      'fileName': filePath.split('/').last,
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
        );
      } else {
        return Stream.value('');
      }
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      state._uploading.value = false;
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    });
  }

  Future<bool> _requestPermission([bool openGallery = false]) {
    if (openGallery) {
      return GamingPermissionUtil.photos();
    } else {
      return GamingPermissionUtil.camera();
    }
  }

  void selectVideo({bool openGallery = true}) async {
    _requestPermission(openGallery).then((value) async {
      XFile? file = await ImagePicker().pickVideo(
        source: openGallery ? ImageSource.gallery : ImageSource.camera,
      );
      if (file == null) {
        return;
      }

      if (!['.mp3', '.mp4', '.mov', '.rmvb']
          .contains(path.extension(file.path).toLowerCase())) {
        Toast.showFailed(localized('unsupp_file'));
        return;
      }

      state._uploading.value = true;
      SmartDialog.showLoading<void>();
      VideoCompress.compressVideo(
        file.path,
        quality: VideoQuality.MediumQuality,
      ).then((value) async {
        final filePath = value?.file?.path ?? file.path;
        if (await File(filePath).length() > 30 * 1000 * 1000) {
          Toast.showFailed(localized('file_limerr'));
          return;
        }
        _upload(filePath, false).doOnData((event) {
          if (event.isNotEmpty) {
            state._video.value = event;
          }
        }).listen(null, onError: (p0, p1) {});
      });
    });
  }

  void deleteVideo() {
    state._video.value = '';
  }

  void selectImage({bool openGallery = true}) async {
    _requestPermission(openGallery).then((value) async {
      if (value) {
        XFile? file = await ImagePicker().pickImage(
          source: openGallery ? ImageSource.gallery : ImageSource.camera,
          imageQuality: 100,
        );
        if (file == null) {
          return;
        }
        if (!['.jpg', '.jpeg', '.png', '.pdf']
            .contains(path.extension(file.path).toLowerCase())) {
          Toast.showFailed(localized('unsupp_file'));
          return;
        }
        if (await file.length() > 10 * 1000 * 1000) {
          Toast.showFailed(localized('file_limerr'));
          return;
        }
        _upload(file.path).doOnData((event) {
          if (event.isNotEmpty) {
            state._images.add(event);
          }
        }).listen(null, onError: (p0, p1) {});
      }
    });
  }

  void deleteImage(String url) {
    state._images.remove(url);
  }

  void changeCanEditAmount(bool allow) {
    state._canEditAmount.value = allow;
    if (allow) {
      amountTextFieldController.focusNode.requestFocus();
    } else {
      if (amountTextFieldController.hasFocus.value) {
        amountTextFieldController.focusNode.unfocus();
      }
    }
  }

  void submit() {
    if (!state.enable) {
      if (orderNumTextFieldController.text.isEmpty) {
        orderNumTextFieldController.addFieldError(
          hint: localized('require_field'),
        );
      }
      final bool needVideo = state.detail?.needUploadVideo ?? false;
      state._uploadMissing.value =
          needVideo ? state.video.isEmpty : state.images.isEmpty;
      return;
    }

    state._loading.value = true;
    final stream = id == null ? _add() : _edit();
    stream.doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      state._loading.value = false;
    }).listen(null, onError: (p0, p1) {});
  }

  Map<String, dynamic> _toAddRequestData() {
    return {
      'orderNum': orderNumTextFieldController.text.value,
      'amount': double.parse(amountTextFieldController.text.value),
      'images': state.images,
      'desc': descTextFieldController.text.value,
    };
  }

  Stream<GoGamingResponse<String?>> _add() {
    return PGSpi(Appeal.depositByCurrency.toTarget(
      inputData: _toAddRequestData(),
    )).rxRequest<String?>((value) {
      return value['data'] as String?;
    }).doOnData((event) {
      Get.findOrNull<AppealLogic>()?.refreshData();
      showSubmitSuccessfulDialog(id: event.data!);
    }).doOnError((err, p1) {
      if (err is GoGamingResponse && err.error == GoGamingError.txIdExist) {
        orderNumTextFieldController.addFieldError(hint: err.message);
      }
    });
  }

  Map<String, dynamic> _toEditRequestData() {
    return {
      'appealId': id,
      'isCancel': false,
      'video': state.video,
      'amount': double.parse(amountTextFieldController.text.value),
      'images': state.images,
      'desc': descTextFieldController.text.value,
    };
  }

  Stream<GoGamingResponse<bool?>> _edit() {
    return PGSpi(Appeal.updateCurrencyDepositOrder.toTarget(
      inputData: _toEditRequestData(),
    )).rxRequest<bool?>((value) {
      return value['data'] as bool?;
    }).doOnData((event) {
      Get.findOrNull<AppealLogic>()?.refreshData();
      Toast.showSuccessful(localized('info_s'));
      Get.until((route) => route.settings.name == Routes.appeal.route);
    });
  }
}
