import 'package:gogaming_app/common/api/vip/models/gaming_user_vip_model.dart';
import 'package:gogaming_app/common/api/vip/models/gaming_vip_benefits_model.dart';
import 'package:gogaming_app/common/api/vip/models/gaming_vip_level_detail_model.dart';
import 'package:gogaming_app/common/api/vip/models/gaming_vip_setting_model.dart';
import 'package:gogaming_app/common/api/vip/models/gaming_vip_template_model.dart';
import 'package:gogaming_app/common/api/vip/vip_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/widget_header.dart';

import '../api/base/base_api.dart';
import 'restart_service.dart';

class VipService extends RestartServiceInterface {
  factory VipService() => _getInstance();

  static VipService get sharedInstance => _getInstance();

  static VipService? _instance;

  static VipService _getInstance() {
    _instance ??= VipService._internal();
    return _instance!;
  }

  VipService._internal();

  GamingUserVipModel? _vipInfoModel;

  late final _vipInfo = _vipInfoModel.obs;
  GamingUserVipModel? get vipInfo => _vipInfo.value;
  int get vipLevel => AccountService().vipLevel;
  String get vipLevelName => getVipName(vipLevel);
  bool get isSVip => AccountService().isSVip;

  GamingVipBenefitsModel? benefitsModel;
  GamingVipTemplateModel? templateModel;
  List<GamingVipLevelDetailModel>? levelDetail;

  Stream<GamingUserVipModel> refresh() {
    return AccountService.sharedInstance
        .updateGamingUserInfo()
        .flatMap((value) {
      return PGSpi(Vip.userVip.toTarget())
          .rxRequest<Map<String, dynamic>>((value) {
        return (value['data'] ?? <String, dynamic>{}) as Map<String, dynamic>;
      }).flatMap((event) {
        return Stream.value(_storeIP(event.data));
      });
    });
  }

  GamingUserVipModel _storeIP(Map<String, dynamic> json) {
    _vipInfoModel = GamingUserVipModel.fromJson(json);
    _vipInfo.value = _vipInfoModel;
    return _vipInfoModel!;
  }

  String getVipCard() {
    if (isSVip) {
      return "assets/images/vip/vip_s_card.png";
    } else {
      return "assets/images/vip/vip_${vipLevel}_card.png";
    }
  }

  String getVipName(int level) {
    return localized('customize_vip$level');
  }

  void reInit() {
    _vipInfoModel = null;
    _vipInfo.value = null;
    templateModel = null;
    levelDetail = null;
  }

  Stream<GamingVipSettingModel?> getVipSetting(int level) {
    if (levelDetail != null) {
      return Stream.value(leveDetailToSetting(levelDetail!, level));
    } else {
      return getLevelDetail().map((event) {
        if (event != null) {
          leveDetailToSetting(event, level);
        }
        return null;
      });
    }
  }

  GamingVipSettingModel? leveDetailToSetting(
      List<GamingVipLevelDetailModel> list, int level) {
    final e = list.firstWhereOrNull((element) => element.vipLevel == level);
    if (e != null) {
      final model = GamingVipSettingModel(
        vipLevel: level.toString(),
        promotionBonus: e.upgradeBonus?.toInt() ?? 0,
        keepBonus: e.keepBonus?.toInt() ?? 0,
        birthdayBonus: e.birthdayBonus?.toInt() ?? 0,
        loginRedPackage: e.loginRedPackage?.toInt() ?? 0,
        firstDepositBonus: e.firstDepositBonus?.toInt() ?? 0,
        rescueMoney: e.rescueMoney?.toInt() ?? 0,
        sportsReturn: e.sportsCashback?.toDouble() ?? 0,
        personReturn: e.liveCashback?.toDouble() ?? 0,
        gameReturn: e.slotCashback?.toDouble() ?? 0,
        lotteryReturn: e.lotteryCashback?.toDouble() ?? 0,
        cardReturn: e.chessCashback?.toDouble() ?? 0,
        // totalBonus: ,
        dayWithdrawLimitMoney: e.dayWithdrawLimitMoney?.toInt() ?? 1,
      );
      return model;
    } else {
      return null;
    }
  }

