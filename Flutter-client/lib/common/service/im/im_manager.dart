import 'dart:async';
import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/im/im_api.dart';
import 'package:gogaming_app/common/service/PlatformNotifier/local_notifier.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/helper/device_util.dart';

import 'datebase/im_database_service.dart';
import 'im_send_queue.dart';
import 'im_socket.dart';
import 'models/chat_content_model.dart';
import 'models/im_asset.dart';
import 'models/im_cmd.dart';
import 'models/im_connection_status.dart';
import 'models/im_msg_type.dart';
import 'models/im_recieve_model.dart';
import 'models/im_send_model.dart';
import 'models/im_user_model.dart';

class IMManager {
  static final IMManager _signalrProvider = IMManager._internal();
  factory IMManager() => _signalrProvider;

  late final IMSocket _socket = IMSocket(
    serverUrl: Config.sharedInstance.imUrl,
    onRecieve: _onRecieve,
    keepAliveEvent: _keepAlive,
    onStatusChange: _onStatusChange,
  );

  IMManager._internal();

  var _histCompleter = Completer<List<ChatContentModel>>();

  /// im链接状态
  late final _connectionStatus = _socket.wsStatus.obs;
  IMConnectionStatus get connectionStatus => _connectionStatus.value;
  Stream<IMConnectionStatus> get connectionStatusStream =>
      _connectionStatus.stream;

  /// 对应cmd=12接收到消息 value对应本地id
  final msgDelivered = StreamController<IMRecieveModel>.broadcast();

  /// 负责消息的刷新 成功/失败/上传进度/下载进度等
  /// value 对应消息的id
  final msgUpdate = StreamController<String>.broadcast();

  /// 对应cmd=11接收到聊天消息
  final chatRecieved = StreamController<ChatContentModel>.broadcast();

  /// 对应cmd=1029 1030 接收到用户禁言和解禁
  final userBan = false.obs;

  /// 未读消息数量 默认-1
  final unReadNum = RxInt(-1);

  /// 是否显示入口
  final access = false.obs;

  /// 是否需要更新未读消息数
  bool _unReadNeedUpdate = true;

  String? accessToken;
  bool _backgroundMode = false;

  /// 初始化
  void setup() {
    // 监听用户更新
    final cacheUser = AccountService.sharedInstance.cacheUser;
    cacheUser.getBox!().listenKey(cacheUser.key, (value) {
      if (AccountService.sharedInstance.isLogin) {
        openConnection();
      } else {
        //退出登录断开链接
        _socket.closeConnection();
      }
    });
  }

  Future<bool> backgroundMode() async {
    if (_connectionStatus.value != IMConnectionStatus.connected) {
      await _socket.closeConnection();
      await _socket.openConnection();
    }
    _backgroundMode = true;
    return Future.value(true);
  }

  void appResumed() {
    _backgroundMode = false;
  }

  void paused() {
    _backgroundMode = true;
  }

  ///登录开始链接
  void openConnection() {
    generateToken().listen((event) {
      if (event != null) {
        accessToken = event;
        // type: 1 用户角色 2:运营角色
        final serverUrl = '${Config.sharedInstance.imUrl}?type=1&token=$event';
        _socket.serverUrl = serverUrl;
        _socket.openConnection();
      }
    }, onError: (Object e) {
      log('获取 im token失败: $e', name: 'IMSocket');
      _socket.setWsStatus(IMConnectionStatus.connectFailed);
    });
  }

  void _onStatusChange(IMConnectionStatus status) {
    _connectionStatus.value = status;
    if (status.isDisconnected) {
      IMSendQueue.sharedInstance.clear();
    } else if (status.isConnected) {
      // 重连成功后，重新发送队列中的消息
      // 服务端不支持，暂时注释
      // IMSendQueue.sharedInstance.resume();
    }
  }

  /// 处理后台返回数据
  void _onRecieve(IMRecieveModel recieveModel) {
    final recieveCmd = recieveModel.command;
    switch (recieveCmd) {
      case IMRecieveCommand.chat:
        _handleChat(recieveModel);
        break;
      case IMRecieveCommand.history:
        _handleHistory(recieveModel);
        break;
      case IMRecieveCommand.offlineHistory:
        _handleOfflineHistory(recieveModel);
        break;
      case IMRecieveCommand.loginRes:
        _handleLoginRes(recieveModel);
        break;
      case IMRecieveCommand.chatReached:
        _handleChatReached(recieveModel);
        break;
      case IMRecieveCommand.userBan:
        _handleUserBan(recieveModel.isBan ?? false);
        break;
      case IMRecieveCommand.heartbeat:
      case IMRecieveCommand.unknown:
        break;
      case IMRecieveCommand.unread:
        _handleUnread(recieveModel);
        break;
    }
  }

