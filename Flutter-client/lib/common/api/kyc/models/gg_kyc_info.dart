import 'dart:convert';
import 'dart:ui';

// import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/generated/r.dart';

import 'gg_kyc_level_model.dart';
import 'gg_kyc_setting.dart';
import 'gg_kyc_status.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GGKycInfo {
  GGKycInfo({
    this.type,
    // this.value,
    this.countryCode,
    this.status,
    this.remark,
    this.createTime,
    this.modifyTime,
  });

  /// 过滤掉未通过的信息，找到api返回的验证登记最高的信息
  ///
  /// 如果没有有效数据，则取最后一个
  factory GGKycInfo.fromResponse(List<dynamic> response) {
    final resp = response
        .map((e) => GGKycInfo.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    List<GGKycInfo> list = List<GGKycInfo>.from(resp);
    if (list.isEmpty) {
      list = resp;
    }
    list.sort((a, b) => a.sort.compareTo(b.sort));

    final result = list.last;
    return result;
  }

  factory GGKycInfo.fromJson(Map<String, dynamic> json) => GGKycInfo(
        type: asT<String?>(json['type']),
        // value: asT<String?>(json['value']),
        countryCode: asT<String?>(json['countryCode']),
        status: asT<String?>(json['status']),
        remark: asT<String?>(json['remark']),
        createTime: asT<int?>(json['createTime']),
        modifyTime: asT<String?>(json['modifyTime']),
      );

  /// KycPrimary, KycIntermediat, KycAdvanced
  String? type;

  /// KYC认证姓名，中国 => 姓名，泰/越 => FirstName MiddleName LastName
  // String? value;

  /// 认证国家代码
  String? countryCode;

  /// 验证状态 I = Initial P = Pending S = Passed R = Reject
  String? status;

  /// 备注
  String? remark;

  /// 建立时间
  int? createTime;

  /// 修改时间
  String? modifyTime;

  int get sort {
    const map = {
      'KycAdvanced': 3,
      'KycIntermediat': 2,
      'KycPrimary': 1,
    };
    return map[type ?? ''] ?? 0;
  }

  GGKycSettings? setting;

  List<GGKycLevelModel> levelListAsia({String? countryCode}) {
    return [
      firstLevel(),
      secondLevelAsia(countryCode: countryCode),
      thirdLevelAsia(),
    ];
  }

  List<GGKycLevelModel> levelListEurope({String? countryCode}) {
    return [
      firstLevel(),
      secondLevelEurope(countryCode: countryCode),
      thirdLevelEurope(),
    ];
  }

  GGKycLevelModel? getCurrentLevelAsia() {
    final levels = levelListAsia();
    if (advancePassed()) {
      return levels[2];
    } else if (intermediatePassed()) {
      return levels[1];
    } else if (primaryPassed()) {
      return levels[0];
    } else {
      return null;
    }
  }

  GGKycLevelModel? getCurrentLevelEurope() {
    final levels = levelListEurope();
    if (advancePassed()) {
      return levels[2];
    } else if (intermediatePassed()) {
      return levels[1];
    } else if (primaryPassed()) {
      return levels[0];
    } else {
      return null;
    }
  }

  // 亚洲
  GGKycLevelModel thirdLevelAsia() {
    final GGKycLimit limit = setting!.advanceLimit()!;
    GGKycLevelModel model = GGKycLevelModel(
      advanceStatus(),
      [
        KycIconTitle(
          title: 'inter_require',
          iconPath: R.kycKycMiddleLimitIcon1,
        ),
        KycIconTitle(
          title: 'prof_ad',
          iconPath: R.kycKycAdvanceLimitIcon2,
        ),
      ],
      [
        limit.fiatLimit('cur_limit'),
        limit.virtualLimit('crypto_limits'),
      ],
      KycLevelBanner('ad_ceri', limit.title ?? 'max_fiat_amount',
          'assets/kyc/kyc_second_banner.svg', const Size(74, 46)),
      'review_t_ten',
      verificationCreateTime: createTime,
    );
    model.isPreLevelPass = intermediatePassed();
    return model;
  }

  GGKycLevelModel thirdLevelEurope() {
    final GGKycLimit limit = setting!.advanceLimit()!;
    GGKycLevelModel model = GGKycLevelModel(
      advanceStatus(),
      [
        KycIconTitle(
          title: 'proof_of_wealth',
          iconPath: R.kycKycMiddleLimitIcon1,
        ),
      ],
      [
        limit.fiatLimit('cur_limit'),
        limit.virtualLimit('crypto_limits'),
      ],
      KycLevelBanner('ad_ceri', limit.title ?? 'max_fiat_amount',
          'assets/kyc/kyc_second_banner.svg', const Size(74, 46)),
      'review_t_ten',
      verificationCreateTime: createTime,
    );
    model.isPreLevelPass = intermediatePassed();
    return model;
  }

  GGKycLevelModel secondLevelAsia({String? countryCode}) {
    var code = countryCode ?? this.countryCode;
    final limit = setting!.intermediateLimit()!;
    code ??= 'CHN';
    final isChina = code == 'CHN';
    // final hasLimit = code != 'CHN' && code != 'VNM' && code != 'THA';
    GGKycLevelModel model = GGKycLevelModel(
      intermediateStatus(),
      [
        KycIconTitle(
          title: 'basic_ver_req',
          iconPath: R.kycKycMiddleLimitIcon1,
        ),
        KycIconTitle(
          title: 'gov_id',
          iconPath: R.kycKycMiddleLimitIcon2,
        ),
        if (isChina) ...[
          KycIconTitle(
            title: 'bank_card',
            iconPath: R.kycKycMiddleLimitIcon4,
          ),
          KycIconTitle(
            title: 'phone_text',
            iconPath: R.kycKycMiddleLimitIcon5,
          )
        ],
      ],
      [
        limit.fiatLimit('cur_limit'),
        limit.virtualLimit('crypto_limits'),
      ],
      KycLevelBanner('inter_ceri', limit.title ?? 'most_choose',
          'assets/kyc/kyc_second_banner.svg', const Size(74, 46)),
      'review_t_ten',
      verificationCreateTime: createTime,
    );
    model.isPreLevelPass = primaryPassed();
    return model;
  }

  GGKycLevelModel secondLevelEurope({String? countryCode}) {
    var code = countryCode ?? this.countryCode;
    final limit = setting!.intermediateLimit()!;
    code ??= 'CHN';
    final isChina = code == 'CHN';
    // final hasLimit = code != 'CHN' && code != 'VNM' && code != 'THA';
    GGKycLevelModel model = GGKycLevelModel(
      intermediateStatus(),
      [
        KycIconTitle(
          title: 'basic_ver_req',
          iconPath: R.kycKycMiddleLimitIcon1,
        ),
        KycIconTitle(
          title: 'gov_id',
          iconPath: R.kycKycMiddleLimitIcon2,
        ),
        KycIconTitle(
          title: 'add_ver',
          iconPath: R.kycKycAdvanceLimitIcon2,
        ),
        if (isChina) ...[
          KycIconTitle(
            title: 'bank_card',
            iconPath: R.kycKycMiddleLimitIcon4,
          ),
          KycIconTitle(
            title: 'phone_text',
            iconPath: R.kycKycMiddleLimitIcon5,
          )
        ],
      ],
      [
        limit.fiatLimit('cur_limit'),
        limit.virtualLimit('crypto_limits'),
      ],
      KycLevelBanner('inter_ceri', limit.title ?? 'most_choose',
          'assets/kyc/kyc_second_banner.svg', const Size(74, 46)),
      'review_t_ten',
      verificationCreateTime: createTime,
    );
    model.isPreLevelPass = primaryPassed();
    return model;
  }

  GGKycLevelModel firstLevel() {
    final limit = setting!.primaryLimit()!;
    return GGKycLevelModel(
      primaryStatus(),
      [
        KycIconTitle(
          title: 'personal_info',
          iconPath: R.kycKycEdit,
        ),
      ],
      [
        limit.fiatLimit('cur_limit'),
        limit.virtualLimit('crypto_limits'),
      ],
      KycLevelBanner('basic_ver', limit.title ?? 'simple_fast',
          'assets/kyc/kyc_verify.svg', const Size(48, 60)),
      'review_time_one',
    );
  }

  bool primaryPassed() {
    return primaryStatus() == KycVerifyStatus.passed;
  }

  bool intermediatePassed() {
    return intermediateStatus() == KycVerifyStatus.passed;
  }

  bool advancePassed() {
    return advanceStatus() == KycVerifyStatus.passed;
  }

  // 根据info信息获取当前primary status
  String primaryStatus() {
    if (type == KycVerifyType.primary) return status ?? KycVerifyStatus.initial;
    return KycVerifyStatus.passed;
  }

  // 根据info信息获取当前intermediate status
  String intermediateStatus() {
    if (type == KycVerifyType.intermediate) {
      return status ?? KycVerifyStatus.initial;
    } else if (type == KycVerifyType.primary) {
      return KycVerifyStatus.initial;
    }

    return KycVerifyStatus.passed;
  }

  // 根据info信息获取当前advance status
  String advanceStatus() {
    if (type == KycVerifyType.advanced) {
      return status ?? KycVerifyStatus.initial;
    }
    return KycVerifyStatus.initial;
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'type': type,
        'value': value,
        'countryCode': countryCode,
        'status': status,
        'remark': remark,
        'createTime': createTime,
        'modifyTime': modifyTime,
        'setting': setting.toString(),
      };
}

extension GGKycInfoExt on GGKycInfo {
  /// KYC认证姓名，中国 => 姓名，泰/越 => FirstName MiddleName LastName
  String? get value => AccountService().kycName;
}
