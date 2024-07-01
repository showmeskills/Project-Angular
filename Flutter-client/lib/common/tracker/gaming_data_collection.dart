import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/api/tracker/tracker.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/ip_service.dart';
import 'package:gogaming_app/common/tracker/event.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'dart:io';
import 'dart:async';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:lzstring/lzstring.dart';
import 'package:package_info_plus/package_info_plus.dart';

const int maxSaveDataNumber = 100;
const int time = 1;

class GamingDataCollection {
  factory GamingDataCollection() => _getInstance();

  static GamingDataCollection get sharedInstance => _getInstance();

  static GamingDataCollection? _instance;

  List<dynamic> dataList = [];
  Timer? _timer;
  Map<String, int> timeMap = {};
  GamingDataCollection._internal() {
    // 初始化
  }

  void initTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(minutes: time), (timer) {
      uploadDataToServer();
    });
  }

//  获取对象
  static GamingDataCollection _getInstance() {
    _instance ??= GamingDataCollection._internal();
    return _instance!;
  }

  Future<String> getLocalIpAddress() async {
    for (var interface in await NetworkInterface.list()) {
      for (var address in interface.addresses) {
        if (!address.isLoopback) {
          if (address.type == InternetAddressType.IPv4) {
            return address.address;
          }
        }
      }
    }
    return '';
  }

  Future<void> submitDataPoint(TrackEvent event,
      {Map<String, dynamic> dataMap = const {},
      bool needSubmitImmediately = false}) async {
    if (_timer == null) {
      initTimer();
    }
    GamingUserModel? userInfo = AccountService.sharedInstance.gamingUser;
    PackageInfo packageInfo = await PackageInfo.fromPlatform();
    String packageName = packageInfo.packageName;
    int duration = getTimeEvent(event);
    Map<String, dynamic> params = Map.from(dataMap);
    String ipAddress = await getLocalIpAddress();
    params['uid'] = userInfo?.uid;
    params['appId'] = 3;
    params['appVersion'] = Config.versionName;
    params['tpid'] = Config.tenantId; //平台ID
    params['domain'] = packageName;
    params['httpReferer'] = packageName;
    params['deviceType'] = 3;
    params['deviceModel'] = await DeviceUtil.getDeviceModel();
    params['deviceId'] = await DeviceUtil.getDeviceIdentifier();
    params['osType'] = Platform.isAndroid ? 1 : 2;
    params['osVersion'] = await DeviceUtil.getSystemVersion();
    params['browserType'] = -1;
    params['ip'] = IPService.sharedInstance.ipModel?.ip ?? ipAddress;
    params['eventId'] = event.eventID;
    params['eventName'] = event.name;
    var now = DateTime.now().toUtc();
    String timeStamp = now.toString();
    String formatTimeStamp = timeStamp.replaceAll(' ', "T").replaceAll('Z', '');
    params['actionTime'] = formatTimeStamp;
    params['userType'] = AccountService.sharedInstance.isLogin ? 0 : 2;

    int versionNumber = 1;
    String digitsOnly = Config.versionName.replaceAll(".", "");
    if (!digitsOnly.contains('#')) {
      versionNumber = GGUtil.parseInt(digitsOnly);
    }
    params['appMajorVersion'] = versionNumber;

    params['language'] = GoGamingService().apiLang;

    if (duration > 0) {
      params['actionvalue1'] = duration;
    }
    dataList.add(params);
    if (dataList.length >= maxSaveDataNumber) {
      needSubmitImmediately = true;
    }

    if (needSubmitImmediately) {
      uploadDataToServer();
    }
  }

  void removeData() {
    dataList = [];
  }

  Future<void> uploadDataToServer() async {
    if (dataList.isEmpty) return;
    String paramsStr = jsonEncode(dataList);
    String compressedString = await LZString.compressToBase64(paramsStr) ?? '';
    PGSpi(Tracker.submit.toTarget(
      inputData: {'rawBehaviour': compressedString},
    )).rxRequest<dynamic>((value) {
      return value;
    }).listen((event) {
      if (event.success) {
        removeData();
      }
    }).onError((Object e) {
      if (e is GoGamingResponse) {
        if (e.success) {
          removeData();
        }
      } else {
        debugPrint('sendCollectionDataToServer fail');
      }
    });
  }

  Future<dynamic> initPlatformState() async {
    DeviceInfoPlugin deviceInfoPlugin = DeviceInfoPlugin();

    AndroidDeviceInfo androidDeviceData;
    IosDeviceInfo iOSDeviceData;

    if (Platform.isAndroid) {
      androidDeviceData = await deviceInfoPlugin.androidInfo;
      return androidDeviceData;
    } else if (Platform.isIOS) {
      iOSDeviceData = await deviceInfoPlugin.iosInfo;
      return iOSDeviceData;
    }
  }

  // 开始记录某个事件的时长
  void startTimeEvent(TrackEvent event) {
    // 当前时间，精确到秒
    int currentTime = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    timeMap[event.name] = currentTime;
  }

  // 根据当前Key查找缓存
  int getTimeEvent(TrackEvent event) {
    if (timeMap.containsKey(event.name)) {
      int begin = timeMap[event.name]!;
      int currentTime = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      int time = currentTime - begin;
      timeMap.remove(event.name);
      return time;
    } else {
      return 0;
    }
  }
}
