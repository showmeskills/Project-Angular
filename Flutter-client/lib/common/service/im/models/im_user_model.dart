import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

import 'im_recieve_model.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class IMUserModel {
  IMUserModel({
    this.avatar,
    this.groups,
    this.merchantId,
    this.messageBody,
    this.nick,
    this.status,
    this.terminal,
    this.userId,
    this.muteStatus,
  });

  factory IMUserModel.fromJson(Map<String, dynamic> json) {
    final List<IMGroupsModel>? groups =
        json['groups'] is List ? <IMGroupsModel>[] : null;
    if (groups != null) {
      for (final dynamic item in json['groups']! as List) {
        if (item != null) {
          groups.add(IMGroupsModel.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return IMUserModel(
      avatar: GGUtil.parseStr(json['avatar']),
      groups: groups,
      merchantId: GGUtil.parseStr(json['merchantId']),
      messageBody: json['messageBody'] == null
          ? null
          : IMRecieveChatModel.fromJson(
              asT<Map<String, dynamic>>(json['messageBody'])!),
      nick: GGUtil.parseStr(json['nick']),
      status: GGUtil.parseStr(json['status']),
      terminal: GGUtil.parseStr(json['terminal']),
      userId: GGUtil.parseStr(json['userId']),
      muteStatus: GGUtil.parseInt(json['muteStatus']),
    );
  }

  String? avatar;
  List<IMGroupsModel>? groups;
  String? merchantId;
  IMRecieveChatModel? messageBody;
  String? nick;
  String? status;
  String? terminal;
  String? userId;

  /// 1禁言 2正常
  int? muteStatus;
  bool get isBan => muteStatus == 1;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'avatar': avatar,
        'groups': groups,
        'merchantId': merchantId,
        'messageBody': messageBody,
        'nick': nick,
        'status': status,
        'terminal': terminal,
        'userId': userId,
        'muteStatus': muteStatus,
      };
}

class IMGroupsModel {
  IMGroupsModel({
    this.groupId,
    this.name,
  });

  factory IMGroupsModel.fromJson(Map<String, dynamic> json) => IMGroupsModel(
        groupId: GGUtil.parseStr(json['groupId']),
        name: GGUtil.parseStr(json['name']),
      );

  String? groupId;
  String? name;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'groupId': groupId,
        'name': name,
      };
}
