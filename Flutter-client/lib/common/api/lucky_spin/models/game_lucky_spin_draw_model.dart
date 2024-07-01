import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/helper/time_helper.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GameLuckySpinDrawModel {
  GameLuckySpinDrawModel({
    required this.total,
    required this.histories,
  });

  factory GameLuckySpinDrawModel.fromJson(Map<String, dynamic> json) {
    final List<GameLuckySpinDrawModelItem>? histories =
        json['histories'] is List ? <GameLuckySpinDrawModelItem>[] : null;
    if (histories != null) {
      for (final dynamic item in json['histories'] as List) {
        if (item != null) {
          histories.add(GameLuckySpinDrawModelItem.fromJson(
              asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GameLuckySpinDrawModel(
      total: asT<int>(json['total'])!,
      histories: histories!,
    );
  }

  int total;
  List<GameLuckySpinDrawModelItem> histories;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'total': total,
        'histories': histories,
      };
}

class GameLuckySpinDrawModelItem {
  GameLuckySpinDrawModelItem({
    required this.activityName,
    required this.userId,
    this.userName,
    this.userAvatar,
    required this.orderId,
    required this.prizeId,
    required this.prizeFullName,
    required this.prizeShortName,
    required this.prizeType,
    required this.amount,
    required this.currency,
    required this.svipDays,
    required this.times,
    required this.picture,
    required this.drawTime,
    required this.activityCode,
  });

  factory GameLuckySpinDrawModelItem.fromJson(Map<String, dynamic> json) =>
      GameLuckySpinDrawModelItem(
        activityName: GGUtil.parseStr(json['activityName']),
        userId: GGUtil.parseStr(json['userId']),
        userName: GGUtil.parseStr(json['userName']),
        userAvatar: GGUtil.parseStr(json['userAvatar']),
        orderId: GGUtil.parseInt(json['orderId']),
        prizeId: GGUtil.parseInt(json['prizeId']),
        prizeFullName: GGUtil.parseStr(json['prizeFullName']),
        prizeShortName: GGUtil.parseStr(json['prizeShortName']),
        prizeType: GGUtil.parseInt(json['prizeType']),
        amount: GGUtil.parseDouble(json['amount']),
        currency: GGUtil.parseStr(json['currency']),
        svipDays: GGUtil.parseInt(json['svipDays']),
        times: GGUtil.parseInt(json['times']),
        picture: GGUtil.parseStr(json['picture']),
        drawTime: GGUtil.parseInt(json['drawTime']),
        activityCode: GGUtil.parseStr(json['activityCode']),
      );

  String activityName;
  String userId;
  String? userName;
  String? userAvatar;
  int orderId;
  int prizeId;
  String prizeFullName;
  String prizeShortName;
  int prizeType;
  double amount;
  String currency;
  int svipDays;
  int times;
  String picture;
  int drawTime;
  String activityCode;

  String get timeToMM {
    String format = "yyyy-MM-dd HH:mm";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(drawTime);
    return DateFormat(format).format(aTime).toString();
  }

  String get timeToSS {
    String format = "yyyy-MM-dd HH:mm:ss";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(drawTime);
    return DateFormat(format).format(aTime).toString();
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'activityName': activityName,
        'userId': userId,
        'userName': userName,
        'userAvatar': userAvatar,
        'orderId': orderId,
        'prizeId': prizeId,
        'prizeFullName': prizeFullName,
        'prizeShortName': prizeShortName,
        'prizeType': prizeType,
        'amount': amount,
        'currency': currency,
        'svipDays': svipDays,
        'times': times,
        'picture': picture,
        'drawTime': drawTime,
        'activityCode': activityCode,
      };
}
