import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/material.dart';
import '../../config/config.dart';
import 'firebase_options.dart';

class AnalyticsManager {
  static Future<void> initAnalyticsManager() async {
    final options = DefaultFirebaseOptions.currentPlatformSit;
    await Firebase.initializeApp(
      name: Config.tenantId == '1' ? "APP1" : "APP2",
      options: options,
    ).then((value) {}).onError((error, stackTrace) {
      debugPrint("Google Analytics Error = ${error.toString()}");
    });
    return await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(true);
  }

  static Future<void> logEvent(
      {required String name, Map<String, Object?>? parameters}) async {
    await FirebaseAnalytics.instance
        .logEvent(name: name, parameters: parameters);
    debugPrint('$name logEvent succeeded');
  }
}
