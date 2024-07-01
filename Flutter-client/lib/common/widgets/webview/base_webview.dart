import 'package:flutter/material.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/pages/base/top_tips_widget.dart';
import 'package:gogaming_app/widget_header.dart';

import 'base_web_view_controller.dart';
import 'base_webview_view.dart';

class BaseWebViewPage extends StatelessWidget {
  const BaseWebViewPage(
      {Key? key,
      this.link,
      this.title,
      this.windowId,
      this.hasActionBar = true,
      this.htmlString,
      this.hasGoBack = true,
      this.appBar,
      this.stackWidgets,
      this.injectJavascript,
      this.userAgent,
      this.backgroundColor,
      this.backMode = WebViewBackMode.backAndExit,
      this.handleNewWindow,
      this.localHtml,
      this.resizeToAvoidBottomInset,
      this.useDefaultUA = false,
      this.hideRiskWidget})
      : super(key: key);

  final String? link;
  final String? title;
  final int? windowId;
  final bool hasActionBar;
  final String? htmlString;
  final String? localHtml;
  final bool hasGoBack;
  final PreferredSizeWidget? appBar;
  final List<Widget>? stackWidgets;
  final String? injectJavascript;
  final String? userAgent;
  /// 是否使用默认的UA 默认false
  final bool useDefaultUA;
  final Color? backgroundColor;
  final Future<bool?> Function(InAppWebViewController controller,
      CreateWindowAction createWindowAction)? handleNewWindow;
  // 是否隐藏风控横幅
  final bool? hideRiskWidget;
  final bool? resizeToAvoidBottomInset;

  /// 返回按钮的模式
  final WebViewBackMode backMode;

  String get tag => link ?? htmlString ?? localHtml ?? windowId!.toString();

  BaseWebViewController get logic => Get.find<BaseWebViewController>(tag: tag);

  @override
  Widget build(BuildContext context) {
    Get.put(
      BaseWebViewController(
        link: link,
        htmlString: htmlString,
        localHtml: localHtml,
        windowId: windowId,
        backMode: backMode,
      ),
      tag: tag,
    );
    if (title != null) logic.setTitle(title!, true);
    logic.context = context;

    return Scaffold(
      resizeToAvoidBottomInset: resizeToAvoidBottomInset ?? false,
      backgroundColor: backgroundColor ?? GGColors.background.color,
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
              Obx(() {
                return _buildProgressBar(
                    logic.progress / 100.0, logic.progressAnimateFinish.value);
              }),
              GGUtil.parseBool(hideRiskWidget)
                  ? Container()
                  : const TopTipsWidget(),
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
    return BaseWebView(
      controller: logic,
      userAgent: userAgent,
      injectJavascript: injectJavascript,
      stackWidgets: stackWidgets,
      handleNewWindow: handleNewWindow,
      useDefaultUA: useDefaultUA,
      onTitleChanged: (InAppWebViewController controller, String? title) async {
        if (title != null) {
          logic.setTitle(title);
        }
      },
      onLoadError: (controller, url, code, message) {
        // logic.webError(true);
      },
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
