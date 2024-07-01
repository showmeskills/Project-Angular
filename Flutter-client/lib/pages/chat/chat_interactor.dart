import 'dart:async';
import 'dart:io';
import 'dart:math';
import 'dart:developer' as dev;

import 'package:flutter/widgets.dart' hide ImageInfo;
import 'package:gogaming_app/common/api/base/go_gaming_response.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/im/im_file_manager.dart';
import 'package:gogaming_app/common/service/im/im_file_upload_queue.dart';
import 'package:gogaming_app/common/service/im/im_manager.dart';
import 'package:gogaming_app/common/service/im/im_send_queue.dart';
import 'package:gogaming_app/common/service/im/im_util.dart';
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/common/service/im/models/im_asset.dart';
import 'package:gogaming_app/common/service/im/models/im_connection_status.dart';
import 'package:gogaming_app/common/service/im/models/im_msg_type.dart';
import 'package:gogaming_app/common/service/im/models/im_recieve_model.dart';
import 'package:gogaming_app/common/service/im/models/im_send_model.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:intl/intl.dart';
import 'package:media_asset_utils/media_asset_utils.dart';
import 'package:path/path.dart' as p;

import '../../common/service/im/datebase/im_database_service.dart';
import '../../common/service/im/models/im_cmd.dart';
import 'chat_state.dart';

part 'interactor_extension/chat_interactor_extension.dart';
part 'interactor_extension/image.dart';
part 'interactor_extension/file.dart';
part 'interactor_extension/chat_interactor_video.dart';

// manager，service
class ChatInteractor {
  ChatInteractor() {
    state.connectionStatus = imManager.connectionStatus;
    setUserBan(imManager.userBan.value);
  }

  final imManager = IMManager();
  late final fileManager =
      IMFileManager(subDirectory: AccountService().lastLoginUid ?? '0');
  final state = ChatState();

  Stream<IMConnectionStatus> get connectionStatus =>
      imManager.connectionStatusStream;

  Stream<ChatContentModel> get recievedStream => imManager.chatRecieved.stream;

  Stream<String> get msgUpdateStream => imManager.msgUpdate.stream;

  Stream<bool> get userBanStream => imManager.userBan.stream;
  int? endTime;

  bool get hasUnreadMsg => imManager.unReadNum.value > 0;

  Stream<List<ChatContentModel>> getMsgInit() {
    // 如果数据库中没有数据则请求历史记录
    return IMDatabaseService.sharedInstance
        .getLastEntry()
        .asStream()
        .flatMap((value) {
      if (value == null) {
        return getChatHis();
      } else {
        return getChatHis()
            .flatMap((his) => getOfflineHis().map((offline) => his + offline));
      }
    });
  }

  Stream<List<ChatContentModel>> getChatHis() {
    return imManager.getChatHis(endTime, pageSize: 20).doOnData((event) {
      _handleIMData(event);
    });
  }

  Stream<List<ChatContentModel>> getOfflineHis() {
    return imManager.getOfflineChatHis().doOnData((event) {
      _handleIMData(event, insert: true);
    });
  }

  void _handleIMData(List<ChatContentModel> event, {bool insert = false}) {
    List<ChatContentModel> list = [];
    // 收到的消息 [8, 9, 10]
    for (var e in event) {
      // 判断新加入的消息时间显示格式
      // 第一次循环数据是8，list为空，所以直接显示时间
      // 第二次循环数据是9，list被反转成为[8]，和list中的first 也就是8进行时间判断
      // 第三次循环数据是10，list被反转成为[9, 8]，和list中的first 也就是9进行时间判断
      list.add(_handleTimeField(list.reversed.toList(), e));
    }
    // 原有消息顺序 13, 12, 11
    // 反转list并追加到state.data中变为[13, 12, 11, 10, 9, 8]
    insert
        ? state.data.insertAll(0, list.reversed)
        : state.data.addAll(list.reversed);
    if (state.data.isNotEmpty) {
      state.data = state.data.toSet().toList();
      endTime = state.data.last.timestamp.toInt();
    }
  }

  Stream<String?> sendText(String text) {
    final sendModel = imManager.getSendTextModel(text: text);
    final contentModel = sendMsgToScreen(ChatContentModel.fromSend(sendModel));
    _sendMsgToIM(sendModel).listen((event) {
      // 处理敏感词逻辑
      _handleSensitiveWords(event, contentModel);
    }, onError: (err) {});
    return Stream.value(null);
  }

