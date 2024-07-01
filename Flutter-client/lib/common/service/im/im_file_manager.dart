import 'dart:io';

import 'package:gogaming_app/common/service/file_service/file_service.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

enum FileType {
  file('file'),
  video('video'),
  image('image');

  final String value;
  const FileType(this.value);
}

class IMFileManager {
  /// 子目录的路径
  final String subDirectory;
  Directory? _document;

  IMFileManager({required this.subDirectory});

  /// 生成本地文件路径，但不创建文件，返回File对象
  Stream<File> generateLocalPath(String sourcePath, FileType type,
      [String? filename, String? ext]) {
    return _getDocumentDirectory().flatMap((documentsDirectory) {
      final fileName = filename ?? p.basenameWithoutExtension(sourcePath);
      final extension = ext ?? p.extension(sourcePath);
      return Stream.value(File(p.join(
        documentsDirectory.path,
        subDirectory,
        type.value,
        fileName + extension,
      )));
    });
  }

  Stream<Directory> _getDocumentDirectory() {
    if (_document is Directory) {
      return Stream.value(_document!);
    } else {
      return getApplicationDocumentsDirectory().asStream().doOnData((event) {
        _document = event;
      });
    }
  }

  /// 保存系统文件到本地 返回去掉Documents的相对路径
  Stream<File> saveFileToLocalStorage(String sourcePath, FileType type,
      [String? filename]) {
    return generateLocalPath(sourcePath, type, filename).flatMap((file) {
      return FileService()
          .copyFile(
            sourcePath: sourcePath,
            newPath: file.path,
          )
          .asStream();
    });
  }

  /// 上传文件 返回去掉Documents的相对路径
  /// 上传文件 返回去掉Documents的相对路径
  Stream<File> uploadFile(
    String sourcePath,
    FileType type,
    void Function(double percent)? onSendProgress,
  ) {
//     String urlFileStore =
//     (authController.state as Authenticated).currentAccount.urlFileStore;
// String apiTokenFileStore = (authController.state as Authenticated)
//     .currentAccount
//     .apiTokenFileStore;

// dartio.BaseOptions options = dartio.BaseOptions(
//     contentType: "multipart/form-data",
//     headers: {'Authorization': apiTokenFileStore},
//     connectTimeout: 200000,
//     receiveTimeout: 200000,
//     sendTimeout: 200000,
//     followRedirects: true,
//     validateStatus: (status) {
//       _logger.wtf('uploadFile Status: $status');
//       return status <= 500;
//     });

// dartio.Dio dio = dartio.Dio(options);

// try {
//   var formData = dartio.FormData.fromMap({
//     'file': await dartio.MultipartFile.fromFile(message.filePath),
//   });

//   var response = await dio.post(
//     urlFileStore,
//     data: formData,
//     onSendProgress: (int sent, int total) {
//       _logger.wtf('$sent $total');
//     },
//   );
//   //update message object filePath
//   _logger.v(response);
// } on Exception catch (e) {
//   _logger.e(e);
// }
    // 先保存到本地 再上传到文件服务器
    return saveFileToLocalStorage(sourcePath, type);
  }
}
