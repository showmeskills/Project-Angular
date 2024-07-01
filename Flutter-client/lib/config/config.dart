import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/helper/sentry_util.dart';

import 'game_config.dart';

class Config {
  static const String version = '1.0.0';

  /// 商户ID
  static const String tenantId = "1";

  /// 是否商户1
  static final bool isM1 = "true".toLowerCase() == 'true';

  /// 多语言对应商户类别
  static const String languageType = 'App';
  static const String versionName = "#{Build.BuildNumber}#";
  // static const String versionName = "20231114.1";

  static String sentryDsn =
      'https://28012dbc8729b090190555b9704a7b81@sentry.athena25.com/5';

  static const String iovationKey =
      'mM0sp8Erj2GlCHJLX6SgFKsKcD68gIN_z1-m9vV_lm0';

  /// 对应 pubspec.yaml 中的 version
  static const String deviceVersion = '3.20240527.1+320240527';

  Environment environment;
  final GameConfig gameConfig;

  Config({
    required this.environment,
    required this.apiUrl,
    required this.signalrUrl,
    required this.imIosAppid,
    required this.imAndriodAppid,
    required this.imIosAppSecret,
    required this.imAndriodAppSecret,
    required this.resourceDomain,
  }) : gameConfig = GameConfig(environment);

  String apiUrl;
  String signalrUrl;

  /// im长链接地址
  String get imUrl => "${apiUrl.replaceAll('https', 'wss')}im/ws";
  String imIosAppid;
  String imAndriodAppid;
  String imIosAppSecret;
  String imAndriodAppSecret;

  ///资源目录主域名
  String resourceDomain;

  static final Config _currentConfig = Pro.config;

  static Config get currentConfig => _currentConfig;

  String get ver => version;

  static Config get sharedInstance => _getInstance();
  static Config? _instance;

  // 是否已经设置过 apiUrl
  bool hasSetApiUrl = false;
  // 是否已经设置过 signalrUrl
  bool hasSetSignalrUrl = false;

  // 获取对象
  static Config _getInstance() {
    _instance ??= _currentConfig;
    return _instance!;
  }

  void updateApiUrl(String apiUrl, {bool isSetDomain = false}) {
    if (apiUrl.isEmpty || hasSetApiUrl) {
      return;
    } else {
      this.apiUrl = apiUrl;
      if (isSetDomain) {
        hasSetApiUrl = true;
      }
      SentryUtil.initUser();
    }
  }

  void updateResourceDoamin(String domain) {
    resourceDomain = domain;
  }

  void updateSignalrUrl(String signalrUrl, {bool isSetDomain = false}) {
    if (signalrUrl.isEmpty || hasSetSignalrUrl) {
      return;
    } else {
      this.signalrUrl = signalrUrl;
      if (isSetDomain) {
        hasSetSignalrUrl = true;
      }
    }
  }
}