  Stream<String?> reSendText(ChatContentModel contentModel) {
    final sendModel = imManager.getSendTextModel(
      text: contentModel.contentText,
      createTime: contentModel.timestamp,
      seq: contentModel.localId,
    );
    sendMsgToScreen(ChatContentModel.fromSend(sendModel));
    _sendMsgToIM(sendModel).listen((event) {
      _handleSensitiveWords(event, contentModel);
    }, onError: (err) {});
    return Stream.value(null);
  }

  void _handleSensitiveWords(
      IMRecieveModel? event, ChatContentModel contentModel) {
    // 处理敏感词逻辑
    if (event?.filterFlag == true &&
        event!.filteredContent?.isNotEmpty == true) {
      contentModel.contentText = event.filteredContent!;
      final oldHeight = contentModel.contentHeight;
      contentModel.contentHeight = IMUtil.calcMessageHeight(contentModel) ?? 0;
      final localId = contentModel.localId;
      // 高度变化刷新整个列表 不变就刷新单行
      if (oldHeight == contentModel.contentHeight) {
        imManager.msgUpdate.sink.add(localId);
      } else {
        imManager.msgUpdate.sink.add('');
      }
      IMDatabaseService.sharedInstance.updateEntry(
        localId: localId,
        contentText: contentModel.contentText,
      );
    }
  }

  /// 创建本地消息🤢发送到屏幕上
  ChatContentModel sendMsgToScreen(ChatContentModel model) {
    final isDisconnected = imManager.connectionStatus.isDisconnected;
    // 是否要忽略滚动，如果数据为空，使用jump会出现异常
    final bool ignoreScroll = state.data.isEmpty;
    // 如果断开连接，直接显示发送失败
    if (isDisconnected) {
      model.sendStatus = SendStatus.fail;
    }
    IMDatabaseService.sharedInstance.insertOrUpdateEntry(model);
    state.data.insert(0, _handleTimeField(state.data, model));
    // endTime ??= state.data.last.timestamp.toInt();
    state.inputController.textController.clear();
    if (!ignoreScroll) {
      state.listViewController.sliverController.jumpToIndex(0);
    }
    return model;
  }

  /// 发送消息给im
  Stream<IMRecieveModel?> _sendMsgToIM(IMSendModel sendModel) {
    final isDisconnected = imManager.connectionStatus.isDisconnected;
    if (isDisconnected) {
      return Stream.value(null);
    }
    return IMSendQueue.sharedInstance.add(sendModel).flatMap((value) {
      delivered(
        seq: value.seq!,
        sendStatus: value.code == 10000 ? SendStatus.success : SendStatus.fail,
        timestamp: value.createTime,
      );
      if (value.code == 10025) {
        //消息发送太频繁 触发限流
        Toast.showFailed(localized('im_frequency_limit'));
      }
      return Stream.value(value);
    }).onErrorResume((error, stackTrace) {
      delivered(seq: sendModel.seq!, sendStatus: SendStatus.fail);
      return Stream.value(IMRecieveModel(
        command: IMRecieveCommand.chat,
        seq: sendModel.seq,
        backJson: {},
      ));
    });
  }

  void resend(ChatContentModel model) {
    final index =
        state.data.indexWhere((element) => element.localId == model.localId);
    if (index != -1) {
      state.data.removeAt(index);
      if (model.contentType == IMMsgType.image) {
        reSendImage(model);
      } else if (model.contentType == IMMsgType.file) {
        reSendFile(model);
      } else if (model.contentType == IMMsgType.video) {
        reSendVideo(model);
      } else {
        reSendText(model);
      }
    }
  }

  void received(ChatContentModel model) {
    state.data.insert(0, _handleTimeField(state.data, model));
    if (state.data.isNotEmpty) {
      endTime ??= state.data.first.timestamp.toInt();
    }
  }

