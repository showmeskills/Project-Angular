import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:base_framework/base_controller.dart';
import 'package:path/path.dart' as path;
import 'dart:io';

import '../../../../R.dart';
import '../../../../common/api/kyc/models/gg_kyc_document_model.dart';
import '../../../../common/lang/locale_lang.dart';
import '../../../../common/theme/colors/go_gaming_colors.dart';
import '../../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/gaming_selector/gaming_selector.dart';
import '../../../../common/widgets/gg_button.dart';
import '../../../../config/gaps.dart';
import 'gg_kyc_replenish_logic.dart';

class GGKycReplenishPage extends BaseView<GGKycReplenishLogic> {
  const GGKycReplenishPage({
    super.key,
    this.paymentMethod,
    this.customize,
  });

  final PaymentMethod? paymentMethod;
  final Customize? customize;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          GGKycReplenishPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory GGKycReplenishPage.argument(Map<String, dynamic> arguments) {
    return GGKycReplenishPage(
      paymentMethod: (arguments['paymentMethod'] is PaymentMethod)
          ? (arguments['paymentMethod'] as PaymentMethod)
          : null,
      customize: (arguments['customize'] is Customize)
          ? (arguments['customize'] as Customize)
          : null,
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('add_suppoet_doc'),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  bool showTopTips() => false;

  @override
  Widget body(BuildContext context) {
    Get.put(GGKycReplenishLogic(
        paymentMethod: paymentMethod, customize: customize));
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
          _title(_getShowName()),
          Gaps.vGap4,
          _tip("•${localized("upload_requirement")}"),
          Gaps.vGap4,
          _tip("•${localized("upload_requirement_inf", params: [
                _getShowName()
              ])}"),
          Gaps.vGap4,
          _tip("•${localized("note_in")}"),
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

  Widget _buildButtons() {
    return SizedBox(
      width: double.infinity,
      child: Obx(() {
        return GGButton(
          onPressed: () {
            controller.submit();
          },
          enable: controller.buttonEnable.value,
          isLoading: controller.isLoading.value,
          text: getLocalString('continue'),
        );
      }),
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

  Widget _buildImageArea() {
    return Obx(() {
      List<Widget> lists = <Widget>[];
      lists.add(_buildImageSelect(
          localized("upload_doc"), controller.imageFilePath.value, () {
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

  String _getShowName() {
    if (paymentMethod != null) {
      return localized("payment_method");
    }

    if (customize != null) {
      return customize?.document?.customizeName ?? '';
    }

    return "";
  }
}

extension _Action on GGKycReplenishPage {
  void _pressSelectUpload(bool isFront) {
    _showSheet([
      localized("kyc.take_photos"),
      localized("kyc.upload"),
      localized("up_files"),
    ], (content) {
      if (content == localized("up_files")) {
        controller.selectFile();
      } else if (content == localized("kyc.take_photos")) {
        controller.selectImage(isFront, openGallery: false);
      } else {
        controller.selectImage(isFront);
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
