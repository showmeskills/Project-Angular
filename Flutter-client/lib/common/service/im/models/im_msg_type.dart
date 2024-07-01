enum IMMsgType {
  text(0),
  image(1),
  video(3),
  file(7),
  textAndImage(8),

  /// 未知的消息类型
  unknown(-1);

  const IMMsgType(this.value);

  final int value;

  factory IMMsgType.c(int x) {
    return IMMsgType.values
        .firstWhere((element) => element.value == x, orElse: () => unknown);
  }
}
