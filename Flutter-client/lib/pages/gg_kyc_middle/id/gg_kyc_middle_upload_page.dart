import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'dart:io';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/pages/base/base_view.dart';

import '../../../R.dart';
import '../../../common/api/kyc/models/gg_kyc_country.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../common/widgets/appbar/appbar.dart';
import '../../../common/widgets/gaming_selector/gaming_selector.dart';
import '../../../common/widgets/gg_button.dart';
import '../../../config/gaps.dart';
import 'gg_kyc_middle_state.dart';
import 'gg_kyc_middle_upload_logic.dart';

class GGKycMiddleUploadPage extends BaseView<GGKycMiddleUploadLogic> {
  const GGKycMiddleUploadPage({
    super.key,
    required this.countryModel,
    required this.verType,
    required this.countryCode,
    required this.fullName,
    required this.firstName,
    required this.lastName,
  });
  final GamingKycCountryModel countryModel;
  final VerType verType;
  final String countryCode;
  final String fullName;
  final String firstName;
  final String lastName;

  GGKycMiddleUploadLogic get logic => Get.find<GGKycMiddleUploadLogic>();

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          GGKycMiddleUploadPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory GGKycMiddleUploadPage.argument(Map<String, dynamic> arguments) {
    return GGKycMiddleUploadPage(
      countryModel: arguments['countryModel'] as GamingKycCountryModel,
      verType: arguments['verType'] as VerType,
      countryCode: arguments['countryCode'] as String,
      fullName: arguments['fullName'] as String,
      firstName: arguments['firstName'] as String,
      lastName: arguments['lastName'] as String,
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('inter_ceri'),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  bool showTopTips() => false;

  @override
  Widget body(BuildContext context) {
    Get.put(GGKycMiddleUploadLogic());
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
          _title(localized("up_file")),
          _cardsStyle(),
          _tip(localized("forei_mid_deta00"), true),
          Gaps.vGap4,
          _tip(localized("forei_mid_deta01"), true),
          Gaps.vGap4,
          _tip(localized("forei_mid_deta02"), true),
          Gaps.vGap4,
          _tip(localized("forei_mid_deta03"), true),
          Gaps.vGap4,
          _tip(localized("forei_mid_deta04"), false),
          Gaps.vGap4,
          _tip(localized("forei_mid_deta05"), false),
          Gaps.vGap24,
          _title(localized("file_size")),
          Gaps.vGap24,
          _buildImageArea(),
          _buildButtons(),
          _buildBottomTip()
        ],
      ),
    );
  }

  Widget _buildImageArea() {
    return Obx(() {
      List<Widget> lists = <Widget>[];
      if (verType == VerType.idCard) {
        lists.add(_buildImageSelect(
            localized("up_port"), logic.frontImageFilePath.value, () {
          _pressSelectUpload(true);
        }));
        lists.add(Gaps.vGap24);
        lists.add(_buildImageSelect(
            localized("up_country"), logic.backImageFilePath.value, () {
          _pressSelectUpload(false);
        }));
        logic.needUploadImageNum = 2;
      } else {
        lists.add(_buildImageSelect(
            localized("up_port"), logic.frontImageFilePath.value, () {
          _pressSelectUpload(true);
        }));
        logic.needUploadImageNum = 1;
      }
      lists.add(Gaps.vGap24);
      return Column(
        children: lists,
      );
    });
  }

  Widget _buildImageSelect(
      String title, String imagePath, void Function() clickComplete) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: clickComplete,
      child: Container(
        height: 94.dp,
        width: double.infinity,
        clipBehavior: Clip.hardEdge,
        decoration: BoxDecoration(
          color: GGColors.border.color,
          borderRadius: BorderRadius.all(
            Radius.circular(16.dp),
          ),
        ),
        child: Stack(
          children: [
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Gaps.vGap10,
                  Image.asset(
                    R.kycKycCamera,
                    width: 24.dp,
                  ),
                  Gaps.vGap10,
                  Text(
                    title,
                    style: GGTextStyle(
                      color: GGColors.textMain.color,
                      fontSize: GGFontSize.hint,
                    ),
                  )
                ],
              ),
            ),
            Visibility(
              visible: imagePath.isNotEmpty,
              child: _buildImageBack(File(imagePath)),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildImageBack(File imageFile) {
    return Stack(
      children: [
        Image.file(
          imageFile,
          width: double.infinity,
          height: double.infinity,
          fit: BoxFit.fitWidth,
        ),
        Center(
          child: Column(
            children: [
              Gaps.vGap20,
              Image.asset(
                R.kycImageUpload,
                width: 24.dp,
              ),
              Gaps.vGap10,
              Text(
                localized("sen_dw"),
                style: GGTextStyle(
                  color: GGColors.textMain.color,
                  fontSize: GGFontSize.hint,
                ),
              )
            ],
          ),
        ),
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
              onPressed: () {
                // PASSPORT, DRIVING_LICENSE, ID_CARD
                String idType;
                if (verType == VerType.passport) {
                  idType = 'PASSPORT';
                } else if (verType == VerType.idCard) {
                  idType = 'ID_CARD';
                } else {
                  idType = 'DRIVING_LICENSE';
                }
                logic.submit(
                  countryCode,
                  fullName,
                  firstName,
                  lastName,
                  idType,
                );
              },
              enable: logic.buttonEnable.value,
              isLoading: logic.isLoading.value,
              text: getLocalString('continue'),
            );
          }),
        )
      ],
    );
  }

  Widget _title(String title) {
    return Text(
      title,
      style: GGTextStyle(
        color: GGColors.textMain.color,
        fontSize: GGFontSize.content,
        fontWeight: GGFontWeigh.medium,
      ),
    );
  }

  Widget _tip(String content, bool isTrue) {
    return Row(
      children: [
        SvgPicture.asset(
          isTrue ? R.iconVerifySuccessful : R.iconVerifyFailed,
          // width: 14.dp,
          // height: 14.dp,
        ),
        Gaps.hGap4,
        Expanded(
          child: Text(
            content,
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.hint,
            ),
          ),
        )
      ],
    );
  }

  Widget _cardsStyle() {
    return Padding(
      padding: EdgeInsets.only(top: 16.dp, bottom: 24.dp),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _cardItem(R.kycCardTip0, true, localized("well")),
          _cardItem(R.kycCardTip1, false, localized("uncropped")),
          _cardItem(R.kycCardTip2, false, localized("avoid_ambiguity")),
          _cardItem(R.kycCardTip3, false, localized("non_reflective")),
        ],
      ),
    );
  }

  Widget _cardItem(String icon, bool tip, String title) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Image.asset(
          icon,
          height: 30.dp,
        ),
        Gaps.vGap4,
        SvgPicture.asset(
          tip ? R.kycCircleCheckedGreen : R.kycKycClose,
          width: 20.dp,
          height: 20.dp,
        ),
        Gaps.vGap4,
        Text(
          title,
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.hint,
          ),
        ),
      ],
    );
  }
}

extension _Action on GGKycMiddleUploadPage {
  void _pressSelectUpload(bool isFront) {
    _showSheet([
      localized("kyc.take_photos"),
      localized("kyc.upload"),
    ], (content) {
      if (content == localized("kyc.take_photos")) {
        logic.selectImage(isFront, openGallery: false);
      } else {
        logic.selectImage(isFront);
      }
    });
  }

  void _showSheet(
      List<String> contentList, void Function(String content) selectContent) {
    GamingSelector.simple<String>(
      title: localized("sen_de"),
      useCloseButton: false,
      centerTitle: true,
      fixedHeight: false,
      original: contentList,
      itemBuilder: (context, e, index) {
        return GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            selectContent.call(e);
            Get.back<dynamic>();
          },
          child: SizedBox(
            height: 50.dp,
            child: Center(
              child: Text(
                e,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.regular,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
