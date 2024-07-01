part of 'gaming_image.dart';

class GamingAssetImage extends StatelessWidget {
  const GamingAssetImage(
    this.name, {
    super.key,
    this.width,
    this.height,
    this.color,
    this.fit,
    this.placeholderBuilder,
    this.bundle,
    this.package,
    this.matchTextDirection = false,
    Widget Function(BuildContext, Object, StackTrace?)? errorBuilder,
  });

  final String name;
  final AssetBundle? bundle;
  final String? package;
  final double? width;
  final double? height;
  final Color? color;
  final BoxFit? fit;
  final bool matchTextDirection;
  final Widget Function(BuildContext)? placeholderBuilder;

  bool get _isSVG {
    if (name.toLowerCase().endsWith('svg')) {
      return true;
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    if (_isSVG) {
      return SvgPicture.asset(
        name,
        bundle: bundle,
        package: package,
        width: width,
        height: height,
        color: color,
        fit: fit ?? BoxFit.contain,
        matchTextDirection: matchTextDirection,
        placeholderBuilder: placeholderBuilder,
      );
    }
    return Image.asset(
      name,
      bundle: bundle,
      package: package,
      width: width,
      height: height,
      color: color,
      fit: fit,
      matchTextDirection: matchTextDirection,
      errorBuilder: placeholderBuilder != null
          ? (
              BuildContext context,
              Object error,
              StackTrace? stackTrace,
            ) {
              return placeholderBuilder!.call(context);
            }
          : null,
    );
  }
}
