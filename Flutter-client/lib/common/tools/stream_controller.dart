import 'dart:async';

class GGStreamController {
  static Timer? _debounceTimer;

  /// 防抖
  static void debounce(Function func, {int delay = 200}) {
    if (_debounceTimer != null) {
      _debounceTimer?.cancel();
    }
    _debounceTimer = Timer(Duration(milliseconds: delay), () {
      func.call();
      _debounceTimer = null;
    });
  }
}