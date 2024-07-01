import 'dart:convert';

class EvenCenterModel {
  EvenCenterModel({
    required this.data,
    required this.appVersion,
    required this.connectivityStatus,
    required this.deviceInfo,
    this.clientIp,
    this.remoteAddress,
    this.uid,
    this.userName,
  });

  /// 外部数据例如request和response
  final Map<String, dynamic> data;

  /// 客户端ip
  final String? clientIp;

  /// 服务器ip地址
  final String? remoteAddress;

  /// 用户id
  final String? uid;

  /// 用户名
  final String? userName;

  /// app版本
  final String appVersion;

  /// 用户网络状态 不一定准确
  final String connectivityStatus;

  /// 设备信息
  final String deviceInfo;

  Map<String, dynamic> toJson() {
    return {
      "data": data,
      "clientIp": clientIp,
      "remoteAddress": remoteAddress,
      "uid": uid,
      "userName": userName,
      "appVersion": appVersion,
      "connectivityStatus": connectivityStatus,
      "deviceInfo": deviceInfo,
    };
  }

  @override
  String toString() {
    return jsonEncode(toJson());
  }
}
