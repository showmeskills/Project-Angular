import 'package:gogaming_app/common/components/number_precision/number_precision.dart';

class GamingUserVipModel {
  int? currentVipLevel;
  double? currentDeposit;
  double? currentFlows;
  double? currentPoints;
  double? currentTotalPoints;
  double? nextLevelPoints;
  int? userStatus;
  int? createTime;
  int? updateTime;
  int? currentVipInValidTime;
  int? isSvip;
  int? svipCreateTime;
  int? svipInvalidTime;
  double? vipDeposit;
  double? vipBet;
  double? process;
  double? totalBonus;
  double? keepPoints;
  int? keepTime;
  double? processKeep;

  String get totalBonusText {
    return NumberPrecision(totalBonus ?? 0).balanceText(true);
  }

  GamingUserVipModel({
    this.currentVipLevel,
    this.currentDeposit,
    this.currentFlows,
    this.currentPoints,
    this.currentTotalPoints,
    this.nextLevelPoints,
    this.userStatus,
    this.createTime,
    this.updateTime,
    this.currentVipInValidTime,
    this.isSvip,
    this.svipCreateTime,
    this.svipInvalidTime,
    this.vipDeposit,
    this.vipBet,
    this.process,
    this.totalBonus,
    this.keepPoints,
    this.keepTime,
    this.processKeep,
  });

  @override
  String toString() {
    return 'GamingUserVipModel(currentVipLevel: $currentVipLevel, currentDeposit: $currentDeposit, currentFlows: $currentFlows, currentPoints: $currentPoints, cumulatePoints: $currentTotalPoints, nextLevelPoints: $nextLevelPoints, vipUserStatus: $userStatus, vipCreateTime: $createTime, vipUpdateTime: $updateTime, currentVipInValidTime: $currentVipInValidTime, isSvip: $isSvip, sVipCreateTime: $svipCreateTime, svipInValidTime: $svipInvalidTime, vipDeposit: $vipDeposit, vipBet: $vipBet, process: $process, totalBonus: $totalBonus, keepPoints: $keepPoints, keepDay: $keepTime, processKeep: $processKeep)';
  }

  factory GamingUserVipModel.fromJson(Map<String, Object?> json) {
    return GamingUserVipModel(
      currentVipLevel: json['currentVipLevel'] as int?,
      currentDeposit: (json['currentDeposit'] as num?)?.toDouble(),
      currentFlows: (json['currentFlows'] as num?)?.toDouble(),
      currentPoints: (json['currentPoints'] as num?)?.toDouble(),
      currentTotalPoints: (json['currentTotalPoints'] as num?)?.toDouble(),
      nextLevelPoints: (json['nextLevelPoints'] as num?)?.toDouble(),
      userStatus: json['userStatus'] as int?,
      createTime: json['createTime'] as int?,
      updateTime: json['updateTime'] as int?,
      currentVipInValidTime: json['currentVipInValidTime'] as int?,
      isSvip: json['isSvip'] as int?,
      svipCreateTime: json['svipCreateTime'] as int?,
      svipInvalidTime: json['svipInvalidTime'] as int?,
      vipDeposit: (json['vipDeposit'] as num?)?.toDouble(),
      vipBet: (json['vipBet'] as num?)?.toDouble(),
      process: (json['process'] as num?)?.toDouble(),
      totalBonus: (json['totalBonus'] as num?)?.toDouble(),
      keepPoints: (json['keepPoints'] as num?)?.toDouble(),
      keepTime: json['keepTime'] as int?,
      processKeep: (json['processKeep'] as num?)?.toDouble(),
    );
  }

  Map<String, Object?> toJson() => {
        'currentVipLevel': currentVipLevel,
        'currentDeposit': currentDeposit,
        'currentFlows': currentFlows,
        'currentPoints': currentPoints,
        'currentTotalPoints': currentTotalPoints,
        'nextLevelPoints': nextLevelPoints,
        'userStatus': userStatus,
        'createTime': createTime,
        'updateTime': updateTime,
        'currentVipInValidTime': currentVipInValidTime,
        'isSvip': isSvip,
        'svipCreateTime': svipCreateTime,
        'svipInvalidTime': svipInvalidTime,
        'vipDeposit': vipDeposit,
        'vipBet': vipBet,
        'process': process,
        'totalBonus': totalBonus,
        'keepPoints': keepPoints,
        'keepTime': keepTime,
        'processKeep': processKeep,
      };

}
