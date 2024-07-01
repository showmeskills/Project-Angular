import 'package:base_framework/base_controller.dart';
import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';

import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:scan/scan.dart';

import '../../common/lang/locale_lang.dart';
import '../../common/theme/text_styles/gg_text_styles.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gaming_close_button.dart';
import 'qr_code_scanner_logic.dart';

class QRCodeScannerPage extends BaseView<QRCodeScannerLogic> {
  const QRCodeScannerPage({super.key});

  @override
  Widget body(BuildContext context) {
    Get.put(QRCodeScannerLogic());
    return Center(
      child: _buildQrView(context),
    );
  }

  Widget _buildQrView(BuildContext context) {
    return ScanView(
      controller: controller.controller,
      scanLineColor: GGColors.brand.color,
      scanAreaScale: 0.8,
      onCapture: controller.onScanComplete,
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      titleWidget: SizedBox(
        width: double.infinity,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            InkWell(
              onTap: controller.onPickPhotosFromGallery,
              child: Text(
                localized("gallery"),
                style: GGTextStyle(
                  fontSize: GGFontSize.smallTitle,
                  color: GGColors.textMain.color,
                ),
              ),
            ),
            Gaps.hGap16,
          ],
        ),
      ),
      leadingIcon: GamingCloseButton(
        onPressed: () {
          controller.controller.pause();
          Get.back<void>();
        },
      ),
    );
  }
}
