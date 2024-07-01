part of video_upload;

class VideoUploadController extends AttachmentUploadController {
  /// max size of video, default 30M
  final int maxSize;
  VideoUploadController({
    required String type,
    this.maxSize = 30 * 1000 * 1000,
    List<PickMethod> pickMethod = const [PickMethod.camera, PickMethod.gallery],
    String? attachment,
    void Function(List<String>)? onUpload,
  })  : assert(!pickMethod.contains(PickMethod.fileLibrary),
            'video not support file library'),
        super(
          type: type,
          pickMethod: pickMethod,
          attachments: attachment == null ? [] : [attachment],
          maxCount: 1,
          onUpload: onUpload,
        );

  Future<String?> openMediaPicker(PickMethod method) async {
    final result = await ImagePicker().pickVideo(
      source: method == PickMethod.gallery
          ? ImageSource.gallery
          : ImageSource.camera,
    );
    if (result == null) {
      return null;
    }
    if (result.path.format != AttachmentType.video) {
      Toast.showFailed(localized('unsupp_file'));
      return null;
    }
    if (maxSize > 0) {
      if (await result.length() > maxSize) {
        Toast.showFailed(localized('file_limerr'));
        return null;
      }
    }
    return result.path;
  }
}
