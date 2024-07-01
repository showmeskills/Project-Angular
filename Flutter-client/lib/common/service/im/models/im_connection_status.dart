enum IMConnectionStatus {
  /// -1 初始化
  init,

  /// 0 正在连接
  connecting,

  /// 1 连接失败
  connectFailed,

  /// 2 已断开
  disconnected,

  /// 3 已连接
  connected;

  bool get isConnected {
    return this == IMConnectionStatus.connected;
  }

  bool get isDisconnected {
    return this == IMConnectionStatus.disconnected ||
        this == IMConnectionStatus.connectFailed;
  }
}
