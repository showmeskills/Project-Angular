// ignore_for_file: unused_element, unused_field

import 'dart:async';
import 'dart:convert';
import 'dart:developer';
import 'dart:math' hide log;
// import 'package:gogaming_app/widget_header.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

import 'models/im_cmd.dart';
import 'models/im_connection_status.dart';
import 'models/im_recieve_model.dart';

class IMSocket {
  /// -1 初始化 0 正在连接 1 连接失败 2 已断开 3 已连接
  IMConnectionStatus _wsStatus = IMConnectionStatus.init;

  IMConnectionStatus get wsStatus => _wsStatus;

  /// 是否自动重连
  bool _isAutoRetry = true;

  /// 重试次数
  int retryTime = 0;

  /// 服务器连接地址
  String serverUrl;
  WebSocketChannel? _channel;

  final Duration keepAliveDuration;
  Timer? _timer;
  final void Function(IMRecieveModel recieveModel) onRecieve;
  final void Function(IMConnectionStatus status)? onStatusChange;
  final void Function() keepAliveEvent;

  IMSocket({
    required this.onStatusChange,
    required this.onRecieve,
    required this.serverUrl,
    required this.keepAliveEvent,
    this.keepAliveDuration = const Duration(seconds: 5),
  }) {
    // GamingEvent.login.subscribe(() {
    //   debugPrint(
    //       "listen to the token expiration notification and start refreshing signalr------- login");
    //   resetConnectionAndReconection();
    // });

    // GamingEvent.loggedOut.subscribe(() async {
    //   debugPrint(
    //       "listen to the token expiration notification and start refreshing signalr------- loggedOut");
    //   resetConnectionAndReconection();
    // });
    _timer = Timer.periodic(keepAliveDuration, (object) {
      if (_wsStatus == IMConnectionStatus.connected) {
        keepAliveEvent();
      }
    });
  }

  Future<void> openConnection() async {
    _isAutoRetry = true;
    return _openConnection();
  }

  Future<void> _openConnection() async {
    if (_channel == null) {
      log('_channel? is null', name: 'IMSocket');
    } else {
      log('$_channel----', name: 'IMSocket');
    }
    log(' connect ----- 0 ', name: 'IMSocket');

    setWsStatus(IMConnectionStatus.connecting);

    if (_channel == null) {
      log(' connect ----- 1 ', name: 'IMSocket');
      final wsUrl = Uri.parse(serverUrl);
      final channel = WebSocketChannel.connect(wsUrl);

      try {
        await channel.ready;
        _channel = channel;

        channel.stream.listen(
          (dynamic dataFromServer) {
            if (dataFromServer is String) {
              if (!dataFromServer.contains('"hbbyte":')) {
                log('im recieve:  $dataFromServer', name: 'IMSocket');
              }
              final response =
                  json.decode(dataFromServer) as Map<String, dynamic>;
              IMRecieveModel recieveModel = IMRecieveModel.fromJson(response);
              if (recieveModel.command == IMRecieveCommand.loginRes &&
                  recieveModel.code == 10007) {
                setWsStatus(IMConnectionStatus.connected);
              }
              onRecieve(recieveModel);
            } // dataFromServer is String
          }, //  dataFromServer
          onDone: () => {
            // https://api.dart.dev/stable/2.17.3/dart-io/WebSocket/closeReason.html
            // If there is no close reason available, "channel.closeReason" will be null
            log('onDone: Will close WebSocket: ${channel.closeReason}',
                name: 'IMSocket'),
            channel.sink.close(),
            setWsStatus(IMConnectionStatus.disconnected),

            /// 链接失败则启动重试策略
            _retryConnectionAndReconection(),
          },
          onError: (err) => {
            // https://api.dart.dev/stable/2.17.3/dart-io/WebSocket/closeReason.html
            // If there is no close reason available, "channel.closeReason" will be null
            log('onError: Will close WebSocket: ${channel.closeReason}',
                name: 'IMSocket'),
            channel.sink.close(),
            setWsStatus(IMConnectionStatus.connectFailed),

            /// 链接失败则启动重试策略
            _retryConnectionAndReconection(),
          },
          cancelOnError: false,
        ); // channel.stream.listen: Incoming stream Data from our WebSocket Server
      } catch (e) {
        // Handle the exception.
        log('SocketException: $e', name: 'IMSocket');
        channel.sink.close();
        setWsStatus(IMConnectionStatus.connectFailed);

        /// 链接失败则启动重试策略
        _retryConnectionAndReconection();
      }
    }
  }

  void setWsStatus(IMConnectionStatus status) {
    if (_wsStatus == status) return;
    _wsStatus = status;
    onStatusChange?.call(_wsStatus);
  }

  Future<void> closeConnection() async {
    _isAutoRetry = false;
    return _closeConnection();
  }

  Future<void> _closeConnection() async {
    try {
      await _channel?.sink.close(status.goingAway);
      _channel = null;
    } catch (e) {
      log('_channel stop exception:$e', name: 'IMSocket');
    }
  }

  // void resetConnectionAndReconection() async {
  //   await closeConnection();
  //   _channel = null;
  //   Future.delayed(const Duration(milliseconds: 2000), () {
  //     log('The state switch refreshes the token and starts to reconnect------',
  //         name: 'IMSocket');
  //     openConnection();
  //   });
  // }

  void _retryConnectionAndReconection() async {
    if (!_isAutoRetry) return;

    /// 清空之前链接
    await _closeConnection();
    Future.delayed(Duration(seconds: _retryInterval()), () {
      log('The state switch refreshes the token and starts to reconnect------',
          name: 'IMSocket');
      _openConnection();
    });
  }

  int _retryInterval() {
    /// 重试策略
    /// 每次重试请求与上一次请求的间隔时间分别为 2s、4s、8s、16s、32s
    /// 之后持续使用 32s 进行重试
    num interval = pow(2, retryTime);
    if (interval > 32) {
      return 32;
    }
    return interval.toInt();
  }

  /// 发送消息
  void send({
    required Map<String, dynamic> args,
  }) {
    if (_channel == null) {
      log('im send faild args:$args', name: 'IMSocket');
      return;
    }
    final sender = json.encode(args);
    if (!sender.contains('"hbbyte":')) {
      log('im send:  $sender', name: 'IMSocket');
    }
    _channel!.sink.add(sender);
  }
}
