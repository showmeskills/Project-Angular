import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';

import 'config.dart';
import 'environment_configs/config_pro.dart';
import 'environment_configs/config_sit.dart';
import 'environment_configs/config_uat.dart';

export 'environment_configs/config_pro.dart';
export 'environment_configs/config_sit.dart';
export 'environment_configs/config_uat.dart';
export 'environment_configs/config_sit_m2.dart';
export 'environment_configs/config_uat_m2.dart';

enum Environment {
  sit,
  uat,
  product;

  String get value {
    switch (this) {
      case Environment.sit:
        return 'sit';
      case Environment.uat:
        return 'uat';
      case Environment.product:
        return 'prod';
    }
  }
}

extension EnvConfig on Environment {
  List<String> languageUrlList({int index = 0}) {
    switch (this) {
      case Environment.uat:
        return Uat.languageUrlList;
      case Environment.sit:
        return Sit.languageUrlList;
      case Environment.product:
        return Pro.languageUrlList;
      default:
        return Sit.languageUrlList;
    }
  }

  String languageUrl({int index = 0}) {
    switch (this) {
      case Environment.uat:
        return Uat.languageUrlList[index];
      case Environment.sit:
        return Sit.languageUrlList[index];
      case Environment.product:
        return Pro.languageUrlList[index];
      default:
        return Sit.languageUrlList[index];
    }
  }

  int get languageUrlNum {
    switch (this) {
      case Environment.uat:
        return Uat.languageUrlList.length;
      case Environment.sit:
        return Sit.languageUrlList.length;
      case Environment.product:
        return Pro.languageUrlList.length;
      default:
        return Sit.languageUrlList.length;
    }
  }

  List<String> merchantConfigUrlList() {
    switch (this) {
      case Environment.uat:
        return Uat.configUrlList;
      case Environment.sit:
        return Sit.configUrlList;
      case Environment.product:
        return Pro.configUrlList;
      default:
        return Sit.configUrlList;
    }
  }

  String merchantConfigUrl({int index = 0}) {
    switch (this) {
      case Environment.uat:
        return Uat.configUrlList[index];
      case Environment.sit:
        return Sit.configUrlList[index];
      case Environment.product:
        return Pro.configUrlList[index];
      default:
        return Sit.configUrlList[index];
    }
  }

  int get configUrlNum {
    switch (this) {
      case Environment.uat:
        return Uat.configUrlList.length;
      case Environment.sit:
        return Sit.configUrlList.length;
      case Environment.product:
        return Pro.configUrlList.length;
      default:
        return Sit.configUrlList.length;
    }
  }

  /// 跳过GeeTest
  bool get skipGeeTest {
    return MerchantService
            .sharedInstance.merchantConfigModel?.config?.ignoreGt ==
        true;
  }

  String get rsaPublicKey {
    switch (this) {
      case Environment.uat:
      case Environment.sit:
        return "-----BEGIN PUBLIC KEY-----\n"
            "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1lcU5lRpSOqdLicIimSso8wSCTDWdtv3BXGeixALS+bcqOMmV2Tm5F5O3sOAku/a+XxeC+yXkaVrCXpgsl0LEPGVnqO5XoVs4LTeo0zwCJQ+H7TN1ZlqkpfFCL7Mn1+dUXvy+N2p5ijlTZiFsfetc+Jr/JH2Zj62nnc/Vpxne0RsKLwh4Mwp6i/BSv2H9xurablJpz3GPb0qoTniCuxzXvCR9h2tFfbCNacrdpOFVW/A8g27g5em+uqjVB5xAhM1pj0b5PlgR6Oyn5c5mmK1waBx/P+NZJRmGrDbHZMq07v3ma9LTOCGGoG90ReYHxVFRSlAzfl5NGF9nrkfZW4skQIDAQAB\n"
            "-----END PUBLIC KEY-----";
      case Environment.product:
        return "-----BEGIN PUBLIC KEY-----\n"
            "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoTgcVORkxBPRQJimRKTUHrSS+vTBzbAm8l6bwaFqr1Mya/pjsHrUPCErJnchMfmfgEBFrsfX5/FLGfXvKFT//F949jgcl3My2oGCOk4dTh+zpp16q8e0qoOG5JtKmQjs2W+s2sAp2Xsk4hMfRY9ZzxsSORjS6YYvgLb0TwbLXZ1GAHhwJSVJS38AUqJH2Z0ng7xzDAklEqLfcP+99PBVau0iqRBEypUsJqcTPXTJMQw0wZg3Frci0SuOhTexmG7NzVhHZIV0cp07czo8lp8+2YvC14iaPwn2xB4dVXNtIILQFXorfNS9U+IO5uL0Y432GeWax1tVXrl6jowihrd1nwIDAQAB\n"
            "-----END PUBLIC KEY-----";
    }
  }

  /// 是否隐藏VIP救援金
  bool get hideVipRescue {
    switch (this) {
      case Environment.sit:
        return Config.tenantId != "21";
      case Environment.uat:
        return true;
      case Environment.product:
        return Config.tenantId != "18";
    }
  }

  /// 是否允许生物识别
  bool get allowBiometrics {
    switch (this) {
      case Environment.sit:
      case Environment.uat:
      case Environment.product:
        return true;
    }
  }

  /// 是否有GPI棋牌
  /// 商户1有GPI棋牌, 其他商户没有
  bool get hasGPIChess {
    return Config.isM1;
  }

  /// 是否使用新的欧洲存款红利流程
  bool get useNewEUDepositBonus {
    return Config.isM1;
  }
}
