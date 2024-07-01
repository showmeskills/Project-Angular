part of 'user_info_logic.dart';

class DashboardUserInfoState {
  late final _isLogin = AccountService.sharedInstance.isLogin.obs;
  bool get isLogin => _isLogin.value;

  late final RxnString _uid =
      RxnString(AccountService.sharedInstance.gamingUser?.uid);
  String? get uid => _uid.value;

  late final RxnString _userName =
      RxnString(AccountService.sharedInstance.gamingUser?.userName);
  String? get userName => _userName.value;

  late final RxnInt _lastLoginTime =
      RxnInt(AccountService.sharedInstance.gamingUser?.lastLoginTime);
  String? get lastLoginDate => _lastLoginTime.value == null
      ? null
      : DateFormat('yyyy-MM-dd HH:mm:ss')
          .formatTimestamp(_lastLoginTime.value! * 1000);

  late final RxnString _lastLoginIp =
      RxnString(AccountService.sharedInstance.gamingUser?.lastLoginIp);
  String? get lastLoginIp => _lastLoginIp.value;

  late final RxBool _isBindMobile =
      (AccountService.sharedInstance.gamingUser?.isBindMobile ?? false).obs;
  bool get isBindMobile => _isBindMobile.value;

  late final RxBool _isBindGoogleValid =
      (AccountService.sharedInstance.gamingUser?.isBindGoogleValid ?? false)
          .obs;
  bool get isBindGoogleValid => _isBindGoogleValid.value;

  late final RxBool _hasWhiteList =
      (AccountService.sharedInstance.gamingUser?.hasWhiteList ?? false).obs;
  bool get hasWhiteList => _hasWhiteList.value;

  bool get isPrimaryPassed => KycService.sharedInstance.primaryPassed;
  bool get isIntermediatePassed => KycService.sharedInstance.intermediatePassed;
  bool get isAdvancePassed => KycService.sharedInstance.advancePassed;

  bool get isCertified =>
      isPrimaryPassed || isIntermediatePassed || isAdvancePassed;

  String get kycTypeText {
    if (isAdvancePassed) {
      return localized('ad_ceri');
    } else if (isIntermediatePassed) {
      return localized('inter_ceri');
    } else if (isPrimaryPassed) {
      return localized('pri_ceri');
    } else {
      return localized('verification');
    }
  }

  GGKycUserVerificationForEu? get kycVerificationForEu =>
      KycService.sharedInstance.userVerificationForEu;

  bool get kycPoaVerified => kycVerificationForEu?.poaVerificationStatus == 'S';

  bool get kycIDVerified => kycVerificationForEu?.idVerificationStatus == 'S';
}