  void _handleUnread(IMRecieveModel recieveModel) {
    if (recieveModel.unread is int) {
      unReadNum.value = recieveModel.unread!;
      _unReadNeedUpdate = false;
    }
  }

  void _handleUserBan(bool isBan) {
    userBan.value = isBan;
  }

  void _handleChatReached(IMRecieveModel recieveModel) {
    // 收到聊天消息回传
    final seq = recieveModel.seq;
    if (seq != null) {
      msgDelivered.sink.add(recieveModel);
      IMSendQueue.sharedInstance.complete(recieveModel);
    }
  }

  void _handleLoginRes(IMRecieveModel recieveModel) {
    if (recieveModel.code == 10022) {
      _handleTokenExpired();
    } else if (recieveModel.user is IMUserModel) {
      _handleUserBan(recieveModel.user!.isBan);
    }
    _unReadNeedUpdate = true;
    _getUnreadNum();
  }

  void _handleTokenExpired() {
    // token过期 断开连接再次获取token去重连
    _socket.closeConnection().timeout(
      const Duration(seconds: 3),
      onTimeout: () {
        openConnection();
      },
    ).then((value) {
      openConnection();
    });
  }

  void _handleChat(IMRecieveModel recieveModel) {
    // 收到聊天消息
    final chatModel = recieveModel.recieveChatModel;
    if (chatModel != null) {
      final model = ChatContentModel.fromRecieve(chatModel);
      IMDatabaseService.sharedInstance.insertOrUpdateEntry(model);
      chatRecieved.sink.add(model);
      log('发送 im 消息: ${model.localNoticeText}', name: 'IMSocket');
      if (_backgroundMode) {
        LocalNotifier().showNormalNotiofication(model.localNoticeText);
      }
      // 收到消息 未读数加一
      unReadNum.value += 1;
    }
  }

  /// 接收到历史记录消息
  void _handleHistory(IMRecieveModel recieveModel) {
    if (!_histCompleter.isCompleted) {
      final models = recieveModel.recieveHisChatModel?.map((e) {
        return ChatContentModel.fromRecieve(e);
      }).toList();
      if ((models?.isNotEmpty ?? false)) {
        IMDatabaseService.sharedInstance.insertMultipleEntries(models ?? []);
      }
      _histCompleter.complete(models ?? []);
    }
  }

  /// 接收到离线历史记录消息
  void _handleOfflineHistory(IMRecieveModel recieveModel) {
    if (!_histCompleter.isCompleted) {
      final models = recieveModel.recieveOfflineHisChatModel?.map((e) {
        return ChatContentModel.fromRecieve(e);
      }).toList();
      IMDatabaseService.sharedInstance.getLastEntry().then((value) {
        /// 过滤掉数据库中已存在最后一条数据返回
        final filteredModels = models?.where((element) {
          return element.localId != value?.localId;
        }).toList();
        if ((models?.isNotEmpty ?? false)) {
          IMDatabaseService.sharedInstance
              .insertMultipleEntries(filteredModels ?? []);
        }
        _histCompleter.complete(filteredModels ?? []);
      });
    }
  }

  void send({required IMSendModel sendModel}) {
    _socket.send(args: sendModel.toJson());
  }

  /// 获取离线消息
  Stream<List<ChatContentModel>> getOfflineChatHis() {
    if (_histCompleter.isCompleted) {
      _histCompleter = Completer<List<ChatContentModel>>();
    }
    IMDatabaseService.sharedInstance.getLastEntry().then((value) {
      if (value != null) {
        final time = DateTime.now().millisecondsSinceEpoch;
        send(
          sendModel: IMSendModel.offlineHistory(
            size: 9999,
            beginTime: value.timestamp,
            endTime: time,
          ),
        );
      }
    });
    return _histCompleter.future.asStream();
  }

