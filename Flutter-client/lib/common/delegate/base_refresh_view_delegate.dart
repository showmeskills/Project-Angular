import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart' hide RefreshIndicator;
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/common/widgets/go_gaming_empty.dart';
import 'package:gogaming_app/common/widgets/go_gaming_loading.dart';
import 'package:gogaming_app/common/widgets/go_gaming_no_more.dart';

mixin BaseRefreshViewDelegate implements RefreshViewDelegate {
  RefreshViewController get renderController;

  String? get emptyText => null;

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return GoGamingEmpty(text: emptyText);
  }

  @override
  Widget? getFailedWidget(BuildContext context,
      [void Function()? onErrorPressed]) {
    return null;
  }

  @override
  Widget? getLoadingWidget(BuildContext context) {
    return const GoGamingLoading();
  }

  Color get footerColor => GGColors.transparent.color;

  @override
  LoadIndicator getFooterWidget(BuildContext context) {
    return CustomFooter(
      height: MediaQuery.of(context).padding.bottom + 60.dp,
      builder: (context, mode) {
        if (mode == null) {
          return const SizedBox();
        }
        return Material(
          color: footerColor,
          child: SafeArea(
            bottom: true,
            child: Container(
              height: 60.dp,
              alignment: Alignment.center,
              child: Builder(
                builder: (context) {
                  if (mode == LoadStatus.noMore) {
                    return getNoMoreWidget(context);
                  }
                  String? text;
                  switch (mode) {
                    case LoadStatus.canLoading:
                      text = '松开加载';
                      break;
                    case LoadStatus.failed:
                      text = '加载失败';
                      break;
                    case LoadStatus.loading:
                      return GoGamingLoading(
                        size: 16.dp,
                      );
                    default:
                      text = '上拉加载';
                      break;
                  }
                  return Text(
                    text,
                    style: GGTextStyle(
                      color: GGColors.textHint.color,
                      fontSize: GGFontSize.hint,
                      fontWeight: GGFontWeigh.regular,
                    ),
                  );
                },
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  RefreshIndicator getHeaderWidget(BuildContext context) {
    return CustomHeader(
      height: 48.dp,
      builder: (context, mode) {
        return Container(
          alignment: Alignment.center,
          height: 48.dp,
          child: const GoGamingLoading(),
        );
      },
    );
  }

  @override
  Widget getNoMoreWidget(BuildContext context) {
    return const GoGamingNoMore();
  }

  void onErrorPressed() {
    renderController.reInitial(refresh: true);
  }
}
