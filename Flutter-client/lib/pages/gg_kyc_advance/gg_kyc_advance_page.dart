import 'package:flutter/material.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/gg_kyc_advance/gg_kyc_advance_state.dart';
import 'package:gogaming_app/pages/gg_kyc_advance/gg_kyc_advance_upload_page.dart';
import 'package:gogaming_app/router/kyc_middle_ware.dart.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../R.dart';
import '../../common/api/country/models/gaming_country_model.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gaming_bottom_sheet.dart';
import '../../common/widgets/gaming_country_selector/gaming_country_selector.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_button.dart';
import 'gg_kyc_advance_logic.dart';

class GGKycAdvancePage extends BaseView<GGKycAdvanceLogic> {
  const GGKycAdvancePage({Key? key}) : super(key: key);
  GGKycAdvanceState get state => Get.find<GGKycAdvanceLogic>().state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware(), KycAdvanceMiddleware()],
      page: () => const GGKycAdvancePage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      bottomBackgroundColor: GGColors.background.color,
      title: localized('ad_ceri'),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  Widget body(BuildContext context) {
    Get.put(GGKycAdvanceLogic());
    return Container(
      decoration: BoxDecoration(
        color: GGColors.moduleBackground.color,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(16.dp),
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
          Text(
            localized("confirm_ad"),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap24,
          _buildHint(localized("c_r")),
          Gaps.vGap4,
          _buildSelectCountry(),
          Gaps.vGap24,
          ..._builPlaceTF(),
          Gaps.vGap24,
          ..._builAreaCodeTF(),
          Gaps.vGap24,
          ..._builCityTF(),
          Gaps.vGap24,
          _buildBottomHint(),
        ],
      ),
    );
  }

  Widget _buildBottomHint() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Obx(() {
          return SizedBox(
            width: double.infinity,
            child: GGButton.main(
              onPressed: _pressContinue,
              enable: state.continueEnable.value,
              text: localized('continue'),
            ),
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
            Gaps.vGap10,
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

  List<Widget> _builCityTF() {
    return [
      _buildHint(
        localized("city"),
        showStar: true,
      ),
      Gaps.vGap4,
      GamingTextField(
        controller: state.cityController,
        fillColor: GGColors.transparent,
      ),
    ];
  }

  List<Widget> _builPlaceTF() {
    return [
      _buildHint(
        localized("residence_ad"),
        showStar: true,
      ),
      Gaps.vGap4,
      GamingTextField(
        controller: state.placeController,
        fillColor: GGColors.transparent,
      ),
    ];
  }

  List<Widget> _builAreaCodeTF() {
    return [
      _buildHint(
        localized("pt_c"),
        showStar: true,
      ),
      Gaps.vGap4,
      GamingTextField(
        controller: state.areaCodeController,
        fillColor: GGColors.transparent,
      ),
    ];
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
                if (showStar)
                  TextSpan(
                    text: '*',
                    style: GGTextStyle(
                      color: GGColors.highlightButton.color,
                      fontSize: GGFontSize.content,
                    ),
                  ),
                TextSpan(text: text),
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

  Widget _buildSelectCountry() {
    return Obx(() {
      final GamingCountryModel country = state.currentCountry.value;
      return GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => _pressSelectCountry(),
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
              Image.asset(country.icon, width: 18.dp, height: 18.dp),
              Gaps.hGap12,
              Text(
                country.name,
                style: GGTextStyle(
                  color: GGColors.textMain.color,
                  fontSize: GGFontSize.content,
                ),
              ),
              const Spacer(),
              SvgPicture.asset(R.iconDown, width: 10.dp, height: 8.dp),
              Gaps.hGap14,
            ],
          ),
        ),
      );
    });
  }
}

extension _Action on GGKycAdvancePage {
  void _onCountryChange(GamingCountryModel? country) {
    if (country != null) {
      state.currentCountry.value = country;
    }
  }

  void _pressSelectCountry() {
    _showCountrySelector().then((value) {
      _onCountryChange(value);
    });
  }

  Future<GamingCountryModel?> _showCountrySelector() async {
    return GamingBottomSheet.show<GamingCountryModel?>(
      title: localized('select_country'),
      builder: (context) {
        return const CountrySelectorListView(
          showAreaCode: false,
        );
      },
    );
  }

  void _pressContinue() {
    Get.to<dynamic>(
      () => GGKycAdvanceUploadPage(
        state.currentCountry.value.iso,
        state.areaCodeController.text.value,
        state.cityController.text.value,
        state.placeController.text.value,
      ),
    );
  }
}
