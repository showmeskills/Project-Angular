import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';
import 'package:gogaming_app/router/kyc_middle_ware.dart.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import '../../../R.dart';
import '../../../common/api/country/models/gaming_country_model.dart';
import '../../../common/service/kyc_service.dart';
import '../../../common/widgets/appbar/appbar.dart';
import '../../../common/widgets/gaming_bottom_sheet.dart';
import '../../../common/widgets/gaming_country_selector/gaming_country_selector.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';

import '../../../common/widgets/gg_dialog/dialog_util.dart';
import 'gg_kyc_middle_logic.dart';
import 'gg_kyc_middle_state.dart';

class GGKycMiddlePage extends BaseView<GGKycMiddleLogic> {
  const GGKycMiddlePage({super.key});

  GGKycMiddleState get state => logic.state;
  GGKycMiddleLogic get logic => Get.find<GGKycMiddleLogic>();

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
        name: route,
        middlewares: [LoginMiddleware(), KycLevelMiddleware()],
        page: () {
          return const GGKycMiddlePage();
        });
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      bottomBackgroundColor: GGColors.background.color,
      title: localized('inter_ceri'),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  bool showTopTips() => false;

  @override
  Widget body(BuildContext context) {
    Get.put(GGKycMiddleLogic());
    return content(context);
  }

  Widget content(BuildContext context) {
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
          _buildHint(localized("issue_c")),
          Gaps.vGap4,
          _buildSelectCountry(),
          Gaps.vGap24,
          _buildNames(),
          Gaps.vGap24,
          _buildVer(),
          Gaps.vGap24,
          _buildWarning(context),
          Gaps.vGap16,
          _buildButtons(),
          _buildBottomTip()
        ],
      ),
    );
  }

  Widget _buildVer() {
    return Obx(() {
      if (state.isChina.value) {
        return _buildChinaVer();
      } else {
        return _buildForeignVer();
      }
    });
  }

  Widget _buildForeignVer() {
    return Obx(() {
      return Column(
        children: [
          _buildForeigWarningTip(),
          ..._buildForeignVerTypeArea(),
        ],
      );
    });
  }

  List<Widget> _buildForeignVerTypeArea() {
    List<Widget> result = <Widget>[];
    if (state.currentVerType.value.idcardAllowed ?? false) {
      result.add(Gaps.vGap24);
      result.add(_foreignVerBox(VerType.idCard));
    }
    if (state.currentVerType.value.passportAllowed ?? false) {
      result.add(Gaps.vGap24);
      result.add(_foreignVerBox(VerType.passport));
    }
    if (state.currentVerType.value.driverLicenseAllowed ?? false) {
      result.add(Gaps.vGap24);
      result.add(_foreignVerBox(VerType.driverLicense));
    }
    return result;
  }

  Widget _foreignVerBox(VerType type) {
    String? icon;
    String? name;
    switch (type) {
      case VerType.idCard:
        icon = R.kycKycIdcard;
        name = localized("id_card");
        break;
      case VerType.passport:
        icon = R.kycKycPassport;
        name = localized("passport");
        break;
      case VerType.driverLicense:
        icon = R.kycKycDriverLicense;
        name = localized("driver_license");
        break;
      case VerType.none:
        break;
    }

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => logic.selectVerType(type),
      child: Obx(() {
        return Container(
          height: 66.dp,
          decoration: BoxDecoration(
            color: GGColors.border.color,
            borderRadius: BorderRadius.circular(12.dp),
            border: Border.all(
              color: state.currentSelectVerType.value == type
                  ? GGColors.highlightButton.color
                  : Colors.transparent,
              width: 1.dp,
            ),
          ),
          child: Row(
            children: [
              Gaps.hGap12,
              Image.asset(
                icon ?? "",
                height: 24.dp,
              ),
              Gaps.hGap10,
              Text(
                name ?? "",
                style: GGTextStyle(
                  color: GGColors.textMain.color,
                  fontSize: GGFontSize.content,
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildForeigWarningTip() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          localized("vaild_doc"),
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.medium,
          ),
        ),
        Text(
          localized("only_acc"),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.hint,
          ),
        ),
      ],
    );
  }

  Widget _buildChinaVer() {
    return Column(
      children: [
        ..._buildIdCardTF(),
        Gaps.vGap24,
        _buildBankVerCardTF(),
      ],
    );
  }

  Widget _buildBottomTip() {
    return Row(
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
    );
  }

  Widget _buildButtons() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      mainAxisSize: MainAxisSize.max,
      children: [
        Expanded(
          child: GGButton(
            onPressed: () => Get.back<dynamic>(),
            backgroundColor: GGColors.border.color,
            text: getLocalString('think_again'),
          ),
        ),
        Gaps.hGap12,
        Expanded(
          child: Obx(() {
            return GGButton(
              onPressed: () => logic.submit(),
              enable: state.buttonEnable.value,
              isLoading: state.isLoading.value,
              text: getLocalString('continue'),
            );
          }),
        )
      ],
    );
  }

  Widget _buildWarning(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SvgPicture.asset(
          R.iconTipIcon,
          width: 14.dp,
          height: 14.dp,
        ),
        Gaps.hGap4,
        Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width - 52.dp,
          ),
          child: Text(
            localized("ver_limit"),
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.hint,
            ),
            maxLines: 3,
          ),
        )
      ],
    );
  }

  Widget _buildNames() {
    return Obx(() {
      if (state.showFullName) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildHint(
              localized("name"),
              showStar: true,
              subMessage: localized("fullname_notice"),
            ),
            Gaps.vGap4,
            Obx(() {
              return GamingTextField(
                controller: state.fullNameController.value,
                fillColor: GGColors.transparent,
                enabled: false,
              );
            }),
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

  Widget _buildFirstNameTF() {
    return Obx(() {
      return GamingTextField(
        controller: state.firstNameController.value,
        fillColor: GGColors.transparent,
        enabled: false,
      );
    });
  }

  Widget _buildLastNameTF() {
    return Obx(() {
      return GamingTextField(
        controller: state.lastNameController.value,
        fillColor: GGColors.transparent,
        enabled: false,
      );
    });
  }

  List<Widget> _buildIdCardTF() {
    return [
      _buildHint(
        localized("id_num"),
        showStar: true,
      ),
      Gaps.vGap4,
      GamingTextField(
        controller: state.idCardController,
        fillColor: GGColors.transparent,
        keyboardType: TextInputType.text,
      ),
    ];
  }

  Widget _buildBankVerCardTF() {
    return Obx(() {
      return Column(
        children: [
          _buildHint(
            localized("bank_number"),
            showStar: true,
          ),
          Gaps.vGap4,
          GamingTextField(
            controller: state.bankCardController,
            fillColor: GGColors.transparent,
            keyboardType: TextInputType.number,
          ),
          state.expandPhoneVer.value == true ? _buildPhoneVer() : Container()
        ],
      );
    });
  }

  Widget _buildPhoneVer() {
    return Column(
      children: [
        Gaps.vGap16,
        _buildHint(
          localized("bank_phone"),
          showStar: true,
        ),
        Gaps.vGap4,
        GamingTextField(
          controller: state.phoneController,
          fillColor: GGColors.transparent,
          keyboardType: TextInputType.number,
        ),
        Gaps.vGap16,
        _buildHint(
          localized("verification_code_text"),
          showStar: true,
        ),
        Gaps.vGap4,
        _buildCodeTF()
      ],
    );
  }

  Widget _buildCodeTF() {
    return CheckPhoneTextField(
        fillColor: GGColors.transparent,
        controller: state.codeController,
        onCheckPhone: () {
          switch (state.phoneCodeState.value) {
            case PhoneCodeState.send:
              break;
            case PhoneCodeState.unSend:
              controller.sendPhoneCheck();
              break;
            case PhoneCodeState.reSend:
              controller.sendPhoneCheck();
              break;
          }
        },
        checkPhoneSendWidget: Obx(() {
          return _getCheckPhoneSendWidget();
        }));
  }

  Widget _getCheckPhoneSendWidget() {
    switch (state.phoneCodeState.value) {
      case PhoneCodeState.unSend:
        return Text(
          getLocalString('get_verification_code_button'),
          style: GGTextStyle(
              color: GGColors.brand.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
      case PhoneCodeState.reSend:
        return Text(
          getLocalString('resend'),
          style: GGTextStyle(
              color: GGColors.brand.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
      case PhoneCodeState.send:
        return Text(
          state.secondLeft.value.toString() + getLocalString('resend_info_app'),
          style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
    }
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
            color: state.isAsia ? null : GGColors.border.color,
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

extension _Action on GGKycMiddlePage {
  void _onCountryChange(GamingCountryModel? country) {
    if (country != null) {
      /// 之前的认证为亚洲区，切换为非亚洲区国家时
      /// 弹出提示阻断用户
      if (KycService.sharedInstance.isAsia &&
          !KycService.sharedInstance.isAsiaISO(country.iso)) {
        final dialog = DialogUtil(
            context: Get.context!,
            iconPath: R.commonDialogErrorBig,
            iconWidth: 80.dp,
            iconHeight: 80.dp,
            title: localized('hint'),
            content: localized("country_selecter_notice"),
            leftBtnName: localized("cancels"),
            rightBtnName: localized("cs_text"),
            contentMaxLine: 4,
            onRightBtnPressed: () {
              CustomerServiceRouter().toNamed();
            });
        dialog.showNoticeDialogWithTwoButtons();
        return;
      }

      logic.updateCurrentCountry(country);
    }
  }

  void _pressSelectCountry() {
    /// 欧洲版不支持切换国籍
    if (!state.isAsia) {
      return;
    }
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
}
