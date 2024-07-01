enum IMRecieveCommand {
  /// 6登录响应 code:10007,"登录成功!"10008,"登录失败!"10022,"token过期!"
  loginRes(6),

  /// 11收到/发送聊天消息
  chat(11),

  /// 12聊天消息发到服务器
  /// code 10023发送失败,您已经禁止发言! 10000发送成功
  chatReached(12),

  /// 13聊天心跳包
  heartbeat(13),

  /// 24未读消息数
  unread(24),

  /// 20收到历史记录
  history(20),

  /// 30离线消息
  offlineHistory(30),

  /// 用户禁言
  /// muteStatus 1禁言 2解禁
  userBan(1029),

  /// 未知的消息类型
  unknown(-1);

  const IMRecieveCommand(this.code);

  final int code;

  factory IMRecieveCommand.c(int x) {
    return IMRecieveCommand.values
        .firstWhere((element) => element.code == x, orElse: () => unknown);
  }
}
