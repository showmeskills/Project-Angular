// ignore_for_file: public_member_api_docs, sort_constructors_first
// ignore_for_file: inference_failure_on_instance_creation

import 'dart:async';

import 'package:flutter/material.dart';

import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/widget_header.dart';

enum GgToastState {
  success,
  fail,
}

class ToastModel {
  final GgToastState state;
  final String title;
  final String message;
  final int maxLines;

  Completer<void> completer = Completer();

  final uniqueKey = DateTime.now().microsecondsSinceEpoch;

  ToastModel({
    required this.state,
    required this.title,
    required this.message,
    this.maxLines = 2,
  });

  void complete() {
    if (!completer.isCompleted) {
      completer.complete();
    }
  }

  // 重载==运算符，如果两次内容一致则认为是同一个toast
  @override
  bool operator ==(Object other) {
    return other is ToastModel &&
        state == other.state &&
        title == other.title &&
        message == other.message &&
        maxLines == other.maxLines;
  }

  @override
  int get hashCode {
    return state.hashCode ^
        title.hashCode ^
        message.hashCode ^
        maxLines.hashCode;
  }
}

/// 利用overlay实现Toast
class Toast {
  static OverlayEntry? overlayEntry;

  static final List<ToastModel> _list = <ToastModel>[];

  static final _length = 0.obs;
  static int get length => _length.value;

  static final _top = 12.dp.obs;
  static final _right = 12.dp.obs;

  /// 提示功能开发中
  static Future<void> showFunDev() {
    return Toast.showDetail(
      context: Get.overlayContext!,
      state: GgToastState.fail,
      title: localized('hint'),
      message: localized('fun_dev'),
      top: 12.dp,
      right: 12.dp,
    );
  }

  static Future<void> showTryLater({bool isNetworkError = false}) {
    return Toast.showDetail(
      context: Get.overlayContext!,
      state: GgToastState.fail,
      title: localized('hint'),
      message: localized('try_later'),
      top: 12.dp,
      right: 12.dp,
    );
  }

  static Future<void> showFailed([String? message]) {
    return Toast.showDetail(
      state: GgToastState.fail,
      title: localized('failed'),
      message: message ?? localized('try_later'),
      top: 12.dp,
      right: 12.dp,
    );
  }

  static Future<void> showSuccessful([String? message]) {
    return Toast.showDetail(
      state: GgToastState.success,
      title: localized('successful'),
      message: message ?? '',
      top: 12.dp,
      right: 12.dp,
    );
  }

  static Future<void> showMessage({
    BuildContext? context,
    required GgToastState state,
    required String message,
  }) {
    return Toast.showDetail(
      context: context,
      state: state,
      title: '',
      message: message,
      top: 12.dp,
      right: 12.dp,
    );
  }

  static Future<void> show({
    BuildContext? context,
    required GgToastState state,
    required String title,
    required String message,
    int contentMaxLines = 2,
  }) {
    return Toast.showDetail(
      context: context,
      state: state,
      title: title,
      message: message,
      top: 12.dp,
      right: 12.dp,
      contentMaxLines: contentMaxLines,
    );
  }

  /// message中是 <E00378>网络错误
  /// 解析重组title和messageE开头的错误码
  static (String, String) _parseMessage(String title, String message) {
    String errorCode = '';
    String newMessage = message;

    RegExp regex = RegExp(r'\<(E\d+)\>');
    Match? match = regex.firstMatch(message);
    if (match != null) {
      errorCode = match.group(1)!;
      newMessage = message.replaceAll(match.group(0)!, '');
    }
    if (errorCode.isNotEmpty) {
      if (title.isNotEmpty) {
        title += ' $errorCode';
      } else {
        newMessage = '[$errorCode] $newMessage';
      }
    }

    return (title, newMessage);
  }

  static Future<void> showDetail({
    BuildContext? context,
    required GgToastState state,
    required String title,
    required String message,
    int contentMaxLines = 2,
    double top = 0,
    double right = 0,
    bool safeArea = true,
  }) {
    final (String newTitle, String newMessage) = _parseMessage(title, message);

    return _show(
      state: state,
      title: newTitle,
      message: newMessage,
      maxLines: contentMaxLines,
      top: top,
      right: right,
      safeArea: safeArea,
    );
  }

