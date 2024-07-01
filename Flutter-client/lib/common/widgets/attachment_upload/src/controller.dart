part of attachment_upload;

// abstract class AttachmentUploadControllerImpl {
//   Future<String?> openPicker(PickMethod method);
//   Future<String?> openFilePicker();
//   Future<String?> openMediaPicker(PickMethod method);
// }

class AttachmentPicker {
  static Future<String?> pickMedia({
    required PickMethod method,
    AttachmentType type = AttachmentType.image,
    List<String>? format,
    int maxFileSize = 5 * 1024 * 1024,
    int imageQuality = 60,
  }) {
    return _requestPermission(PickMethod.gallery).then((value) async {
      if (value) {
        final extensions = format?.isEmpty ?? true ? type.extensions : format!;

        if (type == AttachmentType.image) {
          return _openImagePicker(method, extensions, imageQuality);
        } else {
          return _openVideoPicker(method, extensions);
        }
      }
      return null;
    }).then((path) async {
      if (path != null) {
        if (await File(path).length() > maxFileSize) {
          Toast.showFailed(localized('file_limerr'));
          return null;
        }
      }
      return path;
    });
  }

  static Future<String?> pickFile({
    List<String>? format,
    int maxFileSize = 5 * 1024 * 1024,
  }) async {
    return _requestPermission(PickMethod.fileLibrary).then((value) async {
      if (value) {
        return _openFilePicker(format: format);
      }
      return null;
    }).then((path) async {
      if (path != null) {
        if (await File(path).length() > maxFileSize) {
          Toast.showFailed(localized('file_limerr'));
          return null;
        }
      }
      return path;
    });
  }

  static Future<String?> _openFilePicker({
    List<String>? format,
  }) async {
    final extensions =
        format?.isEmpty ?? true ? AttachmentType.file.extensions : format!;

    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions:
          extensions.map((e) => e.replaceFirst(RegExp(r'\.'), '')).toList(),
    );
    if (result == null) {
      return null;
    }

    final ext = path.extension(result.files.single.path!).toLowerCase();
    if (!extensions.contains(ext)) {
      Toast.showFailed(localized('unsupp_file'));
      return null;
    }
    return result.files.single.path!;
  }

  static Future<String?> _openImagePicker(
      PickMethod method, List<String> extensions,
      [int imageQuality = 60]) async {
    final result = await ImagePicker().pickImage(
      source: method == PickMethod.gallery
          ? ImageSource.gallery
          : ImageSource.camera,
      imageQuality: imageQuality,
    );
    if (result == null) {
      return null;
    }

    final ext = path.extension(result.path).toLowerCase();
    if (!extensions.contains(ext)) {
      Toast.showFailed(localized('unsupp_file'));
      return null;
    }
    return result.path;
  }

  static Future<String?> _openVideoPicker(
      PickMethod method, List<String> extensions) async {
    final result = await ImagePicker().pickVideo(
      source: method == PickMethod.gallery
          ? ImageSource.gallery
          : ImageSource.camera,
    );
    if (result == null) {
      return null;
    }

    final ext = path.extension(result.path).toLowerCase();
    if (!extensions.contains(ext)) {
      Toast.showFailed(localized('unsupp_file'));
      return null;
    }
    return result.path;
  }

  static Future<bool> _requestPermission(PickMethod method) {
    switch (method) {
      case PickMethod.camera:
        return GamingPermissionUtil.camera();
      case PickMethod.gallery:
        return GamingPermissionUtil.gallery();
      case PickMethod.fileLibrary:
        return GamingPermissionUtil.fileLibrary();
    }
  }
}

class AttachmentUploadController {
  final int maxCount;
  final List<PickMethod> pickMethod;
  final String type;
  final void Function(List<String>)? onUpload;
  final Map<AttachmentType, List<String>> format;
  final int maxFileSize;
  AttachmentUploadController({
    required this.type,
    this.maxCount = 4,
    this.pickMethod = const [
      PickMethod.camera,
      PickMethod.gallery,
    ],
    List<String> attachments = const [],
    this.format = const {},
    this.onUpload,
    this.maxFileSize = 30 * 1024 * 1024,
  }) : assert(maxCount > 0 && pickMethod.isNotEmpty) {
    _attachments.value = attachments;
  }

  final _attachments = <String>[].obs;
  List<String> get attachments => _attachments;

  final _uploading = false.obs;
  bool get uploading => _uploading.value;

  final _uploadMissing = false.obs;
  bool get uploadMissing => _uploadMissing.value;

  bool get isFull => attachments.length >= maxCount;

  void delete(String v) {
    _attachments.value = List.from(attachments)..remove(v);
    onUpload?.call(attachments);
  }

  void select(PickMethod method) {
    openPicker(method).then((filePath) async {
      if (filePath != null) {
        final file = File(filePath);

        if (await file.length() > maxFileSize) {
          Toast.showFailed(localized('file_limerr'));
          return;
        }
        _upload(filePath).doOnData((event) {
          if (event.isNotEmpty) {
            _attachments.value = List.from(attachments)..add(event);
            onUpload?.call(attachments);
          }
        }).listen(null, onError: (p0, p1) {});
      }
    });
  }

  Future<String?> openPicker(PickMethod method) {
    if (method == PickMethod.fileLibrary) {
      return AttachmentPicker.pickFile(
        format: format[AttachmentType.file],
      );
    } else {
      return AttachmentPicker.pickMedia(
        method: method,
        type: AttachmentType.image,
        format: format[AttachmentType.image],
      );
    }
  }

  Stream<String> _upload(String filePath, [bool showLoading = true]) {
    if (filePath.isEmpty) {
      return Stream.value('');
    }
    if (showLoading) {
      _uploading.value = true;
      SmartDialog.showLoading<void>();
    }
    Map<String, dynamic> reqParams = {
      'type': type,
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
      _uploading.value = false;
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    });
  }
}

extension AttachmentUploadControllerAction on AttachmentUploadController {
  Future<PickMethod?> showPickMethod() {
    return GamingSelector.simple<PickMethod>(
      title: localized("sen_de"),
      useCloseButton: false,
      centerTitle: true,
      fixedHeight: false,
      original: pickMethod,
      itemBuilder: (context, e, index) {
        return InkWell(
          onTap: () {
            Get.back<PickMethod>(result: e);
          },
          child: SizedBox(
            height: 50.dp,
            child: Center(
              child: Text(
                e.translate,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.regular,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void selectPickMethod() {
    if (uploading) {
      return;
    }
    if (isFull) {
      if (maxCount > 1) {
        Toast.show(
          state: GgToastState.fail,
          title: localized('failed'),
          message: localized('upload_max', params: [maxCount.toString()]),
        );
      }
      return;
    }
    showPickMethod().then((value) {
      if (value != null) {
        select(value);
      }
    });
  }
}
