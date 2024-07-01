// import 'dart:convert';
//
// import 'package:base_framework/base_controller.dart';
// import 'package:gogaming_app/common/api/kyc/models/gg_kyc_level_model.dart';
// import 'package:gogaming_app/common/service/country_service.dart';
// import 'package:gogaming_app/common/service/kyc_service.dart';
// import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
// import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
//
// import '../../common/api/kyc/models/gg_kyc_process_detail_foreu.dart';
// import '../../common/api/kyc/models/gg_kyc_user_verification_foreu.dart';

part of 'gg_kyc_home_logic.dart';

class GGKycHomeState {
  /// 高级认证之后不可以改国籍了
  bool get canEditCountry => !KycService.sharedInstance.advancePassed;
  late final currentCountry = () {
    final kycInfoModel = KycService.sharedInstance.info.value;
    final countryCode = kycInfoModel?.countryCode;
    var country = (CountryService().country ?? {})[countryCode ?? ''] ??
        CountryService.sharedInstance.currentCountry;
    return country.obs;
  }();
  late final kycInfo = KycService.sharedInstance.info;

  /// 每个kyc等级对应的信息
  var levels = <GGKycLevelModel>[];

  /// 当前选中的kyc等级
  final verificationIndex = 0.obs;
  final rejectOverlay = GamingOverlay();
  final avatarOverlay = GamingOverlay();
  final protectOverlay = GamingOverlay();

  // 是否是亚洲地区
  bool get isAsia {
    return KycService.sharedInstance.isAsia;
  }

  GGKycLevelModel? get currentLevelModel =>
      levels.length > verificationIndex.value
          ? levels[verificationIndex.value]
          : null;

  // 欧洲商户   查询认证EU
  GGKycUserVerificationForEu? verificationForEu;
  late final _verification = verificationForEu.obs;
  GGKycUserVerificationForEu? get ggKycUserVerificationForEu =>
      _verification.value;

  // 欧洲商户   KYC审核详情EU
  GGKycProcessDetailForEu? processDetailForEu;
  late final _processDetail = processDetailForEu.obs;
  GGKycProcessDetailForEu? get ggKycProcessDetailForEu => _processDetail.value;

  // 欧洲商户 需要的补充文件
  GGKycDocumentModel? documentModel;
  late final _documentModel = documentModel.obs;
  GGKycDocumentModel? get ggKycDocumentModel => _documentModel.value;
}
