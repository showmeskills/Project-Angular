import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:octo_image/octo_image.dart';

// ignore: depend_on_referenced_packages
import 'package:flutter_cache_manager/flutter_cache_manager.dart';

import 'gaming_image_cache_manager.dart';

part 'gaming_image_failed_widget.dart';
part 'gaming_network_image.dart';
part 'gaming_asset_image.dart';

class GamingImage extends StatelessWidget {
  const GamingImage._({
    required this.widget,
    this.radius,
    this.width,
    this.height,
  });

  static const defaultFadeInDuration = Duration(milliseconds: 0);
  static const defaultFadeInCurve = Curves.easeIn;
  static const defaultFadeOutDuration = Duration(milliseconds: 0);
  static const defaultFadeOutCurve = Curves.easeOut;

  final Widget widget;
  final double? radius;
  final double? width;
  final double? height;

  /// loading显示模糊图片 加载完成后显示正常图片
  factory GamingImage.fuzzyNetwork({
    String? url,
    required String progressUrl,
    double? radius,
    double? width,
    double? height,
    double? cacheWidth,
    double? cacheHeight,
    Duration? fadeInDuration,
    Duration? fadeOutDuration,
    Curve? fadeInCurve,
    Curve? fadeOutCurve,
    Duration? placeholderFadeInDuration,
    Color? color,
    BlendMode? colorBlendMode,
    FilterQuality filterQuality = FilterQuality.low,
    BoxFit? fit,
    Alignment alignment = Alignment.center,
    ImageRepeat repeat = ImageRepeat.noRepeat,
    bool matchTextDirection = false,
    Widget Function(BuildContext, Widget)? imageBuilder,
    Widget Function(BuildContext, Object, StackTrace?)? errorBuilder,
  }) {
    return GamingImage._(
      radius: radius,
      width: width,
      height: height,
      widget: GamingNetworkImage(
        url: url,
        width: width,
        height: height,
        cacheWidth: cacheWidth,
        cacheHeight: cacheHeight,
        fadeInDuration: fadeInDuration ?? defaultFadeInDuration,
        fadeOutDuration: fadeOutDuration ?? defaultFadeOutDuration,
        fadeInCurve: fadeInCurve ?? defaultFadeInCurve,
        fadeOutCurve: fadeOutCurve ?? defaultFadeOutCurve,
        placeholderFadeInDuration: placeholderFadeInDuration,
        color: color,
        colorBlendMode: colorBlendMode,
        filterQuality: filterQuality,
        fit: fit,
        alignment: alignment,
        repeat: repeat,
        matchTextDirection: matchTextDirection,
        imageBuilder: imageBuilder,
        placeholderBuilder: (_) {
          return GamingImage.network(
            url: progressUrl,
            width: width,
            height: height,
            cacheHeight: cacheHeight,
            cacheWidth: cacheWidth,
            fit: fit,
            alignment: alignment,
            // placeholderBuilder: (_) => const ColoredBox(color: Colors.red),
          );
        }, //placeholderBuilder和progressIndicatorBuilder不能同时存在
        errorBuilder: errorBuilder,
      ),
    );
  }

  factory GamingImage.network({
    String? cacheKey,
    String? url,
    double? radius,
    double? width,
    double? height,
    double? cacheWidth,
    double? cacheHeight,
    Duration? fadeInDuration,
    Duration? fadeOutDuration,
    Curve? fadeInCurve,
    Curve? fadeOutCurve,
    Duration? placeholderFadeInDuration,
    Color? color,
    BlendMode? colorBlendMode,
    FilterQuality filterQuality = FilterQuality.low,
    BoxFit? fit,
    Alignment alignment = Alignment.center,
    ImageRepeat repeat = ImageRepeat.noRepeat,
    bool matchTextDirection = false,
    Widget Function(BuildContext, Widget)? imageBuilder,
    Widget Function(BuildContext context)? placeholderBuilder,
    Widget Function(BuildContext, Object, StackTrace?)? errorBuilder,
    BaseCacheManager? cacheManager,
  }) {
    return GamingImage._(
      radius: radius,
      width: width,
      height: height,
      widget: GamingNetworkImage(
        cacheKey: cacheKey,
        url: url,
        width: width,
        height: height,
        cacheWidth: cacheWidth,
        cacheHeight: cacheHeight,
        fadeInDuration: fadeInDuration ?? defaultFadeInDuration,
        fadeOutDuration: fadeOutDuration ?? defaultFadeOutDuration,
        fadeInCurve: fadeInCurve ?? defaultFadeInCurve,
        fadeOutCurve: fadeOutCurve ?? defaultFadeOutCurve,
        placeholderFadeInDuration: placeholderFadeInDuration,
        color: color,
        colorBlendMode: colorBlendMode,
        filterQuality: filterQuality,
        fit: fit,
        alignment: alignment,
        repeat: repeat,
        matchTextDirection: matchTextDirection,
        imageBuilder: imageBuilder,
        placeholderBuilder: placeholderBuilder,
        errorBuilder: errorBuilder,
        cacheManager: cacheManager,
      ),
    );
  }

  factory GamingImage.asset(
    String name, {
    double? radius,
    double? width,
    double? height,
    Color? color,
    BoxFit? fit,
    AssetBundle? bundle,
    String? package,
    bool matchTextDirection = false,
    Widget Function(BuildContext context)? placeholderBuilder,
  }) {
    return GamingImage._(
      radius: radius,
      width: width,
      height: height,
      widget: GamingAssetImage(
        name,
        width: width,
        height: height,
        color: color,
        fit: fit,
        bundle: bundle,
        package: package,
        matchTextDirection: matchTextDirection,
        placeholderBuilder: placeholderBuilder,
      ),
    );
  }

  factory GamingImage.file(
    File file, {
    double? radius,
    double? width,
    double? height,
    Color? color,
    BoxFit? fit,
    double? cacheWidth,
    double? cacheHeight,
    Widget Function(BuildContext, Object, StackTrace?)? errorBuilder,
  }) {
    return GamingImage._(
      radius: radius,
      width: width,
      height: height,
      widget: Image.file(
        file,
        width: width,
        height: height,
        color: color,
        fit: fit,
        cacheWidth: cacheWidth?.toInt(),
        cacheHeight: cacheHeight?.toInt(),
        errorBuilder: (context, error, stackTrace) {
          return errorBuilder?.call(context, error, stackTrace) ??
              const Center(
                child: GamingImageFailed(),
              );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(radius ?? 0),
        child: widget,
      ),
    );
  }
}
