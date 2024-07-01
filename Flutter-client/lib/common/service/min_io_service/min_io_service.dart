import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/ip_service.dart';
import 'package:gogaming_app/common/service/min_io_service/min_io_config.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/main.dart';
import 'package:minio/minio.dart';

import 'event_center_model.dart';
// import 'package:minio/io.dart';

class MinIOService {
  factory MinIOService() => _getInstance();

  // instance的getter方法，通过CurrencyService.instance获取对象
  static MinIOService get sharedInstance => _getInstance();

  // 静态变量_instance，存储唯一对象
  static MinIOService? _instance;

  // 私有的命名式构造方法，通过它可以实现一个类可以有多个构造函数，
  // 子类不能继承internal不是关键字，可定义其他名字
  MinIOService._internal() {
    // 初始化
  }

  // 获取对象
  static MinIOService _getInstance() {
    _instance ??= MinIOService._internal();
    return _instance!;
  }

  late final _minio = Minio(
    endPoint: MinIOConfig.endPoint,
    port: MinIOConfig.port,
    accessKey: MinIOConfig.accessKey,
    secretKey: MinIOConfig.secretKey,
    useSSL: MinIOConfig.useSSL,
  );

  void uploadRequestError(String request, Map<String, dynamic> error) {
    final userModel = AccountService().gamingUser;
    String? userName = userModel?.userName;
    if (userName == null && userModel?.mobile?.isNotEmpty == true) {
      userName = '+${userModel?.mobileRegionCode} ${userModel?.mobile}';
    }
    if (userName == null && userModel?.email?.isNotEmpty == true) {
      userName = '${userModel?.email}';
    }

    final model = EvenCenterModel(
      appVersion: Config.versionName,
      connectivityStatus: connectivityResult.toString(),
      data: error,
      deviceInfo: DeviceUtil.deviceName ?? '',
      clientIp: IPService().ipModel?.ip,
      remoteAddress: '',
      uid: userModel?.uid,
      userName: userName,
    );

    final data = utf8.encode(model.toString());
    final stream = Stream.value(Uint8List.fromList(data));
    putObject(
        '${request}_${DateTime.now().millisecondsSinceEpoch}.txt', stream);
  }

  /// bucket类似文件夹默认目录是app-log object是文件名
  void putObject(String object, Stream<Uint8List> data,
      {String bucket = 'app-log'}) {
    _minio
        .putObject(
      bucket,
      object,
      data,
      onProgress: (bytes) => debugPrint('MinIO object:$object $bytes uploaded'),
    )
        .then((value) => null, onError: (Object e) {
      debugPrint('putObject error: $e');
    });
  }
}
