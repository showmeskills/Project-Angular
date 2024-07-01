import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';
// import 'package:gogaming_app/widget_header.dart';

/// @Description 显示弹窗dialog工具类
class DialogUtil {
  final BuildContext context;

  /// 图片
  final Widget? iconWidget;

  /// 图片
  final String iconPath;

  /// 图片高度
  final double iconHeight;

  /// 图片宽度
  final double iconWidth;

  /// 标题
  final String title;

  /// 内容
  final String content;

  /// 左侧按钮名称
  late String leftBtnName = localized('cancels');

  /// 左侧按钮字体颜色
  Color? leftBtnColor;

  /// 右侧按钮名称
  late String rightBtnName = localized('confirm_button');

  /// 右侧按钮倒计时
  int? rightCountdown;

  /// 右侧按钮字体颜色
  Color? rightBtnColor;
  Color? rightBtnBackgroundColor;

  // / 点击背景是否可以关闭弹窗
  // final bool barrierDismissible;

  /// 点击返回按钮是否可以关闭弹窗
  final bool backDismissible;

  /// 拓展widget 适用于其他业务场景
  final Widget? moreWidget;

  /// 放在两个按钮的下面
  final Widget? extraBottomWidget;

  /// 背景颜色
  final Color barrierColor;

  /// 阴影
  final double elevation;

  /// 内容最大行数
  ///
  /// [null] 不限制行数，完全显示
  ///
  /// 不传该参数则默认为2行
  final int? contentMaxLine;

  /// 内容对其
  final TextAlign contentAlign;

  /// 标题文字大小
  final GGFontSize titleSize;

  /// 按钮点击回调
  VoidCallback? onBtnPressed;

  /// 左侧按钮点击回调
  Function? onLeftBtnPressed;

  /// 右侧按钮点击回调
  Function? onRightBtnPressed;

  /// dialog content padding
  EdgeInsets? contentPadding;

  /// dialog padding
  EdgeInsets? padding;

  void Function()? onDismiss;

  DialogUtil({
    required this.context,
    this.iconWidget,
    this.iconPath = '',
    this.iconHeight = 0.0,
    this.iconWidth = 0.0,
    this.title = '',
    this.content = '',
    String? leftBtnName,
    this.leftBtnColor,
    String? rightBtnName,
    this.rightCountdown,
    this.rightBtnColor,
    this.rightBtnBackgroundColor,
    this.onBtnPressed,
    this.contentPadding,
    this.padding,
    this.onLeftBtnPressed,
    this.onRightBtnPressed,
    this.barrierColor = Colors.black54,
    // this.barrierDismissible = true,
    this.backDismissible = true,
    this.elevation = 0,
    this.titleSize = GGFontSize.superBigTitle,
    this.moreWidget,
    this.extraBottomWidget,
    this.contentMaxLine = 2,
    this.contentAlign = TextAlign.center,
    this.onDismiss,
  }) {
    if (leftBtnName != null) {
      this.leftBtnName = leftBtnName;
    }
    if (rightBtnName != null) {
      this.rightBtnName = rightBtnName;
    }
  }

  /// 左右两个按钮
  void showNoticeDialogWithTwoButtons() {
    _showGeneralDialog(builder: (BuildContext context) {
      return PopScope(
        canPop: false,
        child: AnimatedPadding(
          padding: padding ??
              EdgeInsets.symmetric(horizontal: 16.dp, vertical: 16.dp),
          duration: const Duration(milliseconds: 100),
          curve: Curves.decelerate,
          child: MediaQuery.removeViewInsets(
            removeLeft: true,
            removeTop: true,
            removeRight: true,
            removeBottom: true,
            context: context,
            child: Center(
              child: Material(
                elevation: elevation,
                borderRadius: BorderRadius.circular(14.dp),
                child: _noticeViewWithTwoButtons(context),
              ),
            ),
          ),
        ),
      );
    });
  }

