import '../config.dart';
import '../environment.dart';

extension Pro on Config {
  /// 线上动态域名
  static const String _domain = "https://www.llapp.online/";

  static final Config config = Config(
    environment: Environment.product,
    apiUrl: _domain,
    signalrUrl: "${_domain}ws",
    imIosAppid: Config.isM1 ? _imIosAppid : _m2imIosAppid,
    imAndriodAppid: Config.isM1 ? _imAndriodAppid : _m2imAndriodAppid,
    imIosAppSecret: Config.isM1 ? _imIosAppSecret : _m2imIosAppSecret,
    imAndriodAppSecret:
        Config.isM1 ? _imAndriodAppSecret : _m2imAndriodAppSecret,
    resourceDomain: "https://static.kodaiyun.com/",
  );

  static const String _imIosAppid = 'HOPYydFWiNhi';
  static const String _imAndriodAppid = 'PrbTctFkuQgx';
  static const String _imIosAppSecret = 'c5404a5e15185117a4a234604d1eff2a';
  static const String _imAndriodAppSecret = '82fdd89dc9d127722445f62ff6cbf921';

  static const String _m2imIosAppid = 'pHekHBqFOoBn';
  static const String _m2imAndriodAppid = 'JvvVEMXYZcFl';
  static const String _m2imIosAppSecret = 'de1b3316eb19eaa708dbc63a4a6c269f';
  static const String _m2imAndriodAppSecret =
      '05169873d698858524dd859595e99ab1';

  static const String _configDomain = 'https://22all.com/';
  static const String _configDomain2 = 'http://35.201.87.216:8080/';
  static const String _configDomain3 = 'https://config.yaopan.online/';

  static List<String> configUrlList = [
    "${_configDomain3}configs/app-${Config.tenantId}.json",
    "${_configDomain}configs3/app-${Config.tenantId}.json",
    "${_configDomain}configs2/app-${Config.tenantId}.json",
    "${_configDomain}configs/app-${Config.tenantId}.json",
    "${_configDomain2}configs3/app-${Config.tenantId}.json",
    "${_configDomain2}configs2/app-${Config.tenantId}.json",
    "${_configDomain2}configs/app-${Config.tenantId}.json",
  ];

  static List<String> languageUrlList = [
    '${_configDomain}configs3/LanguageTranslate/${Config.languageType}/',
    '${_configDomain}configs2/LanguageTranslate/${Config.languageType}/',
    '${_configDomain}configs/LanguageTranslate/${Config.languageType}/',
    '${_configDomain2}configs3/LanguageTranslate/${Config.languageType}/',
    '${_configDomain2}configs2/LanguageTranslate/${Config.languageType}/',
    '${_configDomain2}configs/LanguageTranslate/${Config.languageType}/',
  ];
}
