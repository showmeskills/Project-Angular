import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

abstract class AdvancedCertificationBaseView<C extends BaseController>
    extends BaseView<C> {
  const AdvancedCertificationBaseView({
    super.key,
  });

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: title,
      titleStyle: GGTextStyle(
        fontSize: GGFontSize.superBigTitle,
        color: GGColors.textMain.color,
      ),
      centerTitle: false,
    );
  }

  String get title;
  String? get subTitle => null;

  @override
  bool? showTopTips() {
    return false;
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  Widget buildTitle() {
    if (subTitle != null) {
      return Text(
        subTitle!,
        style: GGTextStyle(
          fontSize: GGFontSize.bigTitle20,
          color: GGColors.textMain.color,
        ),
      );
    }
    return Gaps.empty;
  }

  Widget bodyContainer({
    required Widget child,
  }) {
    return Container(
      // width: double.infinity,
      // height: double.infinity,
      // decoration: BoxDecoration(
      //   color: GGColors.moduleBackground.color,
      //   borderRadius: BorderRadius.vertical(
      //     top: Radius.circular(25.dp),
      //   ),
      // ),
      padding: EdgeInsets.symmetric(
        horizontal: 16.dp,
      ),
      child: child,
    );
  }

  @override
  Widget body(BuildContext context) {
    return bodyContainer(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Gaps.vGap12,
            buildTitle(),
            buildContent(context),
            _buildButton(),
          ],
        ),
      ),
    );
  }

  Widget buildContent(BuildContext context);
  Widget buildSubmitButton();

  Widget _buildButton() {
    return SafeArea(
      top: false,
      bottom: true,
      minimum: EdgeInsets.only(bottom: 30.dp),
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            child: buildSubmitButton(),
          ),
          Gaps.vGap20,
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                alignment: Alignment.center,
                height: GGFontSize.content.fontSize * 1.4,
                child: SvgPicture.asset(
                  R.iconSafety,
                  width: 14.dp,
                  height: 16.dp,
                ),
              ),
              Gaps.hGap10,
              Expanded(
                child: Text(
                  localized('advance_kyc_tips'),
                  style: GGTextStyle(
                    color: GGColors.textSecond.color,
                    fontSize: GGFontSize.content,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