  static Future<T?> showCustomGeneralDialog<T>({
    required Widget Function(BuildContext) builder,
    bool backDismissible = true,
    Color barrierColor = Colors.black54,
    void Function()? onDismiss,
  }) {
    return showGeneralDialog(
      context: Get.overlayContext!,
      pageBuilder: (BuildContext buildContext, Animation<double> animation,
          Animation<double> secondaryAnimation) {
        return SafeArea(
          child: Builder(builder: (BuildContext context) {
            return GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {
                if (backDismissible) {
                  Navigator.of(context).pop();
                  onDismiss?.call();
                }
              },
              child: Builder(builder: builder),
            );
          }),
        );
      },
      barrierLabel: MaterialLocalizations.of(Get.overlayContext!)
          .modalBarrierDismissLabel,
      barrierColor: barrierColor,
      transitionDuration: const Duration(milliseconds: 150),
      transitionBuilder: (BuildContext context, Animation<double> animation,
          Animation<double> secondaryAnimation, Widget child) {
        return FadeTransition(
          opacity: CurvedAnimation(
            parent: animation,
            curve: Curves.easeOut,
          ),
          child: child,
        );
      },
    );
  }

  /// 重写showGeneralDialog,系统自带的背景背景透明不能修改
  void _showGeneralDialog({
    required Widget Function(BuildContext) builder,
    Widget? child,
  }) {
    showCustomGeneralDialog<void>(
      backDismissible: backDismissible,
      barrierColor: barrierColor,
      builder: child != null
          ? (p0) {
              return child;
            }
          : builder,
      onDismiss: onDismiss,
    );
  }

  Widget _noticeViewWithTwoButtons(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.alertBackground.color,
        borderRadius: BorderRadius.circular(4.dp),
      ),
      constraints: BoxConstraints(
        minHeight: 200.dp,
      ),
      padding: EdgeInsets.only(
        top: contentPadding?.top ?? 40.dp,
        bottom: contentPadding?.bottom ?? 40.dp,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min, //column自适应子控件的高度，不加这条默认会撑到最大
        children: <Widget>[
          _iconWidget(),
          _titleViewInTwoButtons(),
          _contentViewInTwoButtons(),
          SizedBox(
            height: 16.dp,
          ),
          _moreWidget(),
          _bottomViewInTwoButtons(context),
          if (extraBottomWidget is Widget) extraBottomWidget!,
        ],
      ),
    );
  }

  Widget _iconWidget() {
    Widget? child = iconWidget ?? _iconPathWidget();
    if (child == null) {
      return Container();
    }
    return Container(
      padding: EdgeInsets.only(bottom: 16.dp),
      child: child,
    );
  }

  Widget? _iconPathWidget() {
    if (iconPath.isEmpty) return null;
    return Image.asset(
      iconPath,
      width: iconWidth,
      height: iconHeight,
    );
  }

  Widget _titleViewInTwoButtons() {
    return Container(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      // margin: EdgeInsets.only(top: 19.dp, left: 16.dp, right: 16.dp),
      // height: 22,
      child: Text(
        title,
        style: GGTextStyle(
          color: GGColors.textMain.color,
          fontSize: titleSize,
          fontWeight: GGFontWeigh.bold,
        ),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  Widget _contentViewInTwoButtons() {
    if (content.isEmpty) {
      return Gaps.empty;
    }
    return Container(
      padding: EdgeInsets.only(
        left: 16.dp,
        right: 16.dp,
        top: 16.dp,
      ),
      child: Text(
        content,
        textAlign: contentAlign,
        style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.regular),
        maxLines: contentMaxLine,
        softWrap: true,
        overflow: contentMaxLine == null ? null : TextOverflow.ellipsis,
      ),
    );
  }

  Widget _bottomViewInTwoButtons(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 22.dp,
        right: 22.dp,
      ),
      child: Row(
        children: <Widget>[
          if (leftBtnName.isNotEmpty) ...[
            _clickView(leftBtnName, leftBtnColor ?? GGColors.textMain.color,
                GGColors.border.color, onLeftBtnPressed, context),
            SizedBox(width: 11.dp),
          ],
          if (rightBtnName.isNotEmpty)
            _clickRightView(
              rightBtnName,
              rightBtnColor ?? GGColors.buttonTextWhite.color,
              rightBtnBackgroundColor ?? GGColors.highlightButton.color,
              onRightBtnPressed,
              context,
            ),
        ],
      ),
    );
  }

  /// 拓展widget
  Widget _moreWidget() {
    if (moreWidget == null) return Container();
    return moreWidget!;
  }

  Widget _clickRightView(
    String btnName,
    Color textColor,
    Color bgColor,
    Function? btnClick,
    BuildContext context,
  ) {
    return TimerWidget(
      stop: Duration(seconds: (rightCountdown ?? 0)),
      builder: (BuildContext context) {
        bool enable = true;
        String title = btnName;
        if (rightCountdown is num && rightCountdown! >= 1) {
          enable = false;
          title = '$btnName($rightCountdown)';
          rightCountdown = rightCountdown! - 1;
        }
        return Expanded(
          child: Opacity(
            opacity: enable ? 1.0 : 0.5,
            child: ScaleTap(
              behavior: HitTestBehavior.opaque,
              onPressed: !enable
                  ? () {}
                  : () {
                      if (btnClick == null) {
                        Navigator.of(context).pop();
                      } else {
                        btnClick.call();
                      }
                    },
              child: Container(
                height: 42.dp,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(4.dp),
                ),
                child: Text(
                  title,
                  style: GGTextStyle(
                    color: textColor,
                    fontSize: GGFontSize.smallTitle,
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _clickView(
    String btnName,
    Color textColor,
    Color bgColor,
    Function? btnClick,
    BuildContext context,
  ) {
    return Expanded(
      child: ScaleTap(
        behavior: HitTestBehavior.opaque,
        onPressed: () {
          if (btnClick == null) {
            Navigator.of(context).pop();
          } else {
            btnClick.call();
          }
        },
        child: Container(
          height: 42.dp,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(4.dp),
          ),
          child: Text(
            btnName,
            style: GGTextStyle(
              color: textColor,
              fontSize: GGFontSize.smallTitle,
            ),
          ),
        ),
      ),
    );
  }
}
