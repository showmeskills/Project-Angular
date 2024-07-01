import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/webview/base_web_view_controller.dart';
import 'package:gogaming_app/common/widgets/webview/web_error_page.dart';
import 'package:gogaming_app/common/widgets/webview_flutter/webview_flutter_controller.dart';
import 'package:gogaming_app/widget_header.dart';

class WebViewFlutterPage extends StatelessWidget {
  const WebViewFlutterPage({
    Key? key,
    required this.webController,
    this.title,
    this.hasActionBar = true,
    this.appBar,
    this.injectJavascript,
    this.userAgent,
    this.backMode = WebViewBackMode.backAndExit,
    this.stackWidgets,
    this.pageFinishedCallBack,
    this.hide = false,
    this.gestureRecognizers = const <Factory<OneSequenceGestureRecognizer>>{},
  }) : super(key: key);

  final WebViewController webController;
  final String? title;
  final bool hasActionBar;
  final PreferredSizeWidget? appBar;
  final String? injectJavascript;
  final String? userAgent;
  final List<Widget>? stackWidgets;
  final void Function()? pageFinishedCallBack;
  final Set<Factory<OneSequenceGestureRecognizer>> gestureRecognizers;

  /// 返回按钮的模式
  final WebViewBackMode backMode;
  final bool hide;

  WebViewFlutterController get logic => Get.find<WebViewFlutterController>();

  @override
  Widget build(BuildContext context) {
    Get.put(WebViewFlutterController(
      // webController: webController..setUserAgent(userAgent),
      webController: webController,
      title: title,
      userAgent: userAgent,
      pageFinishedCallBack: pageFinishedCallBack,
    ));
    return Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: Colors.black,
      appBar: appBar ??
          AppBar(
            toolbarHeight: hasActionBar ? 58.dp : 0,
            centerTitle: true,
            title: Obx(() {
              return Text(
                logic.title,
                style: GGTextStyle(
                  fontSize: GGFontSize.bigTitle,
                  color: GGColors.textMain.color,
                ),
              );
            }),
            automaticallyImplyLeading: false,
            leading: buildGamingBack(context),
            leadingWidth: backMode.leadingWidth,
            // systemOverlayStyle: const SystemUiOverlayStyle(
            //   // Status bar brightness (optional)
            //   statusBarIconBrightness: Brightness.light,
            //   // For Android (white text and icons)
            //   statusBarBrightness:
            //       Brightness.dark, // For iOS (white text and icons)
            // ),
            backgroundColor: GGColors.background.color,
          ),
      body: Container(
        color: Colors.transparent,
        width: double.infinity,
        height: double.infinity,
        child: SafeArea(
          // top: false,
          bottom: false,
          child: Column(
            children: [
              Obx(
                () => Visibility(
                  visible: logic.showProgress.value && !hide,
                  child: _buildProgressBar(
                    logic.progress / 100.0,
                    logic.progressAnimateFinish.value,
                  ),
                ),
              ),
              Expanded(
                child: Builder(
                  builder: (context) => _buildWebView(context),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWebView(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: Obx(
            () {
              return Visibility(
                visible: logic.showLoading.value && !hide,
                child: Center(
                  child: GamingImage.asset(
                    R.gameLoading,
                    fit: BoxFit.contain,
                    width: 120.dp,
                  ),
                ),
              );
            },
          ),
        ),
        Positioned.fill(
          child: Visibility(
            visible: !hide,
            child: WebViewWidget(
              controller: logic.webController,
              gestureRecognizers: gestureRecognizers,
            ),
          ),
        ),
        Positioned.fill(
          child: Obx(() {
            return Visibility(
              visible: logic.showWebErrorPage,
              child: WebErrorPage(
                onReload: logic.reloadErrorPage,
              ),
            );
          }),
        ),
        if (stackWidgets != null)
          ...stackWidgets!.map((e) => Positioned.fill(child: e)).toList(),
      ],
    );
  }

  Widget _buildProgressBar(double progress, bool progressAnimateFinish) {
    debugPrint(
        '_buildProgressBar progress:$progress visible:$progressAnimateFinish');
    return AnimatedOpacity(
      duration: const Duration(milliseconds: 200),
      opacity: progress >= 1.0 ? 0.0 : 1.0,
      child: Visibility(
        visible: progressAnimateFinish,
        child: SizedBox(
          height: 3,
          width: double.infinity,
          child: LinearProgressIndicator(
            backgroundColor: Colors.red.withOpacity(0),
            value: progress,
            valueColor: const AlwaysStoppedAnimation<Color>(Colors.redAccent),
          ),
        ),
      ),
    );
  }

  Widget buildGamingBack(BuildContext context) {
    if (backMode == WebViewBackMode.none) return Container();
    return Row(
      children: [
        if (backMode == WebViewBackMode.backAndExit)
          GamingBackButton(
            size: 18.dp,
            padding: EdgeInsets.symmetric(
              horizontal: 16.dp,
              vertical: 16.dp,
            ).copyWith(
              right: 10.dp,
            ),
            onPressed: logic.goBack,
          ),
        GamingCloseButton(
          size: 18.dp,
          padding: EdgeInsets.symmetric(
            horizontal: 16.dp,
            vertical: 16.dp,
          ).copyWith(
            left: backMode == WebViewBackMode.backAndExit ? 10.dp : 16.dp,
          ),
          onPressed: () {
            Get.back<void>();
          },
        ),
      ],
    );
  }
}
