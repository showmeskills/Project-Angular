import 'dart:convert';

import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GameLuckySpinInformationModel {
  GameLuckySpinInformationModel({
    required this.activityCode,
    required this.status,
    required this.conditionType,
    required this.currency,
    required this.startTime,
    required this.endTime,
    required this.prizeInfos,
    required this.name,
    required this.subName,
    required this.slogan,
    required this.content,
    required this.available,
  });

  factory GameLuckySpinInformationModel.fromJson(Map<String, dynamic> json) {
    final List<Prizeinfos>? prizeInfos =
        json['prizeInfos'] is List ? <Prizeinfos>[] : null;
    if (prizeInfos != null) {
      for (final dynamic item in json['prizeInfos'] as List) {
        if (item != null) {
          prizeInfos.add(Prizeinfos.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GameLuckySpinInformationModel(
      activityCode: GGUtil.parseStr(json['activityCode']),
      status: GGUtil.parseInt(json['status']),
      conditionType: GGUtil.parseInt(json['conditionType']),
      currency: GGUtil.parseStr(json['currency']),
      startTime: GGUtil.parseInt(json['startTime']),
      endTime: GGUtil.parseInt(json['endTime']),
      name: GGUtil.parseStr(json['name']),
      prizeInfos: prizeInfos ?? [],
      subName: GGUtil.parseStr(json['subName']),
      slogan: GGUtil.parseStr(json['slogan']),
      content: GGUtil.parseStr(json['content']),
      available: GGUtil.parseBool(json['available']),
    );
  }

  String activityCode;
  int status;
  int conditionType;
  String currency;
  int startTime;
  int endTime;
  List<Prizeinfos> prizeInfos;
  String name;
  String subName;
  String slogan;
  String content;
  /// 大转盘是否可用
  final bool available;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'activityCode': activityCode,
        'status': status,
        'conditionType': conditionType,
        'currency': currency,
        'startTime': startTime,
        'endTime': endTime,
        'prizeInfos': prizeInfos,
        'name': name,
        'subName': subName,
        'slogan': slogan,
        'content': content,
      };
}

class Prizeinfos {
  Prizeinfos({
    required this.prizeId,
    required this.prizeFullName,
    required this.prizeShortName,
    required this.prizeType,
    required this.amount,
    required this.currency,
    required this.svipDays,
    required this.times,
    required this.picture,
  });

  factory Prizeinfos.fromJson(Map<String, dynamic> json) => Prizeinfos(
        prizeId: GGUtil.parseInt(json['prizeId']),
        prizeFullName: GGUtil.parseStr(json['prizeFullName']),
        prizeShortName: GGUtil.parseStr(json['prizeShortName']),
        prizeType: GGUtil.parseInt(json['prizeType']),
        amount: GGUtil.parseDouble(json['amount']),
        currency: GGUtil.parseStr(json['currency']),
        svipDays: GGUtil.parseInt(json['svipDays']),
        times: GGUtil.parseInt(json['times']),
        picture: GGUtil.parseStr(json['picture']),
      );

  int prizeId;
  String prizeFullName;
  String prizeShortName;
  //**奖品类型，1:现金券,2:抵用金,3:后发现金券,4:实物,5:装备,6:Free Spin,7:SVIP体验券, 8非粘性奖金,99:未中奖
  int prizeType;
  double amount;
  String currency;
  // SVIP有效期，设置1天代表1内可以成为SVIP等级 （当奖品类型为抵用金、SVIP时，单位：天）
  int svipDays;
  int times;
  String picture;

  /// 是否现金类型
  bool get isMoneyType => [1, 2, 3, 7, 8].contains(prizeType);

  String get prizeText {
    if (!isMoneyType) {
      return prizeFullName;
    } else {
      return amountText;
    }
  }

  /// 中奖奖品名
  String get prizeResultText {
    if (!isMoneyType) {
      return prizeFullName;
    } else {
      return '$currency $amountText';
    }
  }

  String get amountText => NumberPrecision(amount).displayNum(2);

  String get iconUrl {
    return !isMoneyType && picture.isNotEmpty
        ? picture
        : CurrencyService.sharedInstance.getIconUrl(currency);
  }

  bool get isDigital {
    return CurrencyService.sharedInstance.isDigital(currency);
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'prizeId': prizeId,
        'prizeFullName': prizeFullName,
        'prizeShortName': prizeShortName,
        'prizeType': prizeType,
        'amount': amount,
        'currency': currency,
        'svipDays': svipDays,
        'times': times,
        'picture': picture,
      };
}
