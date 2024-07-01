import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingPreferenceModel {
  GamingPreferenceModel(
      {this.oddsFormat,
      this.viewFormat,
      this.isEnableCredit = true,
      this.defaultCurrencyType,
      this.invisibilityMode});

  factory GamingPreferenceModel.fromJson(Map<String, dynamic> json) =>
      GamingPreferenceModel(
        oddsFormat: asT<String?>(json['oddsFormat']),
        viewFormat: asT<String?>(json['viewFormat']),
        isEnableCredit: asT<bool?>(json['isEnableCredit']) ?? true,
        defaultCurrencyType: asT<String?>(json['defaultCurrencyType']),
        invisibilityMode: asT<String?>(json['invisibilityMode']),
      );

  /// 赔率格式
  String? oddsFormat;
  bool isEnableCredit;
  String? defaultCurrencyType;

  /// 隐身模式 ShowUid：显示Uid  ShowUserName：显示用户名  Invisibility：完全隐身
  String? invisibilityMode;

  /// 视图格式
  String? viewFormat;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'oddsFormat': oddsFormat,
        'viewFormat': viewFormat,
        'isEnableCredit': isEnableCredit,
        'defaultCurrencyType': defaultCurrencyType,
        'invisibilityMode': invisibilityMode
      };
}
