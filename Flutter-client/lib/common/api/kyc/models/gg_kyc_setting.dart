import 'dart:convert';

import 'package:gogaming_app/common/lang/locale_lang.dart';

import 'gg_kyc_power_limit.dart';
import 'gg_kyc_status.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GGKycSettings {
  GGKycSettings({
    this.kycLimit,
  });

  factory GGKycSettings.fromJson(Map<String, dynamic> json) {
    final List<GGKycLimit>? kycLimit =
        json['kycLimit'] is List ? <GGKycLimit>[] : null;
    if (kycLimit != null) {
      for (final dynamic item in json['kycLimit']! as List) {
        if (item != null) {
          kycLimit.add(GGKycLimit.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GGKycSettings(
      kycLimit: kycLimit,
    );
  }

  List<GGKycLimit>? kycLimit;

  GGKycLimit? primaryLimit() {
    return kycLimit?.firstWhere(
      (element) => element.kycType == KycVerifyType.primary,
      // orElse: () => null,
    );
  }

  GGKycLimit? intermediateLimit() {
    return kycLimit?.firstWhere(
      (element) => element.kycType == KycVerifyType.intermediate,
      // orElse: () => null,
    );
  }

  GGKycLimit? advanceLimit() {
    return kycLimit?.firstWhere(
      (element) => element.kycType == KycVerifyType.advanced,
      // orElse: () => null,
    );
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'kycLimit': kycLimit,
      };
}

class GGKycLimit {
  GGKycLimit({
    this.kycType,
    this.title,
    this.fiatToVirtualLimit,
    this.fiatDepositLimit,
    this.fiatWithdrawLimit,
    this.virtualDepositLimit,
    this.virtualWithdrawLimit,
  });

  /// KYC类型 KycPrimary = 初级、KycIntermediat = 中级、KycAdvanced = 高级
  String? kycType;

  /// 標題
  String? title;

  /// 单日法币购买加密货币限额
  String? fiatToVirtualLimit;

  /// 单日法币充值限额
  String? fiatDepositLimit;

  /// 单日法币提现限额
  String? fiatWithdrawLimit;

  /// 单日数字货币充值限额
  String? virtualDepositLimit;

  /// 单日数字货币提现限额
  String? virtualWithdrawLimit;

  bool isUnLimit(String text) => (text == '-1' || text == '999999999');

  /// 法币信息
  KycPowerAndLimits fiatLimit(String title) {
    // 等于0时隐藏相应项目
    return KycPowerAndLimits(
      title: title,
      info: [
        if (fiatToVirtualLimit != null || fiatToVirtualLimit == "--")
          KycPowerDesc(name: localized('buy_crypto'), desc: [
            localized(
                'no_limit') /*'${isUnLimit(fiatToVirtualLimit) ? localized('kyc.unlimited') : "$fiatToVirtualLimit USDT/${localized('kyc.day')}"}'*/
          ]),
        if (fiatDepositLimit != null || fiatDepositLimit == "--")
          KycPowerDesc(name: localized('deposit'), desc: [
            (isUnLimit(fiatDepositLimit!)
                ? localized('no_limit')
                : "$fiatDepositLimit USDT/${localized('day00')}")
          ]),
        if (fiatWithdrawLimit != null || fiatWithdrawLimit == "--")
          KycPowerDesc(name: localized('withdrawl'), desc: [
            (isUnLimit(fiatWithdrawLimit!)
                ? localized('no_limit')
                : "$fiatWithdrawLimit USDT/${localized('day00')}")
          ]),
      ],
    );
  }

  /// 数字货币信息
  KycPowerAndLimits virtualLimit(String title) {
    // 等于0时隐藏相应项目
    return KycPowerAndLimits(
      title: title,
      info: [
        if (virtualDepositLimit != null || virtualDepositLimit == "--")
          KycPowerDesc(name: localized('deposit'), desc: [
            (isUnLimit(virtualDepositLimit!)
                ? localized('no_limit')
                : "$virtualDepositLimit USDT/${localized('day00')}")
          ]),
        if (virtualWithdrawLimit != null || virtualWithdrawLimit == "--")
          KycPowerDesc(name: localized('withdrawl'), desc: [
            (isUnLimit(virtualWithdrawLimit!)
                ? localized('no_limit')
                : "$virtualWithdrawLimit USDT/${localized('day00')}")
          ]),
      ],
    );
  }

  factory GGKycLimit.fromJson(Map<String, dynamic> json) {
    return GGKycLimit(
      kycType: asT<String?>(json["kycType"]),
      title: asT<String?>(json["title"]),
      fiatToVirtualLimit: asT<String?>(json["fiatToVirtualLimit"]),
      fiatDepositLimit: asT<String?>(json["fiatDepositLimit"]),
      fiatWithdrawLimit: asT<String?>(json["fiatWithdrawLimit"]),
      virtualDepositLimit: asT<String?>(json["virtualDepositLimit"]),
      virtualWithdrawLimit: asT<String?>(json["virtualWithdrawLimit"]),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "kycType": kycType,
      "title": title,
      "fiatToVirtualLimit": fiatToVirtualLimit,
      "fiatDepositLimit": fiatDepositLimit,
      "fiatWithdrawLimit": fiatWithdrawLimit,
      "virtualDepositLimit": virtualDepositLimit,
      "virtualWithdrawLimit": virtualWithdrawLimit,
    };
  }
}
