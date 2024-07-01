import 'package:gogaming_app/widget_header.dart';
import 'package:shorebird_code_push/shorebird_code_push.dart';

class ShorebirdService {
  factory ShorebirdService() => _getInstance();

  static ShorebirdService get sharedInstance => _getInstance();

  static ShorebirdService? _instance;

  static ShorebirdService _getInstance() {
    _instance ??= ShorebirdService._internal();
    return _instance!;
  }

  ShorebirdService._internal();

  final _cacheUpdateResult = ReadWriteValue<bool?>(
    'ShorebirdService._cacheUpdateResult',
    null,
    () => GetStorage(),
  );

  final _shorebirdCodePush = ShorebirdCodePush();

  int currentNumber = 0;

  Future<int> getCurrentNumber() async {
    currentNumber = await _shorebirdCodePush.currentPatchNumber() ?? 0;
    return currentNumber;
  }

  Future<bool> checkUpdate() {
    return _shorebirdCodePush.isNewPatchAvailableForDownload();
  }

  /// 更新
  /// 返回是否更新成功
  /// 如果返回null，表示没有更新
  Future<bool?> update() async {
    return checkUpdate().then((v1) {
      if (v1) {
        return _shorebirdCodePush.downloadUpdateIfAvailable().then((_) {
          return _shorebirdCodePush.isNewPatchReadyToInstall();
        }).then((value) {
          submitResultEvent(value);
          return value;
        });
      }
      return null;
    });
  }

  void submitResultEvent(bool value) {
    final result = _cacheUpdateResult.val ?? true;
    // 上次安装失败，本次成功或者本次安装失败
    if (!value || (result == false && value)) {
      Sentry.captureException(ShorebirdUpdateError(success: value));
    }
    _cacheUpdateResult.val = value;
  }
}
