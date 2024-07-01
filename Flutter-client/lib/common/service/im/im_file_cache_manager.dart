// ignore_for_file: depend_on_referenced_packages, implementation_imports
import 'package:file/local.dart';
import 'package:file/file.dart' hide FileSystem;
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_cache_manager/src/storage/file_system/file_system.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'im_file_manager.dart';

class IMFileCacheManager extends CacheManager {
  factory IMFileCacheManager() => _getInstance();

  static IMFileCacheManager get sharedInstance => _getInstance();

  static IMFileCacheManager? _instance;

  static IMFileCacheManager _getInstance() {
    _instance ??= IMFileCacheManager._(
        key: AccountService().curGamingUser?.uid ?? 'file_cache',
        repo: CacheObjectProvider());
    return _instance!;
  }

  final CacheObjectProvider repo;

  IMFileCacheManager._({required String key, required this.repo})
      : super(Config(
          key,
          repo: repo,
          fileSystem: IMFileSystem(key, FileType.file),
          fileService: IMHttpFileService(),
        ));

  // 关闭数据库、重置单例
  Future<void> close() async {
    if (repo.db != null) {
      await repo.close();
    }
    _instance = null;
  }
}

class IMImageCacheManager extends CacheManager with ImageCacheManager {
  factory IMImageCacheManager() => _getInstance();

  static IMImageCacheManager get sharedInstance => _getInstance();

  static IMImageCacheManager? _instance;
  static IMImageCacheManager _getInstance() {
    _instance ??= IMImageCacheManager._(
        key: AccountService().curGamingUser?.uid ?? 'im_image_cache',
        repo: CacheObjectProvider());
    return _instance!;
  }

  final CacheInfoRepository repo;

  IMImageCacheManager._({required String key, required this.repo})
      : super(Config(
          key,
          repo: repo,
          fileSystem: IMFileSystem(key, FileType.image),
          fileService: IMHttpFileService(),
        ));

  // 关闭数据库、重置单例
  Future<void> close() async {
    try {
      await repo.close();
    } catch (e) {
      // 如果从未使用过缓存，repo中的db变量为null，会报错
    }
    _instance = null;
  }
}

class IMFileSystem implements FileSystem {
  final Future<Directory> _fileDir;
  final String _cacheKey;
  final FileType type;

  IMFileSystem(this._cacheKey, this.type)
      : _fileDir = createDirectory(_cacheKey, type);

  static Future<Directory> createDirectory(String key, FileType type) async {
    final baseDir = await getApplicationDocumentsDirectory();
    final path = p.join(baseDir.path, key, type.value);

    const fs = LocalFileSystem();
    final directory = fs.directory(path);
    await directory.create(recursive: true);
    return directory;
  }

  @override
  Future<File> createFile(String name) async {
    final directory = await _fileDir;
    if (!(await directory.exists())) {
      await createDirectory(_cacheKey, type);
    }
    return directory.childFile(name);
  }
}

class IMHttpFileService extends HttpFileService {
  @override
  Future<FileServiceResponse> get(String url,
      {Map<String, String>? headers}) async {
    final response = await super.get(url, headers: headers);
    return response;
  }
}
