import 'dart:convert';
import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingVipLevelDetailModel {
  GamingVipLevelDetailModel({
    this.birthdayBonus,
    this.casinoCashback,
    this.chessCashback,
    this.createTime,
    this.dailyCashbackLimit,
    this.dayLimit,
    this.dayWithdrawLimitMoney,
    this.firstDepositBonus,
    this.firstDepositBonusPeriod,
    this.firstDepositMax,
    this.keepBonus,
    this.keepPeriodPoints,
    this.levelId,
    this.levelStatus,
    this.liveCashback,
    this.loginRedPackage,
    this.lotteryCashback,
    this.rescueMoney,
    this.rescueMoneyMax,
    this.slotCashback,
    this.sportsCashback,
    this.tenantId,
    this.updateTime,
    this.upgradeBonus,
    this.upgradePoints,
    this.validPeriod,
    this.validPeriodEnd,
    this.validPeriodStart,
    this.vipGroupId,
    this.vipLevel,
    this.vipName,
    this.vipTemplateId,
  });

  factory GamingVipLevelDetailModel.fromJson(Map<String, dynamic> json) => GamingVipLevelDetailModel(
        birthdayBonus: asT<num>(json['birthdayBonus']),
        casinoCashback: asT<num>(json['casinoCashback']),
        chessCashback: asT<num>(json['chessCashback']),
        createTime: asT<num>(json['createTime']),
        dailyCashbackLimit: asT<num>(json['dailyCashbackLimit']),
        dayLimit: asT<num>(json['dayLimit']),
        dayWithdrawLimitMoney: asT<num>(json['dayWithdrawLimitMoney']),
        firstDepositBonus: asT<num>(json['firstDepositBonus']),
        firstDepositBonusPeriod:
            asT<num>(json['firstDepositBonusPeriod']),
        firstDepositMax: asT<num>(json['firstDepositMax']),
        keepBonus: asT<num>(json['keepBonus']),
        keepPeriodPoints: asT<num>(json['keepPeriodPoints']),
        levelId: asT<num>(json['levelId']),
        levelStatus: asT<num>(json['levelStatus']),
        liveCashback: asT<num>(json['liveCashback']),
        loginRedPackage: asT<num>(json['loginRedPackage']),
        lotteryCashback: asT<num>(json['lotteryCashback']),
        rescueMoney: asT<num>(json['rescueMoney']),
        rescueMoneyMax: asT<num>(json['rescueMoneyMax']),
        slotCashback: asT<num>(json['slotCashback']),
        sportsCashback: asT<num>(json['sportsCashback']),
        tenantId: asT<num>(json['tenantId']),
        updateTime: asT<num>(json['updateTime']),
        upgradeBonus: asT<num>(json['upgradeBonus']),
        upgradePoints: asT<num>(json['upgradePoints']),
        validPeriod: asT<num>(json['validPeriod']),
        validPeriodEnd: asT<num>(json['validPeriodEnd']),
        validPeriodStart: asT<num>(json['validPeriodStart']),
        vipGroupId: asT<num>(json['vipGroupId']),
        vipLevel: asT<num>(json['vipLevel']),
        vipName: GGUtil.parseStr(json['vipName']),
        vipTemplateId: asT<num>(json['vipTemplateId']),
      );
  /// 生日红利
  num? birthdayBonus;
  /// 娱乐场反水
  num? casinoCashback;
  /// 棋牌反水
  num? chessCashback;
  /// 创建时间
  num? createTime;
  /// 单日反水上限
  num? dailyCashbackLimit;
  /// 单日上限
  num? dayLimit;
  /// 日累计提款限额
  num? dayWithdrawLimitMoney;
  /// 首存红利比
  num? firstDepositBonus;
  /// 周存款福利
  num? firstDepositBonusPeriod;
  /// 首存红利上限
  num? firstDepositMax;
  /// 保级红利
  num? keepBonus;
  /// 保级成才值
  num? keepPeriodPoints;
  /// 等级主键
  num? levelId;
  /// 级别状态 1:无效 2:有效
  num? levelStatus;
  /// 真人反水
  num? liveCashback;
  /// 登陆红包
  num? loginRedPackage;
  /// 彩票返水
  num? lotteryCashback;
  /// 救援金
  num? rescueMoney;
  /// 救援金最大
  num? rescueMoneyMax;
  /// 小游戏返水
  num? slotCashback;
  /// 体育反水
  num? sportsCashback;
  /// 商户号
  num? tenantId;
  /// 更新时间
  num? updateTime;
  /// 升级红包
  num? upgradeBonus;
  /// 晋级成才值
  num? upgradePoints;
  /// 有效周期
  num? validPeriod;
  /// 有效期结束
  num? validPeriodEnd;
  /// 有效期开始
  num? validPeriodStart;
  /// VIP分组ID
  num? vipGroupId;
  /// VIP级别
  num? vipLevel;
  /// VIP级别名称
  String? vipName;
  /// 模板ID
  num? vipTemplateId;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'birthdayBonus': birthdayBonus,
        'casinoCashback': casinoCashback,
        'chessCashback': chessCashback,
        'createTime': createTime,
        'dailyCashbackLimit': dailyCashbackLimit,
        'dayLimit': dayLimit,
        'dayWithdrawLimitMoney': dayWithdrawLimitMoney,
        'firstDepositBonus': firstDepositBonus,
        'firstDepositBonusPeriod': firstDepositBonusPeriod,
        'firstDepositMax': firstDepositMax,
        'keepBonus': keepBonus,
        'keepPeriodPoints': keepPeriodPoints,
        'levelId': levelId,
        'levelStatus': levelStatus,
        'liveCashback': liveCashback,
        'loginRedPackage': loginRedPackage,
        'lotteryCashback': lotteryCashback,
        'rescueMoney': rescueMoney,
        'rescueMoneyMax': rescueMoneyMax,
        'slotCashback': slotCashback,
        'sportsCashback': sportsCashback,
        'tenantId': tenantId,
        'updateTime': updateTime,
        'upgradeBonus': upgradeBonus,
        'upgradePoints': upgradePoints,
        'validPeriod': validPeriod,
        'validPeriodEnd': validPeriodEnd,
        'validPeriodStart': validPeriodStart,
        'vipGroupId': vipGroupId,
        'vipLevel': vipLevel,
        'vipName': vipName,
        'vipTemplateId': vipTemplateId,
      };
}
