import 'dart:developer';

import 'package:base_framework/base_framework.dart';
import 'package:flutter/widgets.dart';

class LaunchUtil {
  static WidgetsBinding? _binding;

  static void init() {
    log('init ===> ${DateTime.now().toString()}', name: 'Launch');
    _binding = WidgetsFlutterBinding.ensureInitialized();
    _binding!.deferFirstFrame();
  }

  static void remove() {
    _binding?.allowFirstFrame();
    _binding = null;
    log('Native Splash ===> ${DateTime.now()}', name: 'Launch');
    log('init ===> ${DateTime.now()}', name: 'SplashLogic');
    SentryFlutter.setAppStartEnd(DateTime.now().toUtc());
  }
}
