import 'dart:async';

import 'im_manager.dart';
import 'models/im_recieve_model.dart';
import 'models/im_send_model.dart';

class IMSendQueueItem {
  final Completer<IMRecieveModel> completer;
  final void Function() closure;
  Function? onComplete;

  IMSendQueueItem({
    required this.completer,
    required this.closure,
    this.onComplete,
  });

  Future<void> execute() async {
    try {
      await Future.microtask(() {
        closure();
        return completer.future.timeout(
          const Duration(seconds: 60),
          onTimeout: () {
            throw QueueTimeOutException();
          },
        );
      });
    } catch (e, stack) {
      completer.completeError(e, stack);
    } finally {
      onComplete?.call();
    }
  }

  void resend() {
    closure();
  }
}

class IMSendQueue {
  factory IMSendQueue() => _getInstance();

  static IMSendQueue get sharedInstance => _getInstance();

  static IMSendQueue? _instance;

  static IMSendQueue _getInstance() {
    _instance ??= IMSendQueue._internal();
    return _instance!;
  }

  IMSendQueue._internal();

  final IMManager _imManager = IMManager();

  final Map<String, IMSendQueueItem> _nextCycle = {};

  void clear() {
    for (final item in _nextCycle.values) {
      if (item.completer.isCompleted == false) {
        item.completer.completeError(QueueCancelledException());
      }
    }
    _nextCycle.removeWhere((key, item) => item.completer.isCompleted);
  }

  void dispose() {
    clear();
  }

  Stream<IMRecieveModel> add(IMSendModel sendModel) {
    final completer = Completer<IMRecieveModel>();
    final item = IMSendQueueItem(
      completer: completer,
      closure: () {
        _imManager.send(sendModel: sendModel);
      },
    );
    item.onComplete = () {
      _nextCycle.remove(sendModel.seq!);
    };
    _nextCycle[sendModel.seq!] = item;
    unawaited(item.execute());
    return completer.future.asStream();
  }

  void complete(IMRecieveModel recieveModel) {
    if (_nextCycle.containsKey(recieveModel.seq)) {
      _nextCycle[recieveModel.seq]!.completer.complete((recieveModel));
    }
  }

  void resume() {
    for (final item in _nextCycle.values) {
      if (item.completer.isCompleted == false) {
        item.closure();
      }
    }
  }
}

class QueueCancelledException implements Exception {}

class QueueTimeOutException implements Exception {}
