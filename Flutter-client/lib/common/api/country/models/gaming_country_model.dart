import 'dart:convert';

class GamingCountryModel {
  String code;
  String name;
  String areaCode;
  String iso;
  bool hasSms;
  String iconName;

  String get icon {
    return 'assets/images/country/$iconName.png';
  }

  GamingCountryModel({
    required this.code,
    required this.name,
    required this.areaCode,
    required this.iso,
    this.hasSms = true,
  }) : iconName = code
            .replaceAll(RegExp(r'&'), '_and_')
            .replaceAll(RegExp(r'\s'), '_')
            .replaceAll(RegExp(r'\,|\.'), '');

  @override
  String toString() {
    return 'CountryModel(code: $code, name: $name, areaCode: $areaCode, iso: $iso, hasSms: $hasSms)';
  }

  bool get isChina => iso == "CN";

  /// 泰国
  bool get isTha => iso == "TH";

  /// 越南
  bool get isVnm => iso == "VN";
  bool get isTW => iso == "TW";
  bool get isHK => iso == "HK";

  /// 澳门
  bool get isMO => iso == "MO";

  /// 马来
  bool get isMY => iso == "MY";

  factory GamingCountryModel.defaultCountry() {
    final Map<String, dynamic> map = {
      "code": "China",
      "name": "China",
      "areaCode": "+86",
      "iso": "CN",
      "hasSms": true
    };
    return GamingCountryModel.fromMap(map);
  }

  factory GamingCountryModel.fromMap(Map<String, Object?> data) =>
      GamingCountryModel(
        code: data['code'] as String,
        name: data['name'] as String,
        areaCode: data['areaCode'] as String,
        iso: data['iso'] as String,
        hasSms: data['hasSms'] as bool? ?? false,
      );

  Map<String, Object?> toMap() => {
        'code': code,
        'name': name,
        'areaCode': areaCode,
        'iso': iso,
        'hasSms': hasSms,
      };

  /// `dart:convert`
  ///
  /// Parses the string and returns the resulting Json object as [GamingCountryModel].
  factory GamingCountryModel.fromJson(String data) {
    return GamingCountryModel.fromMap(
        json.decode(data) as Map<String, Object?>);
  }

  /// `dart:convert`
  ///
  /// Converts [GamingCountryModel] to a JSON string.
  String toJson() => json.encode(toMap());

  GamingCountryModel copyWith({
    String? code,
    String? name,
    String? areaCode,
    String? iso,
    bool? hasSms,
  }) {
    return GamingCountryModel(
      code: code ?? this.code,
      name: name ?? this.name,
      areaCode: areaCode ?? this.areaCode,
      iso: iso ?? this.iso,
      hasSms: hasSms ?? this.hasSms,
    );
  }
}
