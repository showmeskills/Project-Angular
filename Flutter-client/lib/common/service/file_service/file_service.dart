import 'dart:io';

import 'package:path/path.dart' as p;

class FileService {
  static final FileService _signalrProvider = FileService._internal();
  FileService._internal();
  factory FileService() => _signalrProvider;

  // 保存文件到指定路径
  Future<void> saveFile(String filePath, List<int> data) async {
    await createDirectoryIfNeed(filePath);
    final file = File(filePath);
    await file.writeAsBytes(data);
  }

  Future<File> copyFile({
    required String sourcePath,
    required String newPath,
  }) async {
    await createDirectoryIfNeed(newPath);
    final sourceFile = File(sourcePath);
    return await sourceFile.copy(newPath);
  }

  Future<Directory> createDirectoryIfNeed(String filePath) async {
    String directoryPath = p.dirname(filePath);
    // 确保目录存在，如果不存在则创建
    final directory = Directory(directoryPath);
    if (!directory.existsSync()) {
      return await directory.create(recursive: true);
    } else {
      return Future.value(directory);
    }
  }

  // 读取文件内容
  Future<List<int>> readFile(String filePath) async {
    final file = File(filePath);
    return file.readAsBytes();
  }

  // 删除文件
  Future<void> deleteFile(String filePath) async {
    final file = File(filePath);
    await file.delete();
  }

  // 检查文件是否存在
  bool fileExists(String filePath) {
    final file = File(filePath);
    return file.existsSync();
  }

  // 获取文件大小
  Future<int> getFileSize(String filePath) async {
    final file = File(filePath);
    return file.length();
  }
}
