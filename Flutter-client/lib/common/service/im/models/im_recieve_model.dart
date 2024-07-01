import 'package:gogaming_app/common/service/im/models/im_asset.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'im_cmd.dart';
import 'im_msg_type.dart';
import 'im_user_model.dart';

// C10000(10000,"通用处理成功"),
// C10001(10001,"通用处理失败"),
// C10002(10002,"消息发送失败,数据格式不正确"),
// C10003(10003,"获取用户信息成功!"),
// C10004(10004,"获取用户信息失败!"),
// C10005(10005,"获取所有在线用户信息成功!"),
// C10006(10006,"获取所有离线用户信息成功!"),
// C10007(10007,"登录成功!"),
// C10008(10008,"登录失败!"),
// C10009(10009,"用户不在线!"),
// C10010(10010,"鉴权失败!"),
// C10012(10012,"加入群组失败!"),
// C10013(10013,"协议版本号不匹配!"),
// C10014(10014,"不支持的cmd命令!"),
// C10015(10015,"获取用户消息失败!"),
// C10017(10017,"未知的cmd命令!"),
// C10019(10019,"用户在线"),
// C10020(10020,"非法请求!"),
// C10022(10022,"登录失败,token过期!"),
// C10023(10023,"发送消息失败,您已经禁止发言!")
class IMRecieveModel {
  /// WS连接响应
  /// cmd6: 10007,"登录成功!"10008,"登录失败!"10022,"token过期!"
  /// cmd12: 10023发送失败,您已经禁止发言! 10000发送成功
  /// cmd27: 10023禁用 10024解禁
  final int? code;
  final String? msg;

  /// 本地消息id
  final String? seq;
  final dynamic data;

  /// 后端的原始数据
  final Map<String, dynamic> backJson;
  IMRecieveModel({
    required this.command,
    required this.backJson,
    this.code,
    this.msg,
    this.data,
    this.seq,
  });

  factory IMRecieveModel.fromJson(Map<String, dynamic> json) {
    final model = IMRecieveModel(
      command: IMRecieveCommand.c(GGUtil.parseInt(json['command'])),
      code: GGUtil.parseInt(json['code']),
      msg: GGUtil.parseStr(json['msg']),
      data: json['data'],
      seq: GGUtil.parseStr(json['seq']),
      backJson: json,
    );
    return model;
  }

  final IMRecieveCommand command;

  late int? unread = () {
    if (IMRecieveCommand.unread == command && data is Map) {
      return GGUtil.parseInt(data['count']);
    }
  }();

  /// 聊天消息
  late IMRecieveChatModel? recieveChatModel = () {
    if (IMRecieveCommand.chat == command && data != null) {
      return IMRecieveChatModel.fromJson(data as Map<String, dynamic>? ?? {});
    }
  }();

  /// 历史记录
  late List<IMRecieveChatModel>? recieveHisChatModel = () {
    if (IMRecieveCommand.history == command && data != null) {
      final list = (data as List<dynamic>? ?? []);
      return list
          .map((e) => IMRecieveChatModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }
  }();

  /// 离线历史消息
  late List<IMRecieveChatModel>? recieveOfflineHisChatModel = () {
    if (IMRecieveCommand.offlineHistory == command && data != null) {
      final mapData = (data as Map<String, dynamic>? ?? {});
      if (mapData.containsKey('records') && mapData['records'] is List) {
        final list = (mapData['records'] as List<dynamic>? ?? []);
        return list
            .map((e) => IMRecieveChatModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }
  }();

  /// 用户数据 code == 10007 && command == 6 存在数据
  late IMUserModel? user = () {
    if (code == 10007 && command == IMRecieveCommand.loginRes) {
      return IMUserModel.fromJson(backJson['user'] as Map<String, dynamic>);
    }
  }();

  /// 发送成功 服务端的createTime
  late int? createTime = () {
    if (IMRecieveCommand.chatReached == command &&
        10000 == code &&
        data is Map) {
      return GGUtil.parseInt(data['createTime']);
    }
  }();

  /// 用户聊天禁用/解禁
  bool? get isBan =>
      command != IMRecieveCommand.userBan ? null : backJson['muteStatus'] == 1;

  /// 消息里的资源数据
  late List<IMAsset>? assets = () {
    final extras = backJson['data']['extras'];
    if (extras['asset'] is List) {
      final list = (extras['asset'] as List?)
          ?.map((e) => IMAsset.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
      return list;
    }
  }();

  /// 是否触发敏感词
  bool get filterFlag =>
      command == IMRecieveCommand.chatReached && data['filterFlag'] == 1;
  late String? filteredContent = () {
    if (command == IMRecieveCommand.chatReached &&
        data['filteredContent'] is String) {
      return data['filteredContent'] as String;
    }
  }();
}

class IMRecieveChatModel {
  final IMRecieveCommand cmd;

  /// 聊天内容
  final String content;

  /// 消息创建时间long类型
  final num createTime;

  /// 发送消息的uid
  final String from;

  final IMMsgType msgType;

  /// 本地消息id
  final String seq;
  final Map<String, dynamic> backJson;

  IMRecieveChatModel({
    // required this.chatType,
    //     required this.groupId,
    // required this.id,
    required this.cmd,
    required this.content,
    required this.createTime,
    required this.from,
    required this.msgType,
    required this.seq,
    required this.backJson,
  });

  factory IMRecieveChatModel.fromJson(Map<String, dynamic> json) =>
      IMRecieveChatModel(
        backJson: json,
        cmd:
            IMRecieveCommand.c(GGUtil.parseInt(json['cmd'] ?? json['command'])),
        content: GGUtil.parseStr(json['content']),
        createTime: GGUtil.parseInt(json['createTime']),
        from: GGUtil.parseStr(json['from']),
        msgType: IMMsgType.c(GGUtil.parseInt(json['msgType'])),
        seq: GGUtil.parseStr(json['seq']),
      );

  /// 消息里的资源数据
  late List<IMAsset>? assets = () {
    if (backJson['asset'] is List) {
      final list = (backJson['asset'] as List?)
          ?.map((e) => IMAsset.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
      return list;
    }
  }();
}
