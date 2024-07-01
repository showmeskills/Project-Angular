part of 'gaming_image.dart';

class GamingNetworkImage extends StatelessWidget {
  GamingNetworkImage({
    super.key,
    String? cacheKey,
    String? url,
    this.width,
    this.height,
    this.cacheWidth,
    this.cacheHeight,
    this.fadeInDuration = GamingImage.defaultFadeInDuration,
    this.fadeOutDuration = GamingImage.defaultFadeOutDuration,
    this.fadeInCurve = GamingImage.defaultFadeInCurve,
    this.fadeOutCurve = GamingImage.defaultFadeOutCurve,
    this.placeholderFadeInDuration,
    this.color,
    this.colorBlendMode,
    this.filterQuality = FilterQuality.low,
    this.fit,
    this.alignment = Alignment.center,
    this.repeat = ImageRepeat.noRepeat,
    this.matchTextDirection = false,
    this.imageBuilder,
    this.placeholderBuilder,
    this.errorBuilder,
    BaseCacheManager? cacheManager,
  }) : _image = CachedNetworkImageProvider(
          url ?? '',
          cacheKey: cacheKey,
          cacheManager: cacheManager ?? GamingImageCacheManager(),
        );

  final CachedNetworkImageProvider _image;
  final double? width;
  final double? height;
  final double? cacheWidth;
  final double? cacheHeight;
  final Duration? fadeInDuration;
  final Duration? fadeOutDuration;
  final Curve? fadeInCurve;
  final Curve? fadeOutCurve;
  final Duration? placeholderFadeInDuration;
  final Color? color;
  final BlendMode? colorBlendMode;
  final FilterQuality filterQuality;
  final BoxFit? fit;
  final Alignment alignment;
  final ImageRepeat repeat;
  final bool matchTextDirection;
  final Widget Function(BuildContext, Widget)? imageBuilder;
  final Widget Function(BuildContext)? placeholderBuilder;
  final Widget Function(BuildContext, Object, StackTrace?)? errorBuilder;

  bool get _isURL {
    final uri = Uri.parse(_image.url);
    return uri.isScheme('http') || uri.isScheme('https');
  }

  bool get _isSvgPicture {
    if (_image.url.toLowerCase().endsWith('.svg') ||
        _image.url.toLowerCase().contains('.svg/')) {
      return true;
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    if (!_isURL) {
      return errorBuilder?.call(context, '', null) ??
          const Center(
            child: GamingImageFailed(),
          );
    }
    if (_isSvgPicture) {
      return SvgPicture.network(
        _image.url,
        width: width,
        height: height,
        fit: fit ?? BoxFit.contain,
        alignment: alignment,
        matchTextDirection: matchTextDirection,
        color: color,
        colorBlendMode: colorBlendMode ?? BlendMode.srcIn,
        placeholderBuilder: (context) {
          return placeholderBuilder?.call(context) ?? Container();
        },
      );
    }
    return OctoImage(
      image: _image,
      width: width,
      height: height,
      memCacheWidth: cacheWidth?.toInt() ?? _image.maxWidth,
      memCacheHeight: cacheHeight?.toInt() ?? _image.maxHeight,
      fit: fit,
      alignment: alignment,
      repeat: repeat,
      matchTextDirection: matchTextDirection,
      color: color,
      filterQuality: filterQuality,
      colorBlendMode: colorBlendMode,
      gaplessPlayback: false,
      fadeOutDuration: fadeOutDuration,
      fadeOutCurve: fadeOutCurve,
      fadeInDuration: fadeInDuration,
      fadeInCurve: fadeInCurve,
      placeholderFadeInDuration: placeholderFadeInDuration,
      imageBuilder: imageBuilder,
      placeholderBuilder: (context) {
        return placeholderBuilder?.call(context) ?? Container();
      },
      errorBuilder: (context, error, stackTrace) {
        return errorBuilder?.call(context, error, stackTrace) ??
            const Center(
              child: GamingImageFailed(),
            );
      },
    );
  }
}
