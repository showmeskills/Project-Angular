import 'package:flutter/material.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/pages/base/top_tips_widget.dart';
import '../../widget_header.dart';
import 'base_controller.dart';

abstract class BaseView<Controller extends BaseController>
    extends GetView<Controller> {
  const BaseView({super.key});

  Widget body(BuildContext context);

  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(navKey: backNavKey());
  }

  String getLocalString(String jsonPath, {List<String>? params}) {
    return localized(jsonPath, params: params);
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        pageScaffold(context),
        Obx(
          () => Visibility(
            visible: controller.pageState == PageState.loading,
            child: _showLoading(),
          ),
        ),
        // Obx(() => controller.errorMessage.isNotEmpty
        //     ? showErrorSnackBar(controller.errorMessage)
        //     : Container()),
      ],
    );
  }

  Widget pageScaffold(BuildContext context) {
    final content = pageContent(context);
    return Scaffold(
      appBar: appBar(context),
      backgroundColor: backgroundColor() ?? GGColors.background.color,
      floatingActionButton: floatingActionButton(),
      body: content,
      bottomNavigationBar: bottomNavigationBar(),
      resizeToAvoidBottomInset: resizeToAvoidBottomInset(),
      drawer: drawer(),
      endDrawer: endDrawer(),
      endDrawerEnableOpenDragGesture: endDrawerEnableOpenDragGesture(),
      drawerEnableOpenDragGesture: drawerEnableOpenDragGesture(),
    );
  }

  Widget pageContent(BuildContext context) {
    return SafeArea(
      bottom: !ignoreBottomSafeSpacing(),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildTopTipsWidget(context),
          Flexible(
            fit: FlexFit.loose,
            child: body(context),
          ),
        ],
      ),
      // child: body(context),
    );
  }

  Widget showErrorSnackBar(String message) {
    final snackBar = SnackBar(content: Text(message));
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      ScaffoldMessenger.of(Get.overlayContext!).showSnackBar(snackBar);
    });

    return Container();
  }

  bool ignoreBottomSafeSpacing() {
    return false;
  }

  bool resizeToAvoidBottomInset() {
    return true;
  }

  bool drawerEnableOpenDragGesture() {
    return false;
  }

  bool endDrawerEnableOpenDragGesture() {
    return false;
  }

  Widget? floatingActionButton() {
    return null;
  }

  Widget? bottomNavigationBar() {
    return null;
  }

  Color? backgroundColor() {
    return null;
  }

  Widget? drawer() {
    return null;
  }

  Widget? endDrawer() {
    return null;
  }

  Widget _showLoading() {
    return const GoGamingLoading();
  }

  int? backNavKey() {
    return null;
  }

  // 是否显示风险提示
  bool? showTopTips() {
    return true;
  }

  Widget _buildTopTipsWidget(BuildContext context) {
    return Visibility(
      visible: GGUtil.parseBool(showTopTips()),
      child: const TopTipsWidget(),
    );
  }

  static Size boundingTextSize(String text, GGTextStyle style,
      {int maxLines = 2, double maxWidth = 170}) {
    if (text.isEmpty) {
      return Size.zero;
    }
    final TextPainter textPainter = TextPainter(
        textDirection: TextDirection.ltr,
        text: TextSpan(text: text, style: style),
        maxLines: maxLines)
      ..layout(maxWidth: maxWidth);
    return textPainter.size;
  }
}
