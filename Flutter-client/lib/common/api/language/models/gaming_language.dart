class GamingLanguage {
  GamingLanguage({
    this.id,
    this.name,
    this.code,
    this.countryUse,
  });

  String? id;
  String? name;
  String? code;
  String? countryUse;

  String? get languageCode {
    return code?.split('-').first.toLowerCase();
  }

  String? get countryCode {
    switch (languageCode) {
      case 'en':
        return 'US';
      case 'th':
        return 'TH';
      case 'vi':
        return 'VN';
      case 'zh':
        return 'CN';
      case 'ja':
        return 'JP';
      default:
        return null;
    }
  }

  factory GamingLanguage.fromJson(Map<String, dynamic>? map) {
    map ??= {};
    return GamingLanguage(
      id: map['id']?.toString(),
      name: map['name']?.toString(),
      code: map['code']?.toString(),
      countryUse: map['countryUse']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'countryUse': countryUse,
    };
  }

  String get icon {
    for (var element in GamingLanguage.localeConfig) {
      if (element['code'] == code) {
        return element['png'] ?? '';
      }
    }
    return '';
  }

  static List<Map<String, String>> localeConfig = [
    {
      "code": "zh",
      "name": '中文',
      "countryCode": "CN",
      "png": "assets/images/main_menu/countries_cn.png",
    },
    {
      "code": "en",
      "name": 'English',
      "countryCode": "US",
      "png": "assets/images/main_menu/countries_en.png",
    },
    {
      "code": "th",
      "name": 'ประเทศไทย',
      "countryCode": "TH",
      "png": "assets/images/main_menu/countries_th.png",
    },
    {
      "code": "vi",
      "name": 'Việt Nam',
      "countryCode": "Việt Nam",
      "png": "assets/images/main_menu/countries_vi.png",
    },
    {
      "code": "tr",
      "name": 'Türk Dili',
      "countryCode": "TR",
      "png": "assets/images/main_menu/countries_tr.png",
    },
    {
      "code": "pt",
      "name": 'Português',
      "countryCode": "PRT",
      "png": "assets/images/main_menu/countries_prt.png",
    },
    {
      "code": "ja",
      "name": '日本語',
      "countryCode": "JP",
      "png": "assets/images/main_menu/countries_jp.png",
    },
  ];
}