  /// vip福利列表
  Stream<GamingVipBenefitsModel?> vipBenefit() {
    // if (benefitsModel != null) return Stream.value(benefitsModel);
    return Rx.combineLatestList([getLevelDetail(), getTemplateInfo()])
        .map((event) {
      if (event.where((element) => element == null).isNotEmpty) {
        return null;
      } else {
        return leveDetailToBenefits(event[0] as List<GamingVipLevelDetailModel>,
            event[1] as GamingVipTemplateModel);
      }
    }).doOnData((event) {
      benefitsModel = event;
    });
  }

  GamingVipBenefitsModel leveDetailToBenefits(
      List<GamingVipLevelDetailModel> list, GamingVipTemplateModel template) {
    final promotion = list
        .map((e) => GamingVipBenefitPoint(
              vipLevel: e.vipLevel.toString(),
              points: e.upgradePoints,
              period: template.upgradePeriod,
            ))
        .toList();

    final keep = list
        .map((e) => GamingVipBenefitPoint(
              vipLevel: e.vipLevel.toString(),
              points: e.keepPeriodPoints,
              period: template.keepPeriod,
            ))
        .toList();

    final birthdayBenefit = list
        .map((e) => GamingVipBenefitAmount(
              vipLevel: e.vipLevel.toString(),
              amount: e.birthdayBonus,
            ))
        .toList();

    final loginRedPackage = list
        .map((e) => GamingVipBenefitAmount(
              vipLevel: e.vipLevel.toString(),
              amount: e.loginRedPackage,
            ))
        .toList();

    final promotionBenefit = list
        .map((e) => GamingVipBenefitAmount(
              vipLevel: e.vipLevel.toString(),
              amount: e.upgradeBonus,
            ))
        .toList();

    final keepBenefit = list
        .map((e) => GamingVipBenefitAmount(
              vipLevel: e.vipLevel.toString(),
              amount: e.keepBonus,
            ))
        .toList();

    final depositBenefit = list
        .map((e) => GamingVipDepositBenefit(
              vipLevel: e.vipLevel.toString(),
              bonusRate: e.firstDepositBonus,
              bonusMax: e.firstDepositMax,
              period: e.firstDepositBonusPeriod?.toInt(),
            ))
        .toList();

    final rescueMoney = list
        .map((e) => GamingVipRescueMoney(
              vipLevel: e.vipLevel.toString(),
              amount: e.rescueMoney,
              amountMax: e.rescueMoneyMax,
            ))
        .toList();

    final returnBouns = list
        .map((e) => GamingVipReturnBonus(
              vipLevel: e.vipLevel.toString(),
              sportsReturn: e.sportsCashback,
              personReturn: e.liveCashback,
              casinoCashback: e.casinoCashback,
              lotteryReturn: e.lotteryCashback,
              cardReturn: e.chessCashback,
              limitMoney: e.dailyCashbackLimit,
              dayWithdrawLimitMoney: e.dayWithdrawLimitMoney,
            ))
        .toList();

    final model = GamingVipBenefitsModel(
      promotion: promotion,
      keep: keep,
      birthdayBenefit: birthdayBenefit,
      loginRedPackage: loginRedPackage,
      promotionBenefit: promotionBenefit,
      keepBenefit: keepBenefit,
      depositBenefit: depositBenefit,
      rescueMoney: rescueMoney,
      returnBouns: returnBouns,
    );
    return model;
  }

  /// VIP等级列表
  Stream<List<GamingVipLevelDetailModel>?> getLevelDetail() {
    return PGSpi(Vip.vipBenefits.toTarget())
        .rxRequest<List<GamingVipLevelDetailModel>?>((value) {
          final data = value['data'];
          if (data is List) {
            final list = data
                .map((e) => GamingVipLevelDetailModel.fromJson(
                    Map<String, dynamic>.from(e as Map)))
                .toList();
            return list;
          } else {
            return null;
          }
        })
        .map((event) => event.data)
        .doOnData((event) {
          levelDetail = event;
        });
  }

  /// 模版详情 gettemplateinfo
  Stream<GamingVipTemplateModel?> getTemplateInfo() {
    return PGSpi(Vip.templateinfo.toTarget())
        .rxRequest<GamingVipTemplateModel?>((value) {
          final data = value['data'];
          if (data is Map<String, dynamic>) {
            return GamingVipTemplateModel.fromJson(data);
          } else {
            return null;
          }
        })
        .map((event) => event.data)
        .doOnData((event) {
          templateModel = event;
        });
  }

  @override
  void onClose() {
    _instance = null;
  }
}
