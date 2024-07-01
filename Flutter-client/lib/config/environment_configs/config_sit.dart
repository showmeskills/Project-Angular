import '../config.dart';
import '../environment.dart';

extension Sit on Config {
  static final Config config = Config(
    environment: Environment.sit,
    apiUrl: "https://sit-newplatform.mxsyl.com/",
    signalrUrl: "https://sit-newplatform.mxsyl.com/ws",
    imIosAppid: 'SAPZWL02OZF9',
    imAndriodAppid: 'XPW0OM0PHUK8',
    imIosAppSecret: '4510a9b20f3749b2bd104f46a7dcf39d',
    imAndriodAppSecret: '2f32565679034f96a4f51565748f0170',
    resourceDomain: "https://d16j89jl5zb4v5.cloudfront.net/",
  );

  static const String _configDomain = 'https://sit-newplatform.mxsyl.com/';

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
