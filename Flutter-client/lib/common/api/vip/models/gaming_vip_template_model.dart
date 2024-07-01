import 'dart:convert';
import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingVipTemplateModel {
  GamingVipTemplateModel({
    this.createTime,
    this.depositBonusPeriod,
    this.endDate,
    this.isDefault,
    this.keepPeriod,
    this.loginRedPackagePeriod,
    this.rescuePeriod,
    this.startDate,
    this.svipInviteTime,
    this.svipKeepTime,
    this.templateId,
    this.templateName,
    this.templateNo,
    this.templateStatus,
    this.templateType,
    this.updateTime,
    this.upgradeNum,
    this.upgradePeriod,
  });

  factory GamingVipTemplateModel.fromJson(Map<String, dynamic> json) =>
      GamingVipTemplateModel(
        createTime: GGUtil.parseInt(json['createTime']),
        depositBonusPeriod: GGUtil.parseInt(json['depositBonusPeriod']),
        endDate: GGUtil.parseInt(json['endDate']),
        isDefault: GGUtil.parseInt(json['isDefault']),
        keepPeriod: GGUtil.parseInt(json['keepPeriod']),
        loginRedPackagePeriod: GGUtil.parseInt(json['loginRedPackagePeriod']),
        rescuePeriod: GGUtil.parseInt(json['rescuePeriod']),
        startDate: GGUtil.parseInt(json['startDate']),
        svipInviteTime: GGUtil.parseInt(json['svipInviteTime']),
        svipKeepTime: GGUtil.parseInt(json['svipKeepTime']),
        templateId: GGUtil.parseInt(json['templateId']),
        templateName: GGUtil.parseStr(json['templateName']),
        templateNo: GGUtil.parseStr(json['templateNo']),
        templateStatus: GGUtil.parseInt(json['templateStatus']),
        templateType: GGUtil.parseInt(json['templateType']),
        updateTime: GGUtil.parseInt(json['updateTime']),
        upgradeNum: GGUtil.parseInt(json['upgradeNum']),
        upgradePeriod: GGUtil.parseInt(json['upgradePeriod']),
      );

  /// 创建时间
  int? createTime;
  /// 首存红利周期
  int? depositBonusPeriod;
  /// 模板有效期结束
  int? endDate;
  /// 模板是否为默认 0:不默认 1：默认
  int? isDefault;
  /// 模板保级周期
  int? keepPeriod;
  /// 登陆红包周期
  int? loginRedPackagePeriod;
  /// 救援周期
  int? rescuePeriod;
  /// 模板有效期开始
  int? startDate;
  /// 模板SVIP再邀请时间
  int? svipInviteTime;
  /// 模板SVIP持续时间
  int? svipKeepTime;
  /// 模板ID
  int? templateId;
  /// 模板名称
  String? templateName;
  /// 模板编号
  String? templateNo;
  /// 模板状态 1:禁用 2:启用
  int? templateStatus;
  /// 模板类型 模板A:1 模板B:2 模板C:3
  int? templateType;
  /// 更新时间
  int? updateTime;
  /// 模板单次晋级级数
  int? upgradeNum;
  /// 模板晋级周期
  int? upgradePeriod;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'createTime': createTime,
        'depositBonusPeriod': depositBonusPeriod,
        'endDate': endDate,
        'isDefault': isDefault,
        'keepPeriod': keepPeriod,
        'loginRedPackagePeriod': loginRedPackagePeriod,
        'rescuePeriod': rescuePeriod,
        'startDate': startDate,
        'svipInviteTime': svipInviteTime,
        'svipKeepTime': svipKeepTime,
        'templateId': templateId,
        'templateName': templateName,
        'templateNo': templateNo,
        'templateStatus': templateStatus,
        'templateType': templateType,
        'updateTime': updateTime,
        'upgradeNum': upgradeNum,
        'upgradePeriod': upgradePeriod,
      };
}
