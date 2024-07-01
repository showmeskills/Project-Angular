import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GameLuckySpinGapModel {
  GameLuckySpinGapModel({
    required this.wheelType,
    required this.leftTimes,
    required this.remainDeposit,
    required this.depositAmount,
    required this.remainTransCount,
    required this.remainTransAmount,
    required this.transMinAmount,
    required this.perTransCount,
    required this.transAmount,
    required this.nextTime,
    required this.rewardSpinTimes,
  });

  factory GameLuckySpinGapModel.fromJson(Map<String, dynamic> json) =>
      GameLuckySpinGapModel(
        wheelType: GGUtil.parseInt(json['wheelType']),
        leftTimes: GGUtil.parseInt(json['leftTimes']),
        remainDeposit: GGUtil.parseInt(json['remainDeposit']),
        depositAmount: GGUtil.parseInt(json['depositAmount']),
        remainTransCount: GGUtil.parseInt(json['remainTransCount']),
        remainTransAmount: GGUtil.parseInt(json['remainTransAmount']),
        transMinAmount: GGUtil.parseInt(json['transMinAmount']),
        perTransCount: GGUtil.parseInt(json['perTransCount']),
        transAmount: GGUtil.parseInt(json['transAmount']),
        nextTime: GGUtil.parseInt(json['nextTime']),
        rewardSpinTimes: GGUtil.parseInt(json['rewardSpinTimes']),
      );
  // 条件类型 1-存款，2-交易, 3-时间间隔
  int wheelType;
  // 剩余的抽奖次数
  int leftTimes;
  // 距离下次抽奖，还需上多少分，WheelType=1
  int remainDeposit;
  // 达到多少金额才送，WheelType=1
  int depositAmount;

  // 还要上分多少金额才送，WheelType=2
  int remainTransAmount;
  // 达到多少金额才送，WheelType=2
  int transAmount;

  // 距离下次抽奖，还需上分多少次，WheelType=2
  int remainTransCount;
  // 每有效交易多少次，WheelType=2
  int perTransCount;
  // 单笔最低金额，WheelType=2
  int transMinAmount;

  // 下次给出抽奖次数的时间，还有转动次数时请略过此栏，WheelType=3，Now > RemainTime时才能转动
  int nextTime;

  // 达成条件可获得的抽奖次数
  int rewardSpinTimes;

  @override
  String toString() {
    return 'GameLuckySpinGapModel{wheelType: $wheelType, leftTimes: $leftTimes, remainDeposit: $remainDeposit, depositAmount: $depositAmount, remainTransCount: $remainTransCount, remainTransAmount: $remainTransAmount, transMinAmount: $transMinAmount, perTransCount: $perTransCount, transAmount: $transAmount, nextTime: $nextTime}';
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'wheelType': wheelType,
        'leftTimes': leftTimes,
        'remainDeposit': remainDeposit,
        'depositAmount': depositAmount,
        'remainTransCount': remainTransCount,
        'remainTransAmount': remainTransAmount,
        'transMinAmount': transMinAmount,
        'perTransCount': perTransCount,
        'transAmount': transAmount,
        'nextTime': nextTime,
        'rewardSpinTimes': rewardSpinTimes,
      };
}
