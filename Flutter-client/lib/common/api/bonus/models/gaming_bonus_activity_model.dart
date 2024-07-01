// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_bonus_activity_rate_vos_model.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingBonusActivityModel {
  String bonusActivityName;

  /// "bonusActivitiesNo": "couponcodedeposit" 代表存在券码活动
  String bonusActivitiesNo;
  String? releaseCardTypeCode;
  List<String> labels;

  /// 活动类型 （红利活动：1，vip福利：2，，为空说明没有类型）
  int? activityType;

  /// 返还百分比
  double returnPercentage;

  /// 红利最大限制
  double bonusMaxUsdt;

  /// 预计收益 （预计收益计算：用户输入存款金额为1000 RMB，此时预计收益就是20 RMB）
  double projectedIncome;

  /// 预计收益 币种
  String? projectedCurrency;

  /// 预计收益 次数,某些活动多次奖励用,为空代表不计次数
  int? projectedOrdNum;

  /// 预计收益 总次数
  int? projectedTotalNum;

  /// 奖金固定金额USDT,prizeAmountType 为 1 用此属性
  double bonusFixedUsdt;

  /// 奖金计算方式 1：固定金额,2：按比例
  int? prizeAmountType;

  /// 发放方式 1:现金券,2:抵用金,3:SVIP体验券,4:实物,5:装备,6:Free Spin,7:后发现金券
  int? prizeType;

  /// 旋转次数
  int? freeSpinTimes;

  List<GamingBonusActivityRateVosModel>? rateVos;

  /// 最低存款额
  double? get minDeposit {
    return rateVos?.firstOrNull?.minDepositUsdt;
  }

  String? get prizeTypeText {
    switch (prizeType) {
      case 1:
        return localized('cash_coupons');
      case 2:
        return localized('select_coupon');
      case 3:
        return localized('svip_coupon');
      case 4:
        return localized('physical_coupon');
      case 5:
        return localized('equipment_coupon');
      case 6:
        return localized('free_spin_coupon');
      case 7:
        return localized('later_cash_coupon');
      case 8:
        return localized('price_type_8');
      default:
        return null;
    }
  }

  String? get activityTypeText {
    if (activityType == 2) {
      return localized('vip_bene00');
    }
    return null;
  }

  String? get projectedIncomeText {
    if (projectedIncome == 0) {
      return null;
    }
    return projectedIncome
        .toNP()
        .balanceText(projectedCurrency == null
            ? false
            : CurrencyService.sharedInstance.isDigital(projectedCurrency!))
        .stripTrailingZeros();
  }

  String? get bonusFixedUsdtText {
    if (bonusFixedUsdt == 0) {
      return null;
    }
    return bonusFixedUsdt.toNP().balanceText(true).stripTrailingZeros();
  }

  String get description {
    List<String> text = [bonusActivityName];

    /// free spin 额外处理
    if (prizeType == 6) {
      text.add('$freeSpinTimes ${localized("times_for_none")}');
    } else {
      if (prizeAmountType == 1) {
        if (bonusFixedUsdt > 0) {
          text.add('$bonusFixedUsdtText USDT');
        }
      } else {
        if (returnPercentage > 0) {
          text.add('${returnPercentage.stripTrailingZeros()}%');
        }
        if (bonusMaxUsdt > 0) {
          text.add(
              '${localized('max')} ${bonusMaxUsdt.stripTrailingZeros()} USDT');
        }
      }
    }
    return text.join(', ');
  }

  GamingBonusActivityModel({
    this.bonusActivityName = '',
    required this.bonusActivitiesNo,
    this.returnPercentage = 0,
    this.projectedIncome = 0,
    this.activityType,
    this.releaseCardTypeCode,
    this.labels = const [],
    this.bonusMaxUsdt = 0,
    this.prizeType,
    this.projectedCurrency,
    this.projectedOrdNum,
    this.projectedTotalNum,
    this.bonusFixedUsdt = 0,
    this.prizeAmountType,
    this.rateVos,
    this.freeSpinTimes,
  });

  factory GamingBonusActivityModel.fromJson(Map<String, Object?> json) {
    return GamingBonusActivityModel(
      bonusActivityName: json['bonusActivityName'] as String? ?? '',
      bonusActivitiesNo: json['bonusActivitiesNo'] as String,
      returnPercentage: (json['returnPercentage'] as num?)?.toDouble() ?? 0,
      projectedIncome: (json['projectedIncome'] as num?)?.toDouble() ?? 0,
      activityType: asT<int>(json['activityType']),
      releaseCardTypeCode: json['releaseCardTypeCode'] as String?,
      labels: List<String>.from(json['labels'] as List<dynamic>? ?? []),
      bonusMaxUsdt: (json['bonusMaxUsdt'] as num?)?.toDouble() ?? 0,
      prizeType: json['prizeType'] as int?,
      projectedCurrency: json['projectedCurrency'] as String?,
      projectedOrdNum: json['projectedOrdNum'] as int?,
      projectedTotalNum: asT<int>(json['projectedTotalNum']),
      bonusFixedUsdt: (json['bonusFixedUsdt'] as num?)?.toDouble() ?? 0,
      prizeAmountType: json['prizeAmountType'] as int?,
      freeSpinTimes: GGUtil.parseInt(json['freeSpinTimes']),
      rateVos: (json['rateVos'] as List<dynamic>?)
          ?.map((e) => GamingBonusActivityRateVosModel.fromJson(
              e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, Object?> toJson() => {
        'bonusActivityName': bonusActivityName,
        'bonusActivitiesNo': bonusActivitiesNo,
        'returnPercentage': returnPercentage,
        'projectedIncome': projectedIncome,
        'activityType': activityType,
        'releaseCardTypeCode': releaseCardTypeCode,
        'labels': labels,
        'bonusMaxUsdt': bonusMaxUsdt,
        'prizeType': prizeType,
        'projectedCurrency': projectedCurrency,
        'projectedOrdNum': projectedOrdNum,
        'projectedTotalNum': projectedTotalNum,
        'bonusFixedUsdt': bonusFixedUsdt,
        'prizeAmountType': prizeAmountType,
        'rateVos': rateVos?.map((e) => e.toJson()).toList(),
      };

  GamingBonusActivityModel copyWith({
    String? bonusActivityName,
    String? bonusActivitiesNo,
    double? returnPercentage,
    double? projectedIncome,
    int? activityType,
    String? releaseCardTypeCode,
    List<String>? labels,
    double? bonusMaxUsdt,
    int? prizeType,
    String? projectedCurrency,
    int? projectedOrdNum,
    int? projectedTotalNum,
    List<GamingBonusActivityRateVosModel>? rateVos,
  }) {
    return GamingBonusActivityModel(
      bonusActivityName: bonusActivityName ?? this.bonusActivityName,
      bonusActivitiesNo: bonusActivitiesNo ?? this.bonusActivitiesNo,
      returnPercentage: returnPercentage ?? this.returnPercentage,
      projectedIncome: projectedIncome ?? this.projectedIncome,
      activityType: activityType ?? this.activityType,
      releaseCardTypeCode: releaseCardTypeCode ?? this.releaseCardTypeCode,
      labels: labels ?? this.labels,
      bonusMaxUsdt: bonusMaxUsdt ?? this.bonusMaxUsdt,
      prizeType: prizeType ?? this.prizeType,
      projectedCurrency: projectedCurrency ?? this.projectedCurrency,
      projectedOrdNum: projectedOrdNum ?? this.projectedOrdNum,
      projectedTotalNum: projectedTotalNum ?? this.projectedTotalNum,
      rateVos: rateVos ?? this.rateVos,
    );
  }

  @override
  String toString() {
    return 'GamingBonusActivityModel(bonusActivityName: $bonusActivityName, bonusActivitiesNo: $bonusActivitiesNo, returnPercentage: $returnPercentage, projectedIncome: $projectedIncome, activityType: $activityType, releaseCardTypeCode: $releaseCardTypeCode, labels: $labels, bonusMaxUsdt: $bonusMaxUsdt, prizeType: $prizeType, projectedCurrency: $projectedCurrency, projectedOrdNum: $projectedOrdNum)';
  }
}
