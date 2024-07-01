// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

class IMAsset {
  /// 文件id
  String? fId;

  /// 文件名字
  String? name;

  /// 视频时长单位秒
  num? duration;
  num? height;
  num? width;

  /// 文件大小
  num? size;

  /// 文件类型 例如jpg
  final String type;

  /// 文件的资源链接
  final String? url;

  /// 视频资源的封面id
  String? cover;

  /// 视频资源的封面url
  String? coverUrl;

  String get typeLowerCase => type.toLowerCase();

  bool get isImage =>
      typeLowerCase == 'jpg' ||
      typeLowerCase == 'jpeg' ||
      typeLowerCase == 'png' ||
      typeLowerCase == 'gif' ||
      typeLowerCase == 'webp' ||
      typeLowerCase == 'bmp';

  bool get isVideo => typeLowerCase == 'mp4' || typeLowerCase == 'mov';

  bool get isPDF => typeLowerCase == 'pdf';

  IMAsset({
    this.fId,
    this.name,
    required this.type,
    this.size,
    this.duration,
    this.url,
    this.width,
    this.height,
    this.cover,
    this.coverUrl,
  });

  //生成json
  factory IMAsset.fromJson(Map<String, dynamic> json) {
    return IMAsset(
      fId: GGUtil.parseStr(json['fId']),
      type: GGUtil.parseStr(json['type']),
      size: GGUtil.parseInt(json['size']),
      width: GGUtil.parseDouble(json['width']),
      height: GGUtil.parseDouble(json['height']),
      url: GGUtil.parseStr(json['url']),
      cover: GGUtil.parseStr(json['cover']),
      coverUrl: GGUtil.parseStr(json['coverUrl']),
      name: GGUtil.parseStr(json['name']),
      duration: GGUtil.parseDouble(json['duration']),
    );
  }

  IMAsset copy() {
    return IMAsset.fromJson(toJson());
  }

  Map<String, dynamic> toJson() => {
        'fId': fId,
        'height': height,
        'size': size,
        'type': type,
        'width': width,
        'url': url,
        'cover': cover,
        'name': name,
        'duration': duration,
        'coverUrl': coverUrl,
      };

  @override
  String toString() {
    // 将Map转换为JSON字符串
    String jsonString = json.encode(toJson());
    return jsonString;
  }

  String? get fileName => '$name';

  static String? toListJson(List<IMAsset>? assets) {
    final list = assets?.map((e) => e.toJson()).toList();
    if (list == null) return null;

    String jsonString = json.encode(list);
    return jsonString;
  }

  IMAsset copyWith({
    String? fId,
    String? name,
    num? duration,
    num? height,
    num? width,
    num? size,
    String? type,
    String? url,
    String? cover,
    String? coverUrl,
  }) {
    return IMAsset(
      fId: fId ?? this.fId,
      name: name ?? this.name,
      duration: duration ?? this.duration,
      height: height ?? this.height,
      width: width ?? this.width,
      size: size ?? this.size,
      type: type ?? this.type,
      url: url ?? this.url,
      cover: cover ?? this.cover,
      coverUrl: coverUrl ?? this.coverUrl,
    );
  }
}
