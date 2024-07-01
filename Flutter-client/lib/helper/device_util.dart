import 'dart:io';

import 'package:android_id/android_id.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class DeviceUtil {
  /// 设备的唯一id
  static String? identifier;
  static String? systemVersion;
  static String? deviceName;

  static String getDeviceOS() {
    String os = "";
    if (Platform.isAndroid) {
      os = "android"; //UUID for Android
    } else if (Platform.isIOS) {
      os = "ios"; //UUID for iOS
    }
    return os;
  }

  static Future<String> getDeviceIdentifier() async {
    if (DeviceUtil.identifier != null) {
      return Future.value(DeviceUtil.identifier);
    }

    String? identifier;
    try {
      if (Platform.isAndroid) {
        const AndroidId androidIdPlugin = AndroidId();
        identifier = await androidIdPlugin.getId(); //UUID for Android
      } else if (Platform.isIOS) {
        final DeviceInfoPlugin deviceInfoPlugin = DeviceInfoPlugin();
        var data = await deviceInfoPlugin.iosInfo;
        identifier = data.identifierForVendor; //UUID for iOS
      }
    } on PlatformException {
      debugPrint('Failed to get platform version');
    }
    DeviceUtil.identifier = identifier;
    return identifier!;
  }

  static Future<String> getDeviceName() async {
    if (deviceName != null) {
      return Future.value(deviceName);
    }
    String? model;
    final DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    try {
      if (Platform.isAndroid) {
        AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
        model = androidInfo.board;
      } else if (Platform.isIOS) {
        IosDeviceInfo iosDeviceInfo = await deviceInfo.iosInfo;
        model = iosDeviceInfo.name; //model for iOS
      }
    } on PlatformException {
      debugPrint('Failed to get platform version');
    }

    /// 后端限制登录的参数clientName 不能有'_'字符 不能有‘+’字符
    model = model?.replaceAll("_", '');
    model = model?.replaceAll("+", '');
    deviceName = model;
    return model!;
  }

  static Future<String> getDeviceModel() async {
    String? model;
    final DeviceInfoPlugin deviceInfoPlugin = DeviceInfoPlugin();
    try {
      if (Platform.isAndroid) {
        var build = await deviceInfoPlugin.androidInfo;
        model = build.model; //model for Android
      } else if (Platform.isIOS) {
        var iosInfo = await deviceInfoPlugin.iosInfo;
        model = iosInfo.utsname.machine; //model for iOS
      }
    } on PlatformException {
      debugPrint('Failed to get platform version');
    }
    return model!;
  }

  static Future<String> getDeviceModelName() async {
    String? name;
    final DeviceInfoPlugin deviceInfoPlugin = DeviceInfoPlugin();
    try {
      if (Platform.isAndroid) {
        var build = await deviceInfoPlugin.androidInfo;
        name = build.manufacturer; //model for Android
      } else if (Platform.isIOS) {
        var iosInfo = await deviceInfoPlugin.iosInfo;
        name = iosInfo.name; //model for iOS
      }
    } on PlatformException {
      debugPrint('Failed to get platform version');
    }
    return name!;
  }

  static Future<String> getSystemVersion() async {
    String version = "";
    final DeviceInfoPlugin deviceInfoPlugin = DeviceInfoPlugin();
    try {
      if (Platform.isAndroid) {
        var build = await deviceInfoPlugin.androidInfo;
        version = 'Android ${build.version.release}'; //model for Android
      } else if (Platform.isIOS) {
        var iosInfo = await deviceInfoPlugin.iosInfo;
        version = 'iOS ${iosInfo.systemVersion}'; //model for iOS
      }
    } on PlatformException {
      debugPrint('Failed to get platform version');
    }
    systemVersion = version;
    return version;
  }

  static Future<int> getAndroidSDKNumber() async {
    if (Platform.isAndroid) {
      var androidInfo = await DeviceInfoPlugin().androidInfo;
      var sdkInt = androidInfo.version.sdkInt;
      return sdkInt;
    }
    return -1;
  }

  bool isIPhoneX(MediaQueryData mediaQuery) {
    if (Platform.isIOS) {
      var size = mediaQuery.size;
      if (size.height == 812.0 || size.width == 812.0) {
        return true;
      }
    }
    return false;
  }
}
