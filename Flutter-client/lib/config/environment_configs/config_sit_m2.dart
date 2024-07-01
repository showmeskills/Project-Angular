import '../config.dart';
import '../environment.dart';

extension SitM2 on Config {
  static final Config config = Config(
    environment: Environment.sit,
    apiUrl: "https://sit2-newplatform.mxsyl.com/",
    signalrUrl: "https://sit2-newplatform.mxsyl.com/ws",
    imIosAppid: 'ETK89VUDHOAN',
    imAndriodAppid: '9PFW5HI20VL0',
    imIosAppSecret: '4444134f5d2e6e1dec911a0788876431',
    imAndriodAppSecret: '9b03023aad3c575d49f910c444d39dbe',
    resourceDomain: "https://d16j89jl5zb4v5.cloudfront.net/",
  );

  static const String _configDomain = 'https://sit2-newplatform.mxsyl.com/';

  static List<String> configUrlList = [
    "${_configDomain}configs3/app-${Config.tenantId}.json",
    "${_configDomain}configs2/app-${Config.tenantId}.json",
    "${_configDomain}configs/app-${Config.tenantId}.json",
  ];

  static List<String> languageUrlList = [
    '${_configDomain}configs3/LanguageTranslate/${Config.languageType}/',
    '${_configDomain}configs2/LanguageTranslate/${Config.languageType}/',
    '${_configDomain}configs/LanguageTranslate/${Config.languageType}/',
  ];
}
