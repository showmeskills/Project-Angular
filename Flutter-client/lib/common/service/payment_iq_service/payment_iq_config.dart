import 'dart:io';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/webview/base_web_view_controller.dart';
import 'package:gogaming_app/common/widgets/webview/base_webview_view.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../pages/main/main_logic.dart';

part 'payment_iq_view.dart';

enum PaymentIQMethod {
  deposit('deposit'),
  withdraw('withdrawal');

  const PaymentIQMethod(this.value);

  final String value;
}

class PaymentIQConfig {
  static String get merchantId {
    switch (Config.sharedInstance.environment) {
      case Environment.sit:
        return '100479998';
      case Environment.uat:
        return '100479998';
      case Environment.product:
        return '100479005';
    }
  }

  static String get environment {
    switch (Config.sharedInstance.environment) {
      case Environment.sit:
        return 'test';
      case Environment.uat:
        return 'test';
      case Environment.product:
        return 'production';
    }
  }

  static String configJs(String currency, PaymentIQMethod method) {
    final user = AccountService.sharedInstance.gamingUser!;
    final channelId = Platform.isIOS ? 'iOS' : 'Android';
    return '''
      config = {
        merchantId: ${PaymentIQConfig.merchantId},
        uid: "${user.uid}",
        token: "${user.token}_$currency",
        environment: "${PaymentIQConfig.environment}",
        method: "${method.value}",
        defaultLoader: false,
        channelId: "$channelId",
      };
    ''';
  }

  static String styleJs() {
    return '''
      isDarkMode = ${ThemeManager.shareInstacne.isDarkMode};
      style = {
        background_color: "${GGColors.background.toHexString}",
        highlight_color: "${GGColors.highlightButton.toHexString}",
        border_color: "${GGColors.border.toHexString}",
        pop_background_color: "${GGColors.popBackground.toHexString}",
        text_main_color: "${GGColors.textMain.toHexString}",
        text_second_color: "${GGColors.textSecond.toHexString}",
      };
    ''';
  }
}

class PaymentIQController extends BaseWebViewControllerImp {
  PaymentIQController({
    this.method = PaymentIQMethod.deposit,
  });

  String? currency;
  final PaymentIQMethod method;

  final _height = 400.0.obs;
  double get height => _height.value;

  final _loading = true.obs;
  bool get loading => _loading.value;

  final _success = false.obs;
  bool get success => _success.value;

  @override
  set webController(InAppWebViewController v) {
    super.webController = v;

    if (currency != null) {
      _loadFile();
    }
  }

  @override
  void handleMethod(String method, Map<String, dynamic> params) {
    if (method == 'onHeightChange') {
      _height.value = (params['height'] as num).toDouble();
    } else if (method == 'doneLoading') {
      _loading.value = false;
    } else if (method == 'onLoadError') {
      _loading.value = false;
    } else if (method == 'success') {
      _success.value = true;
    }
  }

  void setCurrency(String? currency) {
    this.currency = currency;
  }

  void _loadFile() {
    _loading.value = true;
    webController.addUserScripts(
      userScripts: [
        UserScript(
          source: PaymentIQConfig.configJs(currency!, method),
          injectionTime: UserScriptInjectionTime.AT_DOCUMENT_END,
        ),
        UserScript(
          source: PaymentIQConfig.styleJs(),
          injectionTime: UserScriptInjectionTime.AT_DOCUMENT_START,
        ),
      ],
    );
    webController.loadFile(assetFilePath: 'assets/html/piq.html');
  }
}
