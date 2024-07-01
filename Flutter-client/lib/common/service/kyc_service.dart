import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/kyc/kyc.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_info.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_member_info.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_setting.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_status_model.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/country_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/models/kyc/go_gaming_kyc_model.dart';
import 'package:gogaming_app/pages/advanced_certification/common/advanced_certification_util.dart';
import 'package:iovation_flutter/iovation_flutter.dart';

import '../../pages/gg_kyc_home/gg_kyc_home_logic.dart';
import '../api/kyc/models/gg_kyc_basic_info.dart';
import '../api/kyc/models/gg_kyc_document_model.dart';
import '../api/kyc/models/gg_kyc_process_detail_foreu.dart';
import '../api/kyc/models/gg_kyc_user_verification_foreu.dart';
import 'account_service.dart';
import 'kyc_service_mixin/kyc_dialog_mixin.dart';
import 'kyc_service_mixin/kyc_tips_mixin.dart';
import 'merchant_service/merchant_service.dart';

class KycService with KycTipsMixin, KycDialogMixin {
  factory KycService() => _getInstance();

  static KycService get sharedInstance => _getInstance();

  static KycService? _instance;

  static KycService _getInstance() {
    _instance ??= KycService._internal();
    return _instance!;
  }

  KycService._internal() {
    GamingEvent.onIdVerification.subscribe(() {
      showIdVerificationDialog();
    });
    GamingEvent.onRequestKycIntermediate.subscribe(() {
      refreshKycTips(dialogPrompt: true);
    });
    GamingEvent.onRequestKycAdvanced.subscribe(() {
      refreshKycTips(dialogPrompt: true);
    });
    GamingEvent.onEdd.subscribe(() {
      AdvancedCertificationUtil.showCertificationDialog();
    });
  }

  GGKycInfo? _infoModel;
  GGKycSettings? _settingModel;
  GGKycUserVerificationForEu? _userVerificationForEuModel;
  GamingKycBasicInfo? _basicInfoModel;

  /// 可观察kyc状态刷新
  late final info = _infoModel.obs;
  String? get kycLevel => AccountService().kycLevel;

  late final _userVerificationForEu = _userVerificationForEuModel.obs;
  GGKycUserVerificationForEu? get userVerificationForEu =>
      _userVerificationForEu.value;

  late final _kycBasicInfo = _basicInfoModel.obs;
  GamingKycBasicInfo? get kycBasicInfo => _kycBasicInfo.value;

  Stream<bool> updateKycData() {
    return requestKycInfo().flatMap((event) {
      if (event.success && event.data != null) {
        _infoModel = event.data;
        info(_infoModel);
      }
      return getKycSettings();
    }).flatMap((response) {
      final success = response.success;
      if (response.success && response.data != null) {
        _settingModel = response.data;
        _infoModel?.setting = _settingModel;
        info(_infoModel);
      }
      return Stream.value(success == true);
    });

    // eventCenter.emit(kycStatusUpdated);
  }

