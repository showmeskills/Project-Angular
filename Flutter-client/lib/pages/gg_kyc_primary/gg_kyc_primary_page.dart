import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/components/extensions/gg_reg_exp.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_date_picker.dart';
import 'package:gogaming_app/common/widgets/gaming_country_selector/gaming_country_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gg_kyc_primary_logic.dart';
import 'gg_kyc_primary_state.dart';

class GGKycPrimaryPage extends BaseView<GGKycPrimaryLogic> {
  const GGKycPrimaryPage({
    Key? key,
    this.closeAfterSuccess = false,
  }) : super(key: key);

  // 强制认证成功后关闭页面
  final bool closeAfterSuccess;

  GGKycPrimaryState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          GGKycPrimaryPage.argument(Get.arguments as Map<String, dynamic>?),
    );
  }

  factory GGKycPrimaryPage.argument(Map<String, dynamic>? arguments) {
    return GGKycPrimaryPage(
      closeAfterSuccess: arguments?['closeAfterSuccess'] as bool? ?? false,
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      bottomBackgroundColor: GGColors.background.color,
      title: localized('basic_ver'),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  Widget body(BuildContext context) {
    Get.put(GGKycPrimaryLogic(closeAfterSuccess));
    return _buildContent(context);
  }

  Widget _buildContent(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.moduleBackground.color,
        borderRadius: const BorderRadiusDirectional.only(
          topStart: Radius.circular(25),
          topEnd: Radius.circular(25),
        ),
      ),
      child: ListView(
        padding: EdgeInsetsDirectional.only(
          top: 24.dp,
          start: 16.dp,
          end: 16.dp,
          bottom: 16.dp,
        ),
        physics: const ClampingScrollPhysics(),
        children: [
          _buildTitle(context),
          Gaps.vGap16,
          _buildWidgetsNames(),
          _buildWidgetsNotChina(),
          Gaps.vGap24,
          _buildHint(
            localized('phone'),
            showStar: true,
          ),
          Gaps.vGap4,
          _buildMobileTF(),
          Gaps.vGap24,
          _buildCodeWidget(),
          _buildBottomHint(context),
        ],
      ),
    );
  }

  Widget _buildPostCodeTF() {
    return GamingTextField(
      controller: state.postCode,
      fillColor: GGColors.transparent,
    );
  }

  Widget _buildCityTF() {
    return GamingTextField(
      controller: state.city,
      fillColor: GGColors.transparent,
    );
  }

  Widget _buildAddressTF() {
    return GamingTextField(
      controller: state.address,
      fillColor: GGColors.transparent,
    );
  }

  Widget _buildEmailTF() {
    final canEditEmail = state.isNotBindEmail;
    return Opacity(
      opacity: canEditEmail ? 1.0 : 0.5,
      child: IgnorePointer(
        ignoring: !canEditEmail,
        child: GamingTextField(
          controller: state.email,
          fillColor: GGColors.transparent,
        ),
      ),
    );
  }

  Widget _buildCodeWidget() {
    return Visibility(
      visible: state.isNotBindPhone,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildHint(
            localized('verification_code_text'),
            showStar: true,
          ),
          Gaps.vGap4,
          MobileVerificationCodeWidget(
            controller.state.codeController,
            VerifyAction.bindMobile,
            isVoice: controller.isVoice,
            fullMobileController: controller.state.phoneController,
            country: () {
              return controller.state.currentCountry.value;
            },
          ),
          Gaps.vGap16,
        ],
      ),
    );
  }

  Widget _buildWidgetsNames() {
    return Obx(() {
      if (controller.showFullName) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildHint(
              localized('name'),
              showStar: true,
              subMessage: localized('fullname_notice'),
            ),
            Gaps.vGap4,
            _buildNameTF(),
          ],
        );
      } else {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildHint(
              localized('first_name'),
              showStar: true,
            ),
            Gaps.vGap4,
            _buildFirstNameTF(),
            Gaps.vGap24,
            _buildHint(
              localized('last_name'),
              showStar: true,
            ),
            Gaps.vGap4,
            _buildLastNameTF(),
          ],
        );
      }
    });
  }

  Widget _buildWidgetsNotChina() {
    return Obx(() {
      if (!state.currentCountry.value.isChina) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Gaps.vGap24,
            _buildHint(
              localized('date_birthday'),
              showStar: true,
            ),
            Gaps.vGap4,
            _buildSelectBirthday(),
            Gaps.vGap24,
            _buildHint(
              localized('email'),
              showStar: true,
            ),
            Gaps.vGap4,
            _buildEmailTF(),
            Gaps.vGap24,
            _buildHint(
              localized('residence_ad'),
              showStar: true,
            ),
            Gaps.vGap4,
            _buildAddressTF(),
            Gaps.vGap24,
            _buildHint(
              localized('pt_c'),
              showStar: true,
            ),
            Gaps.vGap4,
            _buildPostCodeTF(),
            Gaps.vGap24,
            _buildHint(
              localized('city'),
              showStar: true,
            ),
            Gaps.vGap4,
            _buildCityTF(),
          ],
        );
      } else {
        return const SizedBox(height: 0);
      }
    });
  }

  Widget _buildSelectBirthday() {
    // return Obx(() {
    return Column(
      children: [
        InkWell(
          onTap: _pressSelectDate,
          child: Container(
            width: double.infinity,
            decoration: BoxDecoration(
              border: Border.all(
                color: GGColors.border.color,
                width: 1.dp,
              ),
              borderRadius: BorderRadius.circular(4.dp),
            ),
            child: Row(
              children: [
                SizedBox(height: 48.dp, width: 12.dp),
                // Text(
                //   state.birthday.value,
                //   style: GGTextStyle(
                //     color: GGColors.textMain.color,
                //     fontSize: GGFontSize.content,
                //   ),
                // ),
                KycDateInputWidget(
                  controller: state.dateInputController,
                  inputFormatter: [
                    FilteringTextInputFormatter.allow(RegExp(r'\u200b|[0-9]')),
                  ],
                  hintStyle: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textHint.color,
                  ),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                  // onCompleted: controller.setInputDate,
                  onChanged: controller.setInputDate,
                ),
                const Spacer(),
                Image.asset(
                  R.kycCalendar,
                  width: 16.dp,
                  height: 16.dp,
                  color: GGColors.textSecond.color,
                ),
                Gaps.hGap14,
              ],
            ),
          ),
        ),
        Gaps.vGap2,
        Visibility(
          visible: state.showDateError.value,
          child: Row(
            children: [
              Expanded(
                child: Text(
                  localized('invalid_date'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.error.color,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
    // });
  }

  Widget _buildMobileTF() {
    return Obx(() {
      final GamingCountryModel country = state.currentCountry.value;
      final canEditCountry = state.isNotBindPhone;
      return Opacity(
        opacity: canEditCountry ? 1.0 : 0.5,
        child: IgnorePointer(
          ignoring: !canEditCountry,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GamingCountrySelector(
                key: ValueKey(country),
                onChanged: _onCountryChange,
                initialValue: country,
                background: Colors.transparent,
              ),
              Gaps.hGap8,
              Expanded(
                child: GamingTextField(
                  controller: state.phoneController,
                  keyboardType: TextInputType.number,
                  fillColor: GGColors.transparent,
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(GGRegExp.onlyNumber),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildNameTF() {
    return Obx(() {
      return GamingTextField(
        controller: state.nameController.value,
        fillColor: GGColors.transparent,
        // inputFormatters: [
        //   FilteringTextInputFormatter.deny(GGRegExp.endWithSpace),
        // ],
      );
    });
  }

  Widget _buildFirstNameTF() {
    return Obx(() {
      return GamingTextField(
        controller: state.firstNameController.value,
        fillColor: GGColors.transparent,
      );
    });
  }

  Widget _buildLastNameTF() {
    return Obx(() {
      return GamingTextField(
        controller: state.lastNameController.value,
        fillColor: GGColors.transparent,
      );
    });
  }

  Widget _buildBottomHint(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Obx(() {
          return Row(
            children: [
              Expanded(
                child: GGButton.main(
                  onPressed: _pressContinue,
                  enable: state.continueEnable.value,
                  isLoading: state.isVerifyLoading.value,
                  text: localized('continue'),
                ),
              ),
            ],
          );
        }),
        Row(
          children: [
            SizedBox(height: 50.dp),
            SvgPicture.asset(
              R.kycKycCheck,
              width: 16.dp,
              height: 16.dp,
            ),
            SizedBox(width: 10.dp),
            Expanded(
              child: Text(
                localized('secure_info'),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.hint,
                ),
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildHint(String text,
      {bool showStar = false, String subMessage = ''}) {
    return Row(
      children: [
        Expanded(
          child: Text.rich(
            TextSpan(
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
              children: [
                TextSpan(text: text),
                if (showStar)
                  TextSpan(
                    text: '*',
                    style: GGTextStyle(
                      color: GGColors.highlightButton.color,
                      fontSize: GGFontSize.content,
                    ),
                  ),
                if (subMessage.isNotEmpty)
                  TextSpan(
                    text: '  $subMessage  ',
                    style: GGTextStyle(
                      fontSize: GGFontSize.hint,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTitle(BuildContext context) {
    return Row(
      children: [
        Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width / 2 - 10.dp,
          ),
          child: Text(
            localized('id_info'),
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.bold,
            ),
            maxLines: 2,
          ),
        ),
        const Spacer(),
        SvgPicture.asset(
          state.isNotBindPhone ? R.kycKycClose : R.kycCircleCheckedGreen,
          width: 12.5.dp,
          height: 12.5.dp,
          color: state.isNotBindPhone ? GGColors.textHint.color : null,
        ),
        Gaps.hGap4,
        Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width / 2 - 10.dp,
          ),
          child: Text(
            localized(state.isNotBindPhone ? 'un_phone' : 'bounded_phone'),
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.content,
            ),
            maxLines: 2,
          ),
        ),
      ],
    );
  }
}

extension _Action on GGKycPrimaryPage {
  void _pressSelectDate() {
    GamingDatePicker.openDatePicker(
      initialDate: state.selectedDate,
      // minDate: DateTime(DateTime.now().year - 100, 1, 1),
      maxDate: DateTime.now(),
    ).then((date) {
      if (date is DateTime) {
        controller.setSelectedDate(date);
      }
    });
  }

  void _onCountryChange(GamingCountryModel? country) {
    if (country != null) {
      controller.setCurrentCountry(country);
    }
  }

  void _pressContinue() {
    controller.requestPrimary(mobile: state.phoneController.text.value);
  }
}
