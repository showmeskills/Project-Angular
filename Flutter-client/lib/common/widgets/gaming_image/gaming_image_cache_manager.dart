// ignore_for_file: depend_on_referenced_packages

import 'package:flutter_cache_manager/flutter_cache_manager.dart';

/// * `clearCache` 清空缓存
/// * `getCacheSize` 获取缓存大小
class GamingImageCacheManager extends CacheManager with ImageCacheManager {
  static const key = 'cachedImageData';

  static GamingImageCacheManager? _instance;
  factory GamingImageCacheManager() {
    _instance ??= GamingImageCacheManager._(repo: CacheObjectProvider());
    return _instance!;
  }

  final CacheInfoRepository repo;

  GamingImageCacheManager._({required this.repo})
      : super(Config(
          key,
          repo: repo,
        ));

  Future<int> getCacheSize() async {
    int total = 0;
    final opened = await repo.open();
    if (opened) {
      final objects = await repo.getAllObjects();
      for (final object in objects) {
        total += object.length ?? 0;
      }
    }

    return total;
  }

  Future<void> clearCache() => emptyCache();
}
