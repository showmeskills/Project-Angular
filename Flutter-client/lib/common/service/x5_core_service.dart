import 'dart:io';

import 'package:base_framework/base_framework.dart';
import 'package:path_provider/path_provider.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';
import 'package:path/path.dart' as p;

class X5CoreService {
  factory X5CoreService() => _getInstance();

  static X5CoreService get sharedInstance => _getInstance();

  static X5CoreService? _instance;

  static X5CoreService _getInstance() {
    _instance ??= X5CoreService._internal();
    return _instance!;
  }

  X5CoreService._internal();

  String _downloadDomain = 'https://download.yaopan.online';

  final _version = X5CoreVersion.invalid().obs;
  X5CoreVersion get version => _version.value;

  bool get isX5Core => version.isX5Core;

  final _cacheInitResult = ReadWriteValue<bool?>(
    'X5CoreService._cacheInitResult',
    null,
    () => GetStorage(),
  );

  X5SdkListener? _listener;

  void setX5SdkListener(X5SdkListener listener) {
    _listener = listener;
  }

  void updateDownloadDomain(String domain) {
    _downloadDomain = domain;
  }

  Future<bool> init() {
    if (Platform.isAndroid) {
      return _download().then((path) {
        if (path != null) {
          final coreVersion =
              int.parse(p.basenameWithoutExtension(path).split('_')[1]);
          return X5Sdk.installLocalCore(
            coreVersion: coreVersion,
            path: path,
          ).then((value) {
            return X5Sdk.getX5CoreVersion().then((result) {
              _version.value = result;
              return result.isX5Core;
            });
          }).catchError((Object err) {
            return Future.value(false);
          });
        } else {
          return false;
        }
      });
    } else {
      return Future.value(true);
    }
  }

  void submitInitEvent(bool value) {
    // 成功/失败的事件只需要上报一次
    if (Platform.isAndroid && _cacheInitResult.val != value) {
      _cacheInitResult.val = value;
      Sentry.captureException(X5CoreInitError(x5InitSuccess: value));
    }
  }

  Future<String?> _download() {
    // 根据cpu架构判定内核文件是否存在
    // 不存在需要download
    return X5Sdk.getCpuAbi().then((abi) {
      late String filename;
      if (abi == CPUABI.arm64_v8a) {
        filename = 'arm64-v8a_046278.apk';
      } else {
        filename = 'armeabi-v7a_046270.apk';
      }
      return getExternalStorageDirectory().then((directory) {
        if (directory != null) {
          final dir = Directory('${directory.path}/x5');

          // 检查文件是否存在
          final file = File('${dir.path}/$filename');
          return file.exists().then((value) {
            if (value) {
              return Future<String?>.value(file.path);
            } else {
              // 检查备份文件是否存在
              final backup = File('${dir.path}/$filename.bak');
              return backup.exists().then((value) {
                if (value) {
                  return backup.copy(file.path).then((value) {
                    return file.path;
                  });
                } else {
                  // 下载内核文件
                  final dio = Dio();
                  return dio.download(
                    '$_downloadDomain/$filename',
                    file.path,
                    onReceiveProgress: (received, total) {
                      if (total != -1) {
                        final progress = received / total * 100;
                        _listener?.onDownloadProgress(progress);
                      }
                    },
                  ).then((resp) {
                    if (resp.statusCode == 200) {
                      return file.copy(backup.path).then((value) {
                        _listener?.onDownloadFinish(100);
                        return file.path;
                      });
                    } else {
                      throw Exception('download failed');
                    }
                  });
                }
              });
            }
          });
        } else {
          throw Exception('getDownloadsDirectory failed');
        }
      });
    }).catchError((Object err) {
      _listener?.onDownloadFailed(err);
      return Future.value(null);
    });
  }
}