  void delivered({
    required String seq,
    SendStatus sendStatus = SendStatus.success,
    bool? uploadRisk,
    int? timestamp,
  }) {
    IMDatabaseService.sharedInstance.updateEntry(
      localId: seq,
      sendStatus: sendStatus,
      uploadRisk: uploadRisk,
      timestamp: timestamp,
    );
    final index = state.data.indexWhere((element) => element.localId == seq);
    if (index != -1) {
      state.data[index].sendStatus = sendStatus;
      if (uploadRisk != null) {
        state.data[index].uploadRisk = uploadRisk;
      }
      if (timestamp != null) {
        state.data[index].timestamp = timestamp;
        endTime ??= state.data.first.timestamp.toInt();
      }
    }
    imManager.msgUpdate.sink.add(seq);
  }

  void onConnectionStatusChange(IMConnectionStatus status) {
    if (status != IMConnectionStatus.connecting) {
      state.connectionStatus = status;
    } else {
      // 如果记录的状态是连接失败，传入的最新status是未连接则不更新
      if (!state.connectionStatus.isDisconnected) {
        state.connectionStatus = status;
      }
    }
  }

  ChatContentModel _handleTimeField(
      List<ChatContentModel> list, ChatContentModel model) {
    final current =
        DateTime.fromMillisecondsSinceEpoch(model.timestamp.toInt());

    if (list.isEmpty) {
      model.isHiddenTime = false;
      model.formatDateTime = model.toChatTime(current);
    } else {
      final last =
          DateTime.fromMillisecondsSinceEpoch(list.first.timestamp.toInt());

      model.formatDateTime = model.toChatTime(current);
      model.isHiddenTime = model.hideTime(current, last);
    }
    model.contentHeight = IMUtil.calcMessageHeight(model) ?? 0;
    return model;
  }

  void setUserBan(bool event) {
    state.hasPermission = !event;
  }

  void setAllMsgRead() {
    imManager.allMsgRead();
  }

  void setup() {
    state.listViewController.sliverController.onPaintItemPositionsCallback =
        (widgetHeight, positions) {
      state.positions = positions;
    };
  }

  void hideKeyboard() {
    state.keyboardHeight = 0;
  }

  void setKeyboardHeight(double height) {
    if (state.keyboardHeight != height) {
      state.keyboardHeight = height;
    }
  }

  void showExtension() {
    if (!state.showExtension) {
      state.showExtension = true;
    }
    hideEmoji();
  }

  void hideExtension() {
    if (state.showExtension) {
      state.showExtension = false;
    }
  }

  void showEmoji() {
    if (!state.showEmoji) {
      state.showEmoji = true;
    }
    hideExtension();
  }

  void hideEmoji() {
    if (state.showEmoji) {
      state.showEmoji = false;
    }
  }

  void insertEmoji(String emoji) {
    final textController = state.inputController.textController;
    final text = textController.text;
    final selection = textController.selection;
    final newText = text.replaceRange(
        max(selection.start, 0), max(selection.end, 0), emoji);
    textController.value = TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(
          offset: max(selection.baseOffset, 0) + emoji.length),
    );
  }
}

extension ChatContentModelExtension on ChatContentModel {
  /// 1. 当消息发送时间在同一天内时：
  ///
  /// - 如果消息是在同一小时内，但不在同一分钟内发送的，只显示小时和分钟。
  ///
  /// - 如果消息是在同一天内，但不在同一小时内发送的，显示小时和分钟。
  ///
  /// 2. 当消息发送时间不在同一天时：
  ///
  /// - 如果消息发送时间距离当前时间在一天以上
  ///
  /// - 昨天 15:45
  ///
  /// - 前天 08:20
  ///
  /// - 2024年02月28日 10:00。
  ///
  /// 3. 时间间隔10分钟，小于10分钟不显示时间
  String? toChatTime(DateTime current) {
    final now = DateTime.now();
    String? suffix;
    String format = 'yyyy-MM-dd HH:mm';
    if (now.year == current.year && now.month == current.month) {
      // 同一天
      if (now.day == current.day) {
        format = 'HH:mm';
      } else {
        // 昨天
        if ((current.day - now.day).abs() == 1) {
          suffix = '${localized('msg_ystd')} ';
          format = 'HH:mm';
        }
      }
    }
    return (suffix ?? '') + DateFormat(format).format(current);
  }

  bool hideTime(DateTime current, DateTime baseTime) {
    if (current.difference(baseTime).inSeconds.abs() < 10 * 60) {
      return true;
    }
    return false;
  }
}
