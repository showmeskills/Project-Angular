import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:flutter_svg/svg.dart';
import 'dart:io';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:path/path.dart' as path;

import '../../../R.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../common/widgets/appbar/appbar.dart';
import '../../../common/widgets/gaming_popup.dart';
import '../../../common/widgets/gaming_selector/gaming_selector.dart';
import '../../../common/widgets/gg_button.dart';
import '../../../config/gaps.dart';
import 'gg_kyc_address_upload_logic.dart';

class GGKycAddressUploadPage extends BaseView<GGKycAddressUploadLogic> {
  const GGKycAddressUploadPage(
    this.countryCode,
    this.postalCode,
    this.city,
    this.address, {
    super.key,
  });
  final String countryCode;
  final String postalCode;
  final String city;
  final String address;


  GGKycAddressUploadLogic get logic => Get.find<GGKycAddressUploadLogic>();

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
    Get.put(GGKycAddressUploadLogic());
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
          _title(localized("prof_ad")),
          Gaps.vGap4,
          _tip(localized("provide_file")),
          Gaps.vGap4,
          _buildTip(),
          Gaps.vGap4,
          _tip("•${localized("detail_config01")}"),
          Gaps.vGap4,
          _tip("•${localized("detail_config02")}"),
          Gaps.vGap4,
          _tip("•${localized("detail_config03")}"),
          Gaps.vGap4,
          _tip("•${localized("detail_config04")}"),
          Gaps.vGap4,
          _tip("•${localized("detail_config05")}"),
          Gaps.vGap24,
          _buildImageArea(),
          _buildButtons(),
          _buildBottomTip()
        ],
      ),
    );
  }

  Widget _buildTip() {
    return GamingPopupLinkWidget(
      followerAnchor: Alignment.topLeft,
      targetAnchor: Alignment.topLeft,
      triangleSize: Size.zero,
      popup: _buildPopupLink(),
      offset: Offset(0.dp, 10.dp),
      child: Text(
        '${localized('notice_config00')}:',
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
          color: GGColors.highlightButton.color,
          decoration: TextDecoration.underline,
        ),
      ),
    );
  }

  Widget _buildPopupLink() {
    return Container(
      width: Get.width * 0.6,
      padding: EdgeInsets.symmetric(vertical: 10.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildPopupLinkText(localized("support_file")),
          Gaps.vGap20,
          _buildPopupLinkText("-${localized("notice_config01")}"),
          _buildPopupLinkText("-${localized("notice_config02")}"),
          _buildPopupLinkText("-${localized("notice_config03")}"),
          _buildPopupLinkText("-${localized("notice_config04")}"),
          _buildPopupLinkText("-${localized("notice_config05")}"),
          _buildPopupLinkText("-${localized("notice_config06")}"),
          _buildPopupLinkText("-${localized("notice_config07")}"),
          _buildPopupLinkText("-${localized("notice_config08")}"),
          _buildPopupLinkText("-${localized("notice_config09")}"),
        ],
      ),
    );
  }

  Widget _buildPopupLinkText(String content) {
    return Text(
      content,
      style: GGTextStyle(
        color: GGColors.textBlackOpposite.color,
        fontSize: GGFontSize.content,
      ),
    );
  }

  Widget _buildImageArea() {
    return Obx(() {
      List<Widget> lists = <Widget>[];
      lists.add(_buildImageSelect(
          localized("upload_doc"), logic.imageFilePath.value, () {
        _pressSelectUpload(true);
      }));
      lists.add(Gaps.vGap24);
      return Column(
        children: lists,
      );
    });
  }

  Widget _buildImageSelect(
      String title, String imagePath, void Function() clickComplete) {
    return GestureDetector(
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

  Widget _buildMediaPreView(File filePath) {
    final ext = path.extension(filePath.path).toLowerCase();
    if (ext == '.pdf') {
      return AbsorbPointer(
        child: PDFView(
          filePath: filePath.path,
        ),
      );
    } else {
      return Image.file(
        filePath,
        width: double.infinity,
        height: double.infinity,
        fit: BoxFit.fitWidth,
      );
    }
  }

  Widget _buildImageBack(File imageFile) {
    return Stack(
      children: [
        _buildMediaPreView(imageFile),
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
    return SizedBox(
      width: double.infinity,
      child: Obx(() {
        return GGButton(
          onPressed: () {
            logic.submit(countryCode, postalCode, city, address);
          },
          enable: logic.buttonEnable.value,
          isLoading: logic.isLoading.value,
          text: getLocalString('continue'),
        );
      }),
    );
  }

  Widget _title(String title) {
    return Text(
      title,
      style: GGTextStyle(
        color: GGColors.textMain.color,
        fontSize: GGFontSize.content,
      ),
    );
  }

  Widget _tip(String content) {
    return Text(
      content,
      style: GGTextStyle(
        color: GGColors.textSecond.color,
        fontSize: GGFontSize.hint,
      ),
    );
  }
}

extension _Action on GGKycAddressUploadPage {
  void _pressSelectUpload(bool isFront) {
    _showSheet([
      localized("kyc.take_photos"),
      localized("kyc.upload"),
      localized("up_files"),
    ], (content) {
      if (content == localized("up_files")) {
        logic.selectFile();
      } else if (content == localized("kyc.take_photos")) {
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
