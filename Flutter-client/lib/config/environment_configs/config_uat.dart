import '../config.dart';
import '../environment.dart';

extension Uat on Config {
  static final Config config = Config(
    environment: Environment.uat,
    apiUrl: "https://uat-newplatform.mxsyl.com/",
    signalrUrl: "https://uat-newplatform.mxsyl.com/ws",
    imIosAppid: 'KWNmzeDwNolv',
    imAndriodAppid: 'JVFGGSnhTDYc',
    imIosAppSecret: '798957a097b3b71a393f58fd62390d91',
    imAndriodAppSecret: '756ea2ec0110eb8a81a2cd96b7dd531b',
    resourceDomain: "https://static.kodaiyun.com/",
  );

  static const String _configDomain = 'https://uat-newplatform.mxsyl.com/';

  static List<String> configUrlList = [
    "${_configDomain}configs3/app-${Config.tenantId}.json",
    "${_configDomain}configs2/app-${Config.tenantId}.json",
    "${_configDomain}configs/app-${Config.tenantId}.json",
  ];

  static List<String> languageUrlList = Sit.languageUrlList;
}
