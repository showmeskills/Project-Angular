import 'package:flutter/material.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/pages/splash/splash_logic.dart';
import 'package:gogaming_app/widget_header.dart';

class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const SplashPage(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = Get.put<SplashLogic>(SplashLogic());
    return Material(
      color: Config.isM1 ? const Color(0xFFBB0D3C) : GGColors.brand.color,
      child: c.image,
    );
  }
}
