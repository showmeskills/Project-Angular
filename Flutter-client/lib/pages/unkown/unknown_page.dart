import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
// import 'package:gogaming_app/router/app_pages.dart';

class UnknownPage extends StatelessWidget {
  const UnknownPage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const UnknownPage(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.red,
      child: const Text('not found'),
    );
  }
}
