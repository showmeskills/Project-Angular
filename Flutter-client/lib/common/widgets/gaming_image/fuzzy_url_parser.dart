class FuzzyUrlParser {
  FuzzyUrlParser({
    required this.url,
    this.w,
    this.h,
    this.blur,
    this.q = 80,
    this.dpr,
    this.format = 'webp',
  });

  /// 图片地址
  final String url;

  /// 图片宽度，不传代表使用图片原始宽度
  final num? w;

  /// 图片高度，不传代表使用图版原始高度，w跟h填一个即可，根据图片原始比例进行绽放
  final num? h;

  /// 模糊度，默认0，范围1-20
  final num? blur;

  /// 图片质量，范围0-80，默认80
  final int? q;

  /// 图片尺寸倍数，范围1-5，默认1，如果w传200，dpr2传2，那么返回的图片的w应该是400
  final int? dpr;

  /// 最终输出的格式
  final String? format;

  /// 默认模糊图宽度200
  factory FuzzyUrlParser.blur({num? width = 200, required String url}) {
    return FuzzyUrlParser(
      url: url,
      w: width,
      blur: 10,
    );
  }

  @override
  String toString() {
    final parameters = [
      if (w != null) "w=$w",
      if (h != null) "h=$h",
      if (blur != null) "blur=$blur",
      if (q != null) "q=$q",
      if (dpr != null) "dpr=$dpr",
      if (format != null) "format=$format",
    ];

    if (parameters.isEmpty) {
      return url;
    }
    String separator = url.contains('?') ? '&' : '?';
    String parameterString = parameters.where((p) => p.isNotEmpty).join('&');
    String str = '$url$separator$parameterString';
    return str;
  }
}
