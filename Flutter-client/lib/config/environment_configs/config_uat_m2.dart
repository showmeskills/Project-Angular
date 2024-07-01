import '../config.dart';
import '../environment.dart';

extension UatM2 on Config {
  static final Config config = Config(
    environment: Environment.uat,
    apiUrl: "https://uat2-newplatform.mxsyl.com/",
    signalrUrl: "https://uat2-newplatform.mxsyl.com/ws",
    imIosAppid: 'fSpvHPWxOTnf',
    imAndriodAppid: 'gzgMtYFavzaU',
    imIosAppSecret: '7e431cde506ae27b87cff54ce7a7e233',
    imAndriodAppSecret: '44b1a1c9b9e0a619c21db59df063cb47',
    resourceDomain: "https://static.kodaiyun.com/",
  );

  static const String _configDomain = 'https://uat2-newplatform.mxsyl.com/';

  static List<String> configUrlList = [
    "${_configDomain}configs3/app-${Config.tenantId}.json",
    "${_configDomain}configs2/app-${Config.tenantId}.json",
    "${_configDomain}configs/app-${Config.tenantId}.json",
  ];

  static List<String> languageUrlList = Sit.languageUrlList;
}