  /// 获取历史记录
  Stream<List<ChatContentModel>> getChatHis(num? endTime, {int pageSize = 20}) {
    if (_histCompleter.isCompleted) {
      _histCompleter = Completer<List<ChatContentModel>>();
    }
    if (endTime == null) {
      // 如果数据库中没有数据则请求历史记录
      IMDatabaseService.sharedInstance.getLastEntry().then((value) {
        if (value == null) {
          send(
            sendModel: IMSendModel.history(lastTime: endTime, count: pageSize),
          );
        } else {
          IMDatabaseService.sharedInstance
              .selectEntriesByAscendingOrder(
                  endTime: endTime?.toInt(), limit: pageSize)
              .then((value) {
            _histCompleter.complete(value);
          });
        }
      });
    } else {
      IMDatabaseService.sharedInstance
          .selectEntriesByAscendingOrder(
              endTime: endTime.toInt(), limit: pageSize)
          .then((value) {
        if (value.isNotEmpty) {
          _histCompleter.complete(value);
        } else {
          send(
            sendModel: IMSendModel.history(lastTime: endTime, count: pageSize),
          );
        }
      });
    }
    return _histCompleter.future.asStream();
  }

  /// 发送视频消息
  IMSendModel getSendVideoModel({
    required IMAsset cover,
    required IMAsset video,
    num? createTime,
    String? seq,
  }) {
    final sendModel = IMSendModel.video(
      cover: cover,
      video: video,
      seq: seq,
    );
    return sendModel;
  }

  /// 获取发送文件的数据
  /// seq消息id 由于需要先上屏 所以先创建消息id
  /// name文件名 ext文件后缀 size bt单位的文件大小
  IMSendModel getSendFileModel(
    String seq,
    String fid,
    num size,
    String name,
    String ext,
  ) {
    final sendModel = IMSendModel.file(
      assets: [IMAsset(fId: fid, name: name, type: ext, size: size)],
      // isPDF: ext.toUpperCase().contains('PDF'),
      isPDF: false,
    );
    sendModel.setSeq(seq);
    return sendModel;
  }

  IMSendModel getSendImageModel({
    required String seq,
    required num createTime,
    required IMAsset asset,
  }) {
    final sendModel = IMSendModel.image(
      asset: [asset],
      createTime: createTime,
      seq: seq,
    );
    return sendModel;
  }

  /// 发送文字消息
  IMSendModel getSendTextModel({
    required String text,
    String? seq,
    num? createTime,
  }) {
    final time = createTime ?? DateTime.now().millisecondsSinceEpoch;
    final sendModel = IMSendModel.chat(
      createTime: time,
      content: text,
      msgType: IMMsgType.text,
      seq: seq,
    );
    return sendModel;
  }

  /// 保持心跳
  void _keepAlive() {
    _socket.send(args: IMSendModel.live().toJson());
    _getUnreadNum();
  }

  void _getUnreadNum() {
    if (_unReadNeedUpdate) {
      _socket.send(args: IMSendModel.getUnreadNum().toJson());
    }
  }

  // ignore: unused_element
  void _sendDebugMsg() {
    // final time = DateTime.now().millisecondsSinceEpoch;
    // time = 1710134118884;
    // getSendChatModel('你好 time: $time');
    getChatHis(null).listen((event) {
      debugPrint('getChatHis: $event');
    });
  }

  /// 获取im token
  Stream<String?> generateToken() {
    final stream = DeviceUtil.getSystemVersion().asStream().flatMap((value) {
      final isios = value.contains('iOS');
      final config = Config.currentConfig;
      return PGSpi(ImAPI.generateToken.toTarget(inputData: {
        "appId": isios ? config.imIosAppid : config.imAndriodAppid,
        "appSecret": isios ? config.imIosAppSecret : config.imAndriodAppSecret,
        "deviceType": isios ? 3 : 2, // 0未知1WEB 2安卓 3IOS
        "uid": AccountService.sharedInstance.gamingUser?.uid ?? '',
      })).rxRequest<String?>(
        (value) {
          final data = value['data'];
          if (data is Map<String, dynamic>) {
            final accesstoken = data['accesstoken']?.toString();
            final isWhiteList = data['access'] == true;
            access.value = isWhiteList;
            return accesstoken;
          } else {
            return null;
          }
        },
      ).flatMap((value) => Stream.value(value.data));
    });
    return stream;
  }

  /// 标记所有消息已读
  /// 进入聊天页面｜页面滑倒底部时调用
  void allMsgRead() {
    unReadNum.value = 0;
    _socket.send(args: IMSendModel.setMsgRead().toJson());
  }
}
