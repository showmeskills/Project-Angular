import 'dart:async';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/im/im_api.dart';
import 'package:gogaming_app/common/service/im/im_manager.dart';
import 'package:gogaming_app/common/utils/util.dart';

import 'im_send_queue.dart';

class IMFileUploadQueueItem {
  final Completer<String> completer;
  Function? onComplete;
  final String key;
  final String sourcePath;

  final void Function(double progress)? onProgress;

  double _progress = 0;

  double get progress => _progress;

  IMFileUploadQueueItem({
    required this.key,
    required this.sourcePath,
    required this.completer,
    this.onProgress,
    this.onComplete,
  });

  void execute() {
    uploadFile().doOnData((event) {
      if (event != null) {
        completer.complete(event);
      } else {
        completer.completeError('Upload failed');
      }
    }).doOnError((e, stack) {
      completer.completeError(e, stack);
    }).doOnDone(() {
      onComplete?.call();
    }).listen((event) {}, onError: (err) {});
  }

  Stream<String?> uploadFile() {
    final imManager = IMManager();
    if (imManager.accessToken == null) {
      return Stream.value(null);
    }
    return PGSpi(ImAPI.upload.toTarget(
      inputData: FormData.fromMap({
        'type': 1,
        'token': imManager.accessToken,
        'file': MultipartFile.fromFileSync(sourcePath),
      }),
    )).rxRequest<String?>(
      (value) {
        final data = value['data'];
        if (data is Map<String, dynamic>) {
          final fid = GGUtil.parseStr(data['fid']);
          return fid == '' ? null : fid;
        } else {
          return null;
        }
      },
      onSendProgress: (count, total) {
        _progress = (count / total).clamp(0.0, 1.0);
        onProgress?.call(_progress);
      },
    ).flatMap((value) => Stream.value(value.data));
  }
}

class IMFileUploadQueue {
  factory IMFileUploadQueue() => _getInstance();

  static IMFileUploadQueue get sharedInstance => _getInstance();

  static IMFileUploadQueue? _instance;

  static IMFileUploadQueue _getInstance() {
    _instance ??= IMFileUploadQueue._internal();
    return _instance!;
  }

  IMFileUploadQueue._internal();

  final Map<String, IMFileUploadQueueItem> _nextCycle = {};

  final int parallel = 10;

  Set<String> activeItems = {};

  // void singleCancel(String key) {
  //   final item = _nextCycle[key];
  //   if (item?.completer.isCompleted == false) {
  //     item?.completer.completeError(QueueCancelledException());
  //   }
  //   _nextCycle.remove(key);
  // }

  void cancel() {
    for (final item in _nextCycle.values) {
      if (item.completer.isCompleted == false) {
        item.completer.completeError(QueueCancelledException());
      }
    }
    _nextCycle.removeWhere((key, item) => item.completer.isCompleted);
  }

  void dispose() {
    cancel();
  }

  double getTaskProgress(String key) {
    final item = _nextCycle[key];
    return item?.progress ?? 100;
  }

  Stream<String> add({
    required String key,
    required String sourcePath,
    void Function(double progress)? onProgress,
  }) {
    final completer = Completer<String>();
    final item = IMFileUploadQueueItem(
      completer: completer,
      key: key,
      sourcePath: sourcePath,
      onProgress: onProgress,
    );
    _nextCycle[key] = item;
    unawaited(_process());
    return completer.future.asStream();
  }

  Future<void> _process() async {
    if (activeItems.length < parallel) {
      _queueUpNext();
    }
  }

  void _queueUpNext() {
    if (_nextCycle.isNotEmpty && activeItems.length <= parallel) {
      final item = _nextCycle.values.first;
      activeItems.add(item.key);
      _nextCycle.remove(item.key);
      item.onComplete = () async {
        activeItems.remove(item.key);
        _queueUpNext();
      };
      item.execute();
    }
  }
}
