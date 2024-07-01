import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/widgets/gaming_country_selector/gaming_country_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/config/config.dart';

// import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/widget_header.dart';

class LoginMobileView extends StatelessWidget {
  const LoginMobileView({
    Key? key,
    required this.mobile,
    required this.mobilePassword,
    required this.onCountryChanged,
    this.selectCountry,
    required this.buildFooter,
    required this.isRequesting,
  }) : super(key: key);

  final GamingTextFieldController mobile;
  final GamingTextFieldController mobilePassword;
  final GamingCountryModel? selectCountry;
  final void Function(GamingCountryModel value) onCountryChanged;
  final List<Widget> buildFooter;
  final RxBool isRequesting;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
        padding: EdgeInsetsDirectional.only(start: 24.dp, end: 24.dp),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 20.dp),
            _buildTitle(localized('phone_text')),
            SizedBox(height: 8.dp),
            _buildMobileTF(),
            SizedBox(height: 24.dp),
            _buildTitle(localized('password')),
            SizedBox(height: 8.dp),
            _buildPasswordTF(),
            SizedBox(height: 24.dp),
            ...buildFooter,
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordTF() {
    return Obx(() {
      return GamingPasswordTextField(
        controller: mobilePassword,
        enabled: !isRequesting.value,
        fillColor:
            Config.isM1 ? GGColors.alertBackground : GGColors.moduleBackground,
      );
    });
  }

  Widget _buildMobileTF() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GamingCountrySelector(
          initialValue: selectCountry,
          background: Config.isM1
              ? GGColors.alertBackground.color
              : GGColors.moduleBackground.color,
          onChanged: (country) {
            if (country != null) onCountryChanged(country);
          },
        ),
        Gaps.hGap8,
        Expanded(
          child: Obx(() {
            return GamingTextField(
              controller: mobile,
              keyboardType: TextInputType.number,
              enabled: !isRequesting.value,
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[0-9]')),
              ],
              fillColor: Config.isM1
                  ? GGColors.alertBackground
                  : GGColors.moduleBackground,
            );
          }),
        ),
      ],
    );
  }

  Widget _buildTitle(String text) {
    return Text(
      text,
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textSecond.color,
      ),
    );
  }
}
