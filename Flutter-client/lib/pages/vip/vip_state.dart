part of 'vip_logic.dart';

class VipState {
  final _isLogin = AccountService.sharedInstance.isLogin.obs;
  bool get isLogin => _isLogin.value;

  final VipService _vipService = VipService.sharedInstance;

  GamingUserVipModel? get vipInfo => _vipService.vipInfo;
  int get level => _vipService.vipLevel;
  bool get isSVip => _vipService.isSVip;

  GamingVipBenefitsModel? get _benefitsModel => _vipService.benefitsModel;
  late final _benefits = _benefitsModel.obs;
  GamingVipBenefitsModel? get benefits => _benefits.value;

  // 避免切换时rebuild
  int get initIndex => isSVip ? 9 : max(level - 1, 0);

  late final _currentIndex = initIndex.obs;
  int get correspondingLevel => _currentIndex.value + 1;

  GamingVipBenefitAmount get birthdayBenefit {
    return benefits!.birthdayBenefitLevel(correspondingLevel)!;
  }

  GamingVipBenefitAmount get promotionBenefit {
    return benefits!.promotionBenefitLevel(correspondingLevel)!;
  }

  GamingVipBenefitAmount get keepBenefit {
    return benefits!.keepBenefitLevel(correspondingLevel)!;
  }

  GamingVipDepositBenefit get depositBenefit {
    return benefits!.depositBenefitLevel(correspondingLevel)!;
  }

  GamingVipRescueMoney get rescueMoney {
    return benefits!.rescueMoneyLevel(correspondingLevel)!;
  }

  GamingVipBenefitAmount get loginRedPackage {
    return benefits!.loginRedPackageLevel(correspondingLevel)!;
  }

  GamingVipReturnBonus get returnBouns {
    return benefits!.returnBonusLevel(correspondingLevel)!;
  }
}
