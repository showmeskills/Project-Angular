class GGIntervalList<T> {
  GGIntervalList({required this.duration});

  /// 数据发送的间隔时间
  final Duration duration;
  final List<T> _list = [];
  late final stream = Stream<T?>.periodic(duration, (_) {
    if (_list.isNotEmpty) {
      final value = _list.first;
      _list.removeAt(0);
      return value;
    }
    return null;
  }).takeWhile((element) => _isRuning);
  bool _isRuning = true;

  void add(T value) {
    _list.add(value);
  }

  void reset() {
    _list.clear();
  }

  void complete() {
    _isRuning = false;
  }
}

class GGIntervalList2<T> {
  GGIntervalList2({required this.duration});

  /// 数据发送的间隔时间
  final Duration duration;

  late final stream = Stream<List<T>>.periodic(duration, (_) {
    final value = List<T>.from(_list);
    _list.clear();
    return value;
  }).takeWhile((element) => _isRuning);

  final List<T> _list = [];

  bool _isRuning = true;

  void add(T value) {
    _list.add(value);
  }

  void reset() {
    _list.clear();
  }

  void complete() {
    _isRuning = false;
  }
}
