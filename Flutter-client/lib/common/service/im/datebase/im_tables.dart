import 'package:drift/drift.dart';
import '../models/chat_content_model.dart';

@DataClassName('ChatContentEntry')
class ChatContentItems extends Table {
  @override
  Set<Column> get primaryKey => {localId};

  /// 后台消息id
  TextColumn get msgId => text()();

  /// 本地消息id
  TextColumn get localId => text()();

  /// 消息分类 聊天/系统/行为
  IntColumn get model => integer()();

  /// 发送消息的uid
  TextColumn get uid => text()();

  /// 图片内容大小，预留
  IntColumn get contentWidth => integer()();
  IntColumn get contentHeight => integer()();

  /// 聊天内容
  TextColumn get contentText => text()();

  /// 消息类型int类型(0:text、1:image、2:voice、3:vedio、4:music、5:news)
  IntColumn get msgType => integer()();

  /// 消息创建时间long类型
  IntColumn get timestamp => integer()();

  /// 文件对应本地地址
  TextColumn get localFileName => text()();

  /// 消息发送状态
  IntColumn get sendStatus => integer().map(const SendStatusConverter())();

  /// 是否已读
  BoolColumn get hasRead => boolean().withDefault(const Constant(false))();

  /// 上传文件风控
  BoolColumn get uploadRisk => boolean().withDefault(const Constant(false))();

  /// 消息里的资源数据 jsonString格式
  TextColumn get assets => text().nullable()();
}

class SendStatusConverter extends TypeConverter<SendStatus, int> {
  const SendStatusConverter();

  @override
  SendStatus fromSql(int fromDb) {
    if (fromDb == 0) {
      return SendStatus.sending;
    } else if (fromDb == 1) {
      return SendStatus.success;
    }
    return SendStatus.fail;
  }

  @override
  int toSql(SendStatus value) {
    if (value == SendStatus.sending) {
      return 0;
    } else if (value == SendStatus.success) {
      return 1;
    }
    return 2;
  }
}