  static Future<void> _show({
    required GgToastState state,
    required String title,
    required String message,
    int maxLines = 2,
    double top = 0,
    double right = 0,
    bool safeArea = true,
  }) {
    _top(top);
    _right(right);

    final item = ToastModel(
      state: state,
      title: title,
      message: message,
      maxLines: maxLines,
    );

    // 重复的toast，先移除，再追加新的
    final old = _list.firstWhereOrNull((e) => e == item);
    if (old != null) {
      _remove(old);
    }

    _list.add(item);

    if (overlayEntry == null) {
      overlayEntry = OverlayEntry(builder: (context) {
        return _builder(safeArea: safeArea);
      });
      Overlay.of(Get.overlayContext!).insert(overlayEntry!);
    }
    _length.value = _list.length;
    // item.startTimer();
    return item.completer.future;
  }

  static void _remove(ToastModel model) {
    // model.cancelTimer();
    model.complete();
    _list.remove(model);
    _length.value = _list.length;
  }

  static void dismiss(
    ToastModel model,
  ) {
    _remove(model);
    if (_list.isEmpty) {
      overlayEntry?.remove();
      overlayEntry = null;
    }
  }

  static Widget _builder({bool safeArea = true}) {
    return Obx(() {
      return Positioned(
        top: _top.value,
        right: _right.value,
        child: SafeArea(
          top: safeArea,
          bottom: false,
          child: Obx(() {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: List.generate(length, (index) {
                final model = _list[index];
                return _content(model);
              }),
            );
          }),
        ),
      );
    });
  }

  static Widget _content(
    ToastModel model,
  ) {
    return Container(
      margin: EdgeInsets.only(bottom: 12.dp),
      constraints: BoxConstraints(
        maxWidth: 252.dp,
      ),
      decoration: BoxDecoration(
        color: GGColors.homeFootBackground.color,
        borderRadius: BorderRadius.circular(4.dp),
      ),
      child: IntrinsicWidth(
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: EdgeInsets.only(left: 16.dp, right: 10.dp),
                  child: Image.asset(
                    model.state == GgToastState.success
                        ? R.commonToastSuccess //'assets/images/common/toast_success.png'
                        : R.commonToastError, //'assets/images/common/toast_error.png',
                    width: 18.dp,
                    height: 18.dp,
                  ),
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Gaps.vGap10,
                    _buildTitle(model.title),
                    Gaps.vGap2,
                    _buildMessage(model.message, model.maxLines),
                    Gaps.vGap10,
                  ],
                ),
                Gaps.hGap6,
                InkWell(
                  onTap: () {
                    dismiss(model);
                  },
                  child: SizedBox(
                    width: 16.dp,
                    height: 16.dp,
                    child: SvgPicture.asset(
                      R.iconToastClose,
                      width: 12.dp,
                      height: 12.dp,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ),
                Gaps.hGap16,
              ],
            ),
            _buildLine(model),
          ],
        ),
      ),
    );
  }

  static Widget _buildTitle(String title) {
    if (title.isEmpty) {
      return Container();
    }
    return ConstrainedBox(
      constraints: BoxConstraints(
        maxWidth: 170.dp,
      ),
      child: Text(
        title,
        textAlign: TextAlign.center,
        style: GGTextStyle(
          color: GGColors.textMain.color,
          fontSize: GGFontSize.smallTitle,
          fontWeight: GGFontWeigh.regular,
        ),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  static Widget _buildMessage(String message, int maxLines) {
    if (message.isEmpty) {
      return Container();
    }
    return ConstrainedBox(
      constraints: BoxConstraints(
        maxWidth: 170.dp,
      ),
      child: Text(
        message,
        style: GGTextStyle(
          color: GGColors.textMain.color,
          fontSize: GGFontSize.content,
          fontWeight: GGFontWeigh.regular,
        ),
        maxLines: maxLines,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }

  static Widget _buildLine(
    ToastModel model,
  ) {
    return ClipRRect(
      borderRadius: BorderRadius.all(Radius.circular(1.0.dp)),
      child: SizedBox(
        height: 1.dp,
        child: TweenAnimationBuilder<double>(
          key: ValueKey(model.uniqueKey),
          tween: Tween(begin: 0.0, end: 1.0),
          duration: const Duration(seconds: 5),
          curve: Curves.linear,
          onEnd: () {
            Future.delayed(const Duration(seconds: 1), () {
              dismiss(model);
            });
          },
          builder: (context, value, child) {
            return LinearProgressIndicator(
              backgroundColor: GGColors.popBackground.color,
              valueColor: AlwaysStoppedAnimation(
                model.state == GgToastState.success
                    ? GGColors.success.color
                    : GGColors.error.color,
              ),
              value: value / 1,
            );
          },
        ),
      ),
    );
  }
}
