import 'dart:io';

import 'package:flutter/foundation.dart';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/config/config.dart';

const String darwinNotificationCategoryPlain = 'plainCategory';

class LocalNotifier {
  static var _id = 0;
  String get icon {
    if (!Config.isM1) {
      return 'app_icon2';
    }
    return 'app_icon';
  }

  Future<bool?> init() async {
// initialise the plugin. app_icon needs to be a added as a drawable resource to the Android head project
    AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings(icon);
    const DarwinInitializationSettings iOSSettings =
        DarwinInitializationSettings();
    var initSettings =
        InitializationSettings(android: androidSettings, iOS: iOSSettings);

    FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
        FlutterLocalNotificationsPlugin();
    return flutterLocalNotificationsPlugin.initialize(initSettings,
        onDidReceiveNotificationResponse: _onDidReceiveNotificationResponse);
  }

  void _onDidReceiveNotificationResponse(
      NotificationResponse notificationResponse) {
    final String? payload = notificationResponse.payload;
    if (notificationResponse.payload != null) {
      debugPrint('notification payload: $payload');
    }
    // Navigator.push(
    //   context,
    //   MaterialPageRoute<void>(builder: (context) => SecondScreen(payload)),
    // );
  }

  Future<bool> requestPermissions() async {
    bool? result = false;
    final flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
    if (Platform.isAndroid) {
      result = await flutterLocalNotificationsPlugin
              .resolvePlatformSpecificImplementation<
                  AndroidFlutterLocalNotificationsPlugin>()
              ?.requestNotificationsPermission() ??
          false;
    } else if (Platform.isIOS) {
      result = await flutterLocalNotificationsPlugin
          .resolvePlatformSpecificImplementation<
              IOSFlutterLocalNotificationsPlugin>()
          ?.requestPermissions(
            alert: true,
            badge: true,
            sound: true,
          );
    }
    return result == true;
  }

  void showNormalNotiofication(String msg) {
    // PlatformNotifier.I.showPluginNotification(
    //   ShowPluginNotificationModel(
    //       id: DateTime.now().second,
    //       title: "title",
    //       body: msg,
    //       payload: "test"),
    //   Get.overlayContext!,
    // );
    final flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
    AndroidNotificationDetails androidNotificationDetails =
        AndroidNotificationDetails(
      'chat',
      'im chat channel',
      channelDescription: 'use channel to get im message',
      importance: Importance.max,
      priority: Priority.high,
      fullScreenIntent: false,
      autoCancel: true,
      ongoing: true,
      visibility: NotificationVisibility.public,
      icon: icon,
      ticker: 'ticker',
    );
    const DarwinNotificationDetails iosNotificationDetails =
        DarwinNotificationDetails(
      categoryIdentifier: darwinNotificationCategoryPlain,
    );
    NotificationDetails notificationDetails = NotificationDetails(
      android: androidNotificationDetails,
      iOS: iosNotificationDetails,
    );
    flutterLocalNotificationsPlugin.show(
      _id++,
      localized('chat'),
      msg,
      notificationDetails,
      payload: 'item x',
    );
  }
}
