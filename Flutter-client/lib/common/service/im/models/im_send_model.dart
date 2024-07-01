import 'dart:math';

import 'package:gogaming_app/config/config.dart';

import 'im_asset.dart';
import 'im_msg_type.dart';

class IMSendModel {
  /// 获取用户信息协议（cmd=17）退出协议（cmd=14）单聊协议cmd=11
  final int command;
  final Map<String, dynamic> data;

  String? get seq => data['seq']?.toString();
  void setSeq(String seq) {
    data['seq'] = seq;
  }

  String? get content => data['content']?.toString();

  IMSendModel({
    required this.command,
    required this.data,
  });

  Map<String, dynamic> toJson() => Map.from(data)..addAll({"command": command});

  /// 心跳协议
  factory IMSendModel.live() {
    return IMSendModel(command: 13, data: {'hbbyte': '-127'});
  }

  /// 退出协议
  factory IMSendModel.exit(String userId) {
    return IMSendModel(command: 14, data: {'userId': userId});
  }

  /// 聊天协议
  /// [content] 消息内容
  /// [extras] 扩展字段 JSON对象格式如：{'扩展字段名称':'扩展字段value'}
  /// [chatType] 聊天类型int类型 (1:群聊 2:单聊 3:自动客服)
  /// [createTime] 消息创建时间long类型
  /// [seq] 消息序列号
  factory IMSendModel.chat({
    required String content,
    String? extras,
    Map<String, dynamic>? extrasMap,
    String chatType = '3',
    required IMMsgType msgType,
    num? createTime,
    String? seq,
  }) {
    final time = DateTime.now().millisecondsSinceEpoch;
    var rng = Random();
    var number = rng.nextInt(900) + 100; // 生成100到999的随机数
    final Map<String, dynamic> data = {
      'content': content,
      if (extras is String) 'extras': extras,
      'chatType': chatType,
      'msgType': msgType.value,
      'createTime': createTime ?? time,
      //同步web格式 商户id+随机三位数+时间戳
      "seq": seq ?? '${Config.tenantId}$number$time',
    };
    data.addAll(extrasMap ?? {});
    return IMSendModel(
      command: 11,
      data: data,
    );
  }

  /// 获取消息历史记录协议
  /// [count] 显示消息数量,默认10,非必填
  /// [lastTime] 消息区间结束时间Date毫秒数double类型必填
  /// [type] 消息类型(0:离线消息,登陆时获取,1:历史消息)
  factory IMSendModel.history({
    num? lastTime,
    int count = 10,
    String type = '1',
  }) {
    return IMSendModel(command: 19, data: {
      if (lastTime != null) "lastTime": lastTime,
      "count": count,
      "type": type,
    });
  }

  /// 获取离线消息历史记录协议
  /// [type] 消息类型(0:离线消息,登陆时获取,1:历史消息)
  /// [size] 显示消息数量,默认10,非必填
  /// [current] 当前页数，默认1
  /// [beginTime] 消息区间开始时间Date毫秒数double类型必填
  /// [endTime] 消息区间结束时间Date毫秒数double类型必填
  factory IMSendModel.offlineHistory({
    String type = '1',
    int size = 10,
    int current = 1,
    num? beginTime,
    num? endTime,
  }) {
    return IMSendModel(command: 29, data: {
      if (endTime != null) "endTime": endTime,
      if (beginTime != null) "beginTime": beginTime,
      "size": size,
      "type": type,
      "current": current,
    });
  }

  /// 获取未读消息数量
  factory IMSendModel.getUnreadNum() {
    return IMSendModel(command: 23, data: {});
  }

  /// 消息已读
  factory IMSendModel.setMsgRead() {
    return IMSendModel(command: 21, data: {});
  }

  /// 发送图片消息
  factory IMSendModel.image({
    required List<IMAsset> asset,
    num? createTime,
    String? seq,
  }) {
    String content = "#{${asset.first.fId}}#";

    asset.skip(1).forEach((element) {
      content += "#{${element.fId}}#";
    });

    return IMSendModel.chat(
      content: content,
      msgType: IMMsgType.image,
      createTime: createTime,
      seq: seq,
      extrasMap: {'asset': asset.map((e) => e.toJson()).toList()},
    );
  }

  /// 发送视频消息
  factory IMSendModel.video({
    required IMAsset cover,
    required IMAsset video,
    num? createTime,
    String? seq,
  }) {
    String content = "#{${video.fId}}#";
    final assets = [video, cover];
    return IMSendModel.chat(
      content: content,
      msgType: IMMsgType.video,
      createTime: createTime,
      seq: seq,
      extrasMap: {'asset': assets.map((e) => e.toJson()).toList()},
    );
  }

  /// 发送文件消息
  factory IMSendModel.file({
    required List<IMAsset> assets,
    bool isPDF = true,
    num? createTime,
    String? seq,
  }) {
    assert(assets.length == 1);
    String content = "#{${assets.first.fId}}#";

    return IMSendModel.chat(
      content: content,
      msgType: IMMsgType.file,
      createTime: createTime,
      seq: seq,
      extrasMap: {'asset': assets.map((e) => e.toJson()).toList()},
    );
  }

  /// 消息里的资源数据
  late List<IMAsset>? assets = () {
    if (data['asset'] is List) {
      final list = (data['asset'] as List<dynamic>? ?? []);
      return list
          .map((e) => IMAsset.fromJson(e as Map<String, dynamic>))
          .toList();
    }
  }();
}
