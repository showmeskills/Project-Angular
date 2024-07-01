// 重写HttpOverrides
import 'dart:io';

import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
// import 'package:gogaming_app/widget_header.dart';

import 'proxy_alert.dart';

class GGHttpOverrides extends HttpOverrides {
  String localhost = '';
  String port = '8888';

  @override
  HttpClient createHttpClient(SecurityContext? context) {
    var http = super.createHttpClient(context);
    http.findProxy = (uri) {
      // 需要手动输入ip地址和端口号 然后生效
      final manualURI = 'PROXY $localhost:$port';
      final proxy = localhost.isNotEmpty ? manualURI : 'DIRECT';
      debugPrint('http.findProxy return $proxy');
      return proxy;
    };
    http.badCertificateCallback =
        (X509Certificate cert, String host, int port) => true;
    return http;
  }
}

class ProxyService {
  factory ProxyService() => _getInstance();

  // instance的getter方法，通过CurrencyService.instance获取对象
  static ProxyService get sharedInstance => _getInstance();

  // 静态变量_instance，存储唯一对象
  static ProxyService? _instance;

  // 私有的命名式构造方法，通过它可以实现一个类可以有多个构造函数，
  // 子类不能继承internal不是关键字，可定义其他名字
  ProxyService._internal() {
    // 初始化
  }

  // 获取对象
  static ProxyService _getInstance() {
    _instance ??= ProxyService._internal();
    return _instance!;
  }

  final ipController = TextEditingController();
  final portController = TextEditingController();
  final ggHttpProxy = GGHttpOverrides();

  bool get shouldSetProxy =>
      Config.currentConfig.environment != Environment.product;

  void setupProxy() {
    if (shouldSetProxy) {
      HttpOverrides.global = ggHttpProxy;
    }
  }

  void showProxyAlert() {
    if (!shouldSetProxy) return;

    // 在此处处理状态栏点击事件
    showDialog<bool>(
      context: Get.overlayContext!,
      builder: (context) {
        return ProxyAlert(
          ipController: ipController,
          portController: portController,
        );
      },
    ).then((value) {
      if (value == true) {
        ggHttpProxy.localhost = ipController.text;
        ggHttpProxy.port = portController.text;
      }
    });
  }
}
