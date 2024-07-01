import 'dart:convert';

import 'dart:math';
import 'package:base_framework/base_framework.dart';

import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/im/im_file_upload_queue.dart';
import 'package:gogaming_app/config/config.dart';

import '../datebase/im_database.dart';
import 'im_asset.dart';
import 'im_msg_type.dart';
import 'im_recieve_model.dart';
import 'im_send_model.dart';

enum SendStatus {
  sending,
  success,
  fail,
}

class ChatContentModel {
  /// 会话id
  // String sessionContentId;

  /// 后台消息id
  String msgId;

  /// 本地消息id
  String localId;

  /// 消息分类 聊天/系统/行为
  num model;

  /// 发送消息的uid
  String uid;
  num contentWidth;
  num contentHeight;
  String contentText;

  IMMsgType contentType;

  /// 消息的时间戳
  num timestamp;

  /// 本地文件
  String localFileName;

  /// 是否自己发送
  final bool isSelf;

  /// 是否已读
  bool get hasRead => false;

  /// false 显示时间
  bool isHiddenTime;

  /// 格式化的时间
  String? formatDateTime;

  /// 发送状态
  SendStatus sendStatus;

  /// 发送失败
  bool get isSendError => sendStatus == SendStatus.fail;

  /// 上传或者下载的进度
  double progress;

  /// 上传文件风控
  bool uploadRisk;

  /// 资源文件信息
  List<IMAsset>? assets;

  ChatContentModel({
    required this.isSelf,
    // required this.sessionContentId,
    required this.localId,
    required this.model,
    required this.uid,
    required this.contentWidth,
    required this.contentHeight,
    required this.contentType,
    required this.timestamp,
    this.sendStatus = SendStatus.success,
    this.isHiddenTime = false,
    this.formatDateTime,
    this.msgId = '',
    this.localFileName = '',
    this.contentText = '',
    this.progress = 100,
    this.uploadRisk = false,
    this.assets,
  });

  factory ChatContentModel.fromLocalFile({
    required String sourcePath,
    List<IMAsset>? assets,
    required IMMsgType msgType,
    num contentHeight = 0,
    num contentWidth = 0,
  }) {
    final time = DateTime.now().millisecondsSinceEpoch;
    var rng = Random();
    var number = rng.nextInt(900) + 100; // 生成100到999的随机数
    final localId = '${Config.tenantId}$number$time';

    return ChatContentModel(
      isSelf: true,
      localId: localId,
      model: 1,
      uid: AccountService.sharedInstance.gamingUser?.uid ?? '',
      contentHeight: contentHeight,
      contentWidth: contentWidth,
      contentType: msgType,
      timestamp: time,
      contentText: '',
      sendStatus: SendStatus.sending,
      progress: 0,
      localFileName: sourcePath,
      assets: assets,
    );
  }

  /// 后台数据转换成本地数据
  factory ChatContentModel.fromRecieve(IMRecieveChatModel feed) {
    return ChatContentModel(
      isSelf: feed.from == AccountService.sharedInstance.gamingUser?.uid,
      // sessionContentId: feed.groupId,
      localId: feed.seq,
      model: 1,
      uid: feed.from,
      contentHeight: 100,
      contentWidth: 100,
      contentType: feed.msgType,
      timestamp: feed.createTime,
      contentText: feed.content,
      progress: 100,
      assets: feed.assets,
    );
  }

  /// 发送的数据转换成本地数据
  factory ChatContentModel.fromSend(IMSendModel sender) {
    final feed = IMRecieveChatModel.fromJson(sender.toJson());
    return ChatContentModel(
      isSelf: true,
      // sessionContentId: feed.groupId,
      localId: feed.seq,
      model: 1,
      uid: AccountService.sharedInstance.gamingUser?.uid ?? '',
      contentHeight: 100,
      contentWidth: 100,
      contentType: feed.msgType,
      timestamp: feed.createTime,
      contentText: feed.content,
      sendStatus: SendStatus.sending,
      progress: feed.msgType == IMMsgType.text ? 100 : 0,
      assets: sender.assets,
    );
  }

  /// 后台数据转换成本地数据
  factory ChatContentModel.fromDatabase(ChatContentEntry entry) {
    return ChatContentModel(
      isSelf: entry.uid == AccountService.sharedInstance.gamingUser?.uid,
      // sessionContentId: feed.groupId,
      localId: entry.localId,
      model: 1,
      uid: entry.uid,
      contentHeight: entry.contentHeight,
      contentWidth: entry.contentWidth,
      contentType: IMMsgType.c(entry.msgType),
      timestamp: entry.timestamp,
      contentText: entry.contentText,
      sendStatus: entry.sendStatus,
      progress: entry.msgType == 0
          ? 100
          : IMFileUploadQueue.sharedInstance.getTaskProgress(entry.localId),
      localFileName: entry.localFileName,
      uploadRisk: entry.uploadRisk,
      assets: entry.assets == null
          ? null
          : (json.decode(entry.assets!) as List?)
              ?.map(
                  (e) => IMAsset.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList(),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ChatContentModel && other.localId == localId;
  }

  @override
  int get hashCode => Object.hash(localId, localId);

  String get localNoticeText {
    switch (contentType) {
      case IMMsgType.text:
      case IMMsgType.unknown:
        return contentText;
      case IMMsgType.image:
        return '[IMAGE]';
      case IMMsgType.video:
        return '[VIDEO]';
      case IMMsgType.file:
        return '[FILE]';
      case IMMsgType.textAndImage:
        final reg = RegExp(
          r'#{\d+}#',
          caseSensitive: false,
          dotAll: true,
        );
        // 使用 RegExp 对象的 allMatches 方法来找到所有的匹配项
        var text = contentText;
        // 使用 RegExp 对象的 allMatches 方法来找到所有的匹配项
        final matches = reg.allMatches(text).toList();
        String spans = '';

        int start = 0;

        // 遍历所有的匹配项
        for (var match in matches) {
          // 添加匹配项之前的文本
          spans += text.substring(start, match.start);

          // 添加匹配项，并将其高亮显示
          final fId = text.substring(match.start + 2, match.end - 2);
          final asset =
              assets?.firstWhereOrNull((element) => element.fId == fId);
          String? child;
          if (asset?.url?.isNotEmpty == true) {
            if (asset?.isImage ?? false) {
              child = '[IMAGE]';
            } else if (asset?.isVideo ?? false) {
              child = '[VIDEO]';
            } else if (asset?.isPDF ?? false) {
              child = '[FILE]';
            }
            if (child != null) {
              spans += child;
            }
          }
          start = match.end;
        }

        // 添加最后一个匹配项之后的文本
        spans += text.substring(start);
        return spans;
    }
  }
}
