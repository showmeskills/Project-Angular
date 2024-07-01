import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingNoticeConfig {
  GamingNoticeConfig({
    this.language,
    this.creditSetting,
    this.noticeTypeList,
  });

  factory GamingNoticeConfig.fromJson(Map<String, dynamic> json) {
    final List<String>? noticeTypeList =
        json['noticeTypeList'] is List ? <String>[] : null;
    if (noticeTypeList != null) {
      for (final dynamic item in json['noticeTypeList'] as List) {
        if (item != null) {
          noticeTypeList.add(asT<String>(item)!);
        }
      }
    }
    return GamingNoticeConfig(
      language: asT<String?>(json['language']),
      creditSetting: json['creditSetting'] == null
          ? null
          : CreditSetting.fromJson(
              asT<Map<String, dynamic>>(json['creditSetting'])!),
      noticeTypeList: noticeTypeList,
    );
  }

  /// 通知语言
  String? language;
  CreditSetting? creditSetting;

  /// System, Transaction, Activity, Information
  List<String>? noticeTypeList;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'language': language,
        'creditSetting': creditSetting,
        'noticeTypeList': noticeTypeList,
      };
}

class CreditSetting {
  CreditSetting({
    this.isEnable,
    this.content,
  });

  factory CreditSetting.fromJson(Map<String, dynamic> json) => CreditSetting(
        isEnable: asT<bool?>(json['isEnable']),
        content: asT<String?>(json['content']),
      );

  bool? isEnable;
  String? content;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'isEnable': isEnable,
        'content': content,
      };
}