  Stream<GoGamingResponse<GGKycSettings?>> getKycSettings() {
    return PGSpi(Kyc.getKycSettings.toTarget())
        .rxRequest<GGKycSettings?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return GGKycSettings.fromJson(data);
      } else {
        return null;
      }
    });
  }

  Stream<GoGamingResponse<GGKycInfo?>> requestKycInfo() {
    return PGSpi(Kyc.requestKyc.toTarget()).rxRequest<GGKycInfo?>((value) {
      final data = value['data'];
      if (data is List) {
        return GGKycInfo.fromResponse(data);
      } else {
        return null;
      }
    });
  }

  // 查询认证EU
  Stream<GGKycUserVerificationForEu?> queryUserVerificationForEU() {
    return (isAsia
            ? Stream.value(null)
            : PGSpi(Kyc.queryUserVerificationForEU.toTarget())
                .rxRequest<GGKycUserVerificationForEu?>((value) {
                final data = value['data'];
                if (data is Map) {
                  return GGKycUserVerificationForEu.fromJson(
                      Map<String, dynamic>.from(data));
                } else {
                  return null;
                }
              }).flatMap(
                (value) {
                  return Stream.value(value.data);
                },
              ))
        .doOnData(
      (event) {
        _userVerificationForEu.value = event;
      },
    );
  }

  // 获取kyc状态
  Stream<List<GamingKycStatusModel>> getKycStatus() {
    return PGSpi(Kyc.kycStatus.toTarget())
        .rxRequest<List<GamingKycStatusModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data.map((e) {
          return GamingKycStatusModel.fromJson(
            Map<String, dynamic>.from(e as Map<String, dynamic>),
          );
        }).toList();
      } else {
        return [];
      }
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  // 获取用户基本信息
  Stream<GamingKycBasicInfo?> queryUserBasicInfo() {
    return PGSpi(Kyc.getMemberBasicInfo.toTarget())
        .rxRequest<GamingKycBasicInfo?>((value) {
      final data = value['data'];
      if (data is Map) {
        return GamingKycBasicInfo.fromJson(Map<String, dynamic>.from(data));
      } else {
        return null;
      }
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      _kycBasicInfo.value = event;
    });
  }

  // 补充文件
  Stream<GoGamingResponse<GGKycDocumentModel?>> getRequestDocument() {
    return PGSpi(Kyc.getRequestDocument.toTarget())
        .rxRequest<GGKycDocumentModel?>((value) {
      final data = value['data'];
      if (data is Map) {
        return GGKycDocumentModel.fromJson(Map<String, dynamic>.from(data));
      } else {
        return null;
      }
    });
  }

  // 获取用户等待完成的认证
  Stream<List<AuthenticateEuFormType>> loadAuthenticateEuForm() {
    return PGSpi(Kyc.queryAuthenticateForEu.toTarget())
        .rxRequest<List<AuthenticateEuFormType>>((value) {
      return (value['data'] as List<dynamic>).map((e) {
        return AuthenticateEuFormType.fromValue(e['type'] as String);
      }).toList();
    }).flatMap((value) {
      return Stream.value(value.data);
      // return Stream.value(<AuthenticateEuFormType>[]);
    });
  }

  // kyc审核详情EU
  Stream<GoGamingResponse<GGKycProcessDetailForEu?>> processDetailForEu(
      int type) {
    Map<String, dynamic> reqParams = {
      'kycType': GGUtil.parseInt(type),
    };
    return PGSpi(Kyc.processDetailForEu.toTarget(inputData: reqParams))
        .rxRequest<GGKycProcessDetailForEu?>((value) {
      final data = value['data'];
      if (data is Map) {
        return GGKycProcessDetailForEu.fromJson(
            Map<String, dynamic>.from(data));
      } else {
        return null;
      }
    });
  }

  Stream<GoGamingResponse<GGKycMemberInfo?>> requestMemberInfo() {
    return PGSpi(Kyc.kycMemberInfo.toTarget())
        .rxRequest<GGKycMemberInfo?>((value) {
      final data = value['data'];
      if (data is Map) {
        return GGKycMemberInfo.fromJson(Map<String, dynamic>.from(data));
      } else {
        return null;
      }
    });
  }

  bool get primaryPassed {
    return kycLevel == KycVerifyType.primary ||
        kycLevel == KycVerifyType.intermediate ||
        kycLevel == KycVerifyType.advanced;
  }

  bool get intermediatePassed {
    return kycLevel == KycVerifyType.intermediate ||
        kycLevel == KycVerifyType.advanced;
  }

  bool get advancePassed {
    return kycLevel == KycVerifyType.advanced;
  }

  Stream<GoGamingResponse<bool>> requestPrimary({
    required String countryCode,
    String? fullName,
    String? firstName,
    String? lastName,
    String? areaCode,
    String? mobile,
    String? email,
    String? address,
    String? city,
    String? zipCode,
    String? otpCode,
    bool? smsVoice,
    String? otpType,
    String? dob,
  }) {
    final data = {
      if (fullName?.isNotEmpty == true) "fullName": fullName,
      if (firstName?.isNotEmpty == true) "firstName": firstName,
      if (lastName?.isNotEmpty == true) "lastName": lastName,
      "countryCode": countryCode,
      if (areaCode?.isNotEmpty == true) "areaCode": areaCode, //手机区号，若已绑定手机，可不带
      if (mobile?.isNotEmpty == true) "mobile": mobile, //手机号码，若已绑定手机，可不带
      if (email?.isNotEmpty == true) "email": email,
      if (address?.isNotEmpty == true) "address": address,
      if (city?.isNotEmpty == true) "city": city,
      if (zipCode?.isNotEmpty == true) "zipCode": zipCode,
      if (otpCode?.isNotEmpty == true) "otpCode": otpCode, //otp码,已绑定手机则不带,
      if (smsVoice != null) "smsVoice": smsVoice, //是否语音验证,已绑定手机则不带,
      if (otpType?.isNotEmpty == true) "otpType": otpType, //类型,
      if (dob?.isNotEmpty == true) "dob": dob, //出生日期,非中国地区需要
    };

    return IovationFlutter.getBlackBox().asStream().flatMap((blackBox) {
      return PGSpi(Kyc.primary.toTarget(inputData: {
        ...data,
        "iovationBlackbox": blackBox,
      })).rxRequest<bool>((value) {
        final data = value['data'];
        return data == true;
      });
    });
  }

  Stream<GoGamingResponse<bool>> requestPrimaryForEU({
    required String countryCode,
    String? fullName,
    String? firstName,
    String? lastName,
    String? areaCode,
    String? mobile,
    String? email,
    String? address,
    String? city,
    String? zipCode,
    String? otpCode,
    bool? smsVoice,
    String? otpType,
    String? dob,
  }) {
    final data = {
      if (fullName?.isNotEmpty == true) "fullName": fullName,
      if (firstName?.isNotEmpty == true) "firstName": firstName,
      if (lastName?.isNotEmpty == true) "lastName": lastName,
      "countryCode": countryCode,
      if (areaCode?.isNotEmpty == true) "areaCode": areaCode, //手机区号，若已绑定手机，可不带
      if (mobile?.isNotEmpty == true) "mobile": mobile, //手机号码，若已绑定手机，可不带
      if (email?.isNotEmpty == true) "email": email,
      if (address?.isNotEmpty == true) "address": address,
      if (city?.isNotEmpty == true) "city": city,
      if (zipCode?.isNotEmpty == true) "zipCode": zipCode,
      if (otpCode?.isNotEmpty == true) "otpCode": otpCode, //otp码,已绑定手机则不带,
      if (smsVoice != null) "smsVoice": smsVoice, //是否语音验证,已绑定手机则不带,
      if (otpType?.isNotEmpty == true) "otpType": otpType, //类型,
      if (dob?.isNotEmpty == true) "dob": dob, //出生日期,非中国地区需要
    };

    return IovationFlutter.getBlackBox().asStream().flatMap((blackBox) {
      return PGSpi(Kyc.primaryForEU.toTarget(inputData: {
        ...data,
        "iovationBlackbox": blackBox,
      })).rxRequest<bool>((value) {
        final data = value['data'];
        return data == true;
      });
    });
  }

  void requestIntermediate(VoidCallback onSuccess, BuildContext context) async {
    // if (info == null || !intermediatePassed()) {
    //   await updateKycData();
    // }
    // if (intermediatePassed()) {
    //   if (onSuccess != null) onSuccess();
    // } else {
    //   onNeedKycLevelAlert(context, 'intermediate');
    // }
  }

  /// basic跳转基础认知 intermediate跳转中级认证

  /// 检查kyc中级认证弹窗
  void checkMiddleDialog(
    VoidCallback onSuccess,
    BuildContext context, {
    VoidCallback? onFail,
  }) {
    if (intermediatePassed) {
      onSuccess();
    } else {
      onFail?.call();
      onNeedKycLevelAlert(context, Routes.kycMiddle.route);
    }
    // else if (_infoModel == null) {
    //   updateKycData().listen((event) {
    //     if (intermediatePassed) {
    //       onSuccess();
    //     } else {
    //       onFail?.call();
    //       onNeedKycLevelAlert(context, Routes.kycMiddle.route);
    //     }
    //   });
    // }
  }

  /// 获取 kyc "亚洲" 国家判断
  bool get isAsia {
    if (MerchantService
            .sharedInstance.merchantConfigModel?.config?.ignoreEuropeKyc ??
        false) {
      return true;
    }
    final asiaCountriesString = MerchantService
            .sharedInstance.merchantConfigModel?.config?.asiaCountries ??
        '';
    final currentCountry = CountryService.sharedInstance.currentCountry;
    dynamic asiaCountries;
    if (asiaCountriesString.isNotEmpty) {
      asiaCountries = jsonDecode(asiaCountriesString);
    }

    final isEurope = AccountService().gamingUser?.isEurope;
    if (primaryPassed == true && isEurope != null) {
      return !isEurope;
    }

    if (AccountService.sharedInstance.isLogin &&
        (AccountService.sharedInstance.gamingUser?.isBindMobile ?? false)) {
      final areaCode = AccountService.sharedInstance.gamingUser?.areaCode;
      final bindCountry = CountryService.sharedInstance.countryList
          .firstWhereOrNull((element) => element.areaCode == areaCode);
      if (bindCountry != null && asiaCountries is List) {
        return asiaCountries.contains(bindCountry.iso);
      }
    }

    if (asiaCountries is List) {
      return asiaCountries.contains(currentCountry.iso);
    }

    return currentCountry.isChina ||
        currentCountry.isHK ||
        currentCountry.isTW ||
        currentCountry.isMO ||
        currentCountry.isVnm ||
        currentCountry.isTha ||
        currentCountry.isMY;
  }

  /// 判断是否是"亚洲地区" iso
  bool isAsiaISO(String iso) {
    /// 兜底数据，防止控制台配置错误
    List<String> asiaCountries = ["CN", "HK", "TW", "MO", "VN", "TH", "MY"];

    final asiaCountriesString = MerchantService
            .sharedInstance.merchantConfigModel?.config?.asiaCountries ??
        '';
    if (asiaCountriesString.isNotEmpty) {
      dynamic countries = jsonDecode(asiaCountriesString);
      if (countries is List<String>) {
        asiaCountries = countries;
      }
    }

    return asiaCountries.contains(iso);
  }

  /// 检查kyc初级认证弹窗
  void checkPrimaryDialog(
    VoidCallback onSuccess,
    BuildContext context, {
    VoidCallback? onFail,
    void Function()? onDismiss,
    String? title,
    // route 跳转参数
    Map<String, dynamic>? arguments,
  }) {
    if (primaryPassed) {
      onSuccess();
    } else {
      onFail?.call();
      onNeedKycLevelAlert(
        context,
        Routes.kycPrimary.route,
        title: title,
        onDismiss: onDismiss,
        arguments: arguments,
      );
    }
    //  else if (_infoModel == null) {
    //   updateKycData().listen((event) {
    //     if (primaryPassed) {
    //       onSuccess();
    //     } else {
    //       onFail?.call();
    //       onNeedKycLevelAlert(
    //         context,
    //         Routes.kycPrimary.route,
    //         title: title,
    //       );
    //     }
    //   });
    // }
  }

  void reInit() {
    _infoModel = null;
    info.value = _infoModel;
    _userVerificationForEuModel = null;
    _userVerificationForEu.value = _userVerificationForEuModel;
    _basicInfoModel = null;
    _kycBasicInfo.value = _basicInfoModel;
    Get.delete<GGKycHomeLogic>(force: true);
    resetTips();
  }
}
