import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:gogaming_app/common/service/im/im_file_cache_manager.dart';
import 'package:gogaming_app/common/service/im/im_util.dart';
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/common/service/im/models/im_asset.dart';
import 'package:gogaming_app/common/widgets/gaming_image/fuzzy_url_parser.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/chat/views/chat_image_preview.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:path/path.dart';

class ImageMessageView extends StatelessWidget {
  const ImageMessageView({
    super.key,
    required this.data,
  });

  final ChatContentModel data;

  @override
  Widget build(BuildContext context) {
    return IMImage(
      heroTag: data.localId,
      asset: data.assets!.first.copyWith(
        url: data.localFileName.isNotEmpty ? data.localFileName : null,
      ),
    );
  }
}

class IMImage extends StatelessWidget {
  const IMImage({
    super.key,
    required this.heroTag,
    required this.asset,
    this.onTap,
    this.fullMode = false,
  });

  final IMAsset asset;

  final String heroTag;

  final bool fullMode;

  final void Function()? onTap;

  bool get _isURL {
    final uri = Uri.parse(asset.url!);
    return uri.isScheme('http') || uri.isScheme('https');
  }

  @override
  Widget build(BuildContext context) {
    final url = asset.url!;
    late double originalWidth;
    late double originalHeight;
    // 如果宽高有一项为null或者0，则使用默认宽高
    if ((asset.width ?? 0) == 0 || (asset.height ?? 0) == 0) {
      originalWidth = 90.dp;
      originalHeight = 160.dp;
    } else {
      originalWidth = asset.width!.toDouble();
      originalHeight = asset.height!.toDouble();
    }
    double? width;
    double? height;
    double? cacheWidth;
    if (!fullMode) {
      (width, height) = IMUtil.calcThumbnailSize(
        originalWidth,
        originalHeight,
      );
      cacheWidth = width * Get.pixelRatio;
    }

    late Widget child;
    // 图片宽高等比例缩小
    // 如果存在localFile，则使用本地图片
    // 否则使用IMImageCacheManager进行网络图片加载
    if (!_isURL) {
      child = GamingImage.file(
        File(url),
        width: width,
        height: height,
        fit: fullMode ? BoxFit.contain : BoxFit.cover,
        radius: fullMode ? null : 8.dp,
        cacheWidth: cacheWidth,
      );
    } else {
      final fuzzyUrl = fullMode
          ? url
          : FuzzyUrlParser(url: url, w: width?.toInt(), q: 80).toString();
      child = GamingImage.network(
        url: fuzzyUrl,
        cacheKey: basename(fuzzyUrl),
        cacheManager: IMImageCacheManager(),
        width: width,
        height: height,
        fit: fullMode ? BoxFit.contain : BoxFit.cover,
        radius: fullMode ? null : 8.dp,
        cacheWidth: cacheWidth,
      );
    }

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap ??
          () {
            Navigator.push(context, PageRouteBuilder<void>(
              pageBuilder: (
                BuildContext context,
                animation,
                secondaryAnimation,
              ) {
                return ChatImagePreview(
                  asset: asset,
                  heroTag: heroTag,
                );
              },
            ));
          },
      child: Hero(
        tag: heroTag,
        child: child,
      ),
    );
  }
}
