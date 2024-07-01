import 'dart:async';

import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/im/models/im_asset.dart';
import 'package:gogaming_app/common/service/restart_service.dart';
import 'package:drift/drift.dart';
import 'package:gogaming_app/common/service/im/datebase/im_database.dart';

import '../models/chat_content_model.dart';

class IMDatabaseService extends RestartServiceInterface {
  factory IMDatabaseService() => _getInstance();

  static IMDatabaseService get sharedInstance => _getInstance();

  static IMDatabaseService? _instance;

  static IMDatabaseService _getInstance() {
    _instance ??= IMDatabaseService._internal();
    return _instance!;
  }

  late final AppDatabase _database;

  IMDatabaseService._internal() {
    _database = AppDatabase();
  }

  void reInit() {
    _database.close();
    _instance = null;
  }

  /// 批量插入
  Future<void> insertMultipleEntries(List<ChatContentModel> entries) async {
    await _database.batch((batch) {
      List<ChatContentItemsCompanion> datas = <ChatContentItemsCompanion>[];
      for (ChatContentModel model in entries) {
        datas.add(
          ChatContentItemsCompanion.insert(
            localId: model.localId,
            timestamp: model.timestamp.toInt(),
            sendStatus: model.sendStatus,
            msgId: model.msgId,
            model: model.model.toInt(),
            uid: model.uid,
            contentWidth: model.contentWidth.toInt(),
            contentHeight: model.contentHeight.toInt(),
            contentText: model.contentText,
            msgType: model.contentType.value,
            localFileName: model.localFileName,
            uploadRisk: Value(model.uploadRisk),
            assets: Value(model.assets.toString()),
          ),
        );
      }
      batch.insertAllOnConflictUpdate(
        _database.chatContentItems,
        datas,
      );
    });
  }

  /// 插入单条数据
  Future<ChatContentModel> insertOrUpdateEntry(ChatContentModel model) async {
    final entry = ChatContentEntry(
      localId: model.localId,
      timestamp: model.timestamp.toInt(),
      sendStatus: model.sendStatus,
      msgId: model.msgId,
      model: model.model.toInt(),
      uid: model.uid,
      contentWidth: model.contentWidth.toInt(),
      contentHeight: model.contentHeight.toInt(),
      contentText: model.contentText,
      msgType: model.contentType.value,
      localFileName: model.localFileName,
      uploadRisk: model.uploadRisk,
      assets: model.assets.toString(),
      hasRead: false,
    );
    await _database.into(_database.chatContentItems).insertOnConflictUpdate(
          entry,
        );
    return Future.value(
      ChatContentModel.fromDatabase(entry),
    );
  }

  /// 根据 localId 更新数据
  Future<ChatContentModel> updateEntry({
    required String localId,
    String? msgId,
    num? timestamp,
    SendStatus? sendStatus,
    num? model,
    String? uid,
    num? contentWidth,
    num? contentHeight,
    String? contentText,
    int? msgType,
    String? localFileName,
    bool? uploadRisk,
    List<IMAsset>? assets,
  }) async {
    final where = _database.update(_database.chatContentItems)
      ..where((t) => t.localId.like(localId));
    final row = await where.writeReturning(
      ChatContentItemsCompanion(
        localId: Value(localId),
        msgId: msgId == null ? const Value.absent() : Value(msgId),
        timestamp:
            timestamp == null ? const Value.absent() : Value(timestamp.toInt()),
        sendStatus:
            sendStatus == null ? const Value.absent() : Value(sendStatus),
        model: model == null ? const Value.absent() : Value(model.toInt()),
        uid: uid == null ? const Value.absent() : Value(uid),
        contentWidth: contentWidth == null
            ? const Value.absent()
            : Value(contentWidth.toInt()),
        contentHeight: contentHeight == null
            ? const Value.absent()
            : Value(contentHeight.toInt()),
        contentText:
            contentText == null ? const Value.absent() : Value(contentText),
        msgType: msgType == null ? const Value.absent() : Value(msgType),
        localFileName:
            localFileName == null ? const Value.absent() : Value(localFileName),
        uploadRisk:
            uploadRisk == null ? const Value.absent() : Value(uploadRisk),
        assets: assets == null
            ? const Value.absent()
            : Value(IMAsset.toListJson(assets)),
      ),
    );
    return Future.value(
      ChatContentModel.fromDatabase(row.first),
    );
  }

  /// 查询数据
  Future<List<ChatContentModel>> selectEntriesByAscendingOrder({
    int limit = 20,
    int? endTime,
  }) async {
    final select = _database.select(_database.chatContentItems)
      ..where(
        (a) => a.timestamp.isSmallerThanValue(
          endTime ?? DateTime.now().millisecondsSinceEpoch.toInt(),
        ),
      )
      ..orderBy([
        (t) => OrderingTerm(
              expression: t.timestamp,
              mode: OrderingMode.desc,
            )
      ])
      ..limit(limit);
    final rows = await select.get();
    final result = rows.map((e) => ChatContentModel.fromDatabase(e)).toList();
    return Future.value(result.reversed.toList());
  }

  /// 更新所有发送中的消息为发送失败
  void updateAllEntriesSendStatus() {
    if (!AccountService.sharedInstance.isLogin) {
      return;
    }

    _database.update(_database.chatContentItems)
      ..where((tbl) => tbl.sendStatus.equals(0))
      ..write(
        const ChatContentItemsCompanion(
          sendStatus: Value(SendStatus.fail),
        ),
      );
  }

  /// 获取数据库中最新的一条消息
  Future<ChatContentModel?> getLastEntry() async {
    final select = _database.select(_database.chatContentItems)
      ..orderBy([
        (t) => OrderingTerm(
              expression: t.timestamp,
              mode: OrderingMode.desc,
            )
      ])
      ..limit(1);
    final result = await select.get();
    return (result.isEmpty)
        ? null
        : ChatContentModel.fromDatabase(result.first);
  }

  @override
  void onClose() {
    _instance = null;
  }
}
