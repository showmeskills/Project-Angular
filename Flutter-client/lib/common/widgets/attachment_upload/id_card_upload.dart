import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

import 'attachment_upload.dart';

enum IDCardType {
  front,
  back,
}

class IDCardUploadController extends AttachmentUploadController {
  IDCardUploadController({
    required this.idCardType,
    List<PickMethod> pickMethod = const [PickMethod.camera, PickMethod.gallery],
    String? attachment,
    void Function(List<String>)? onUpload,
  }) : super(
          type: 'Kyc',
          pickMethod: pickMethod,
          maxCount: 1,
          attachments: attachment == null ? [] : [attachment],
          onUpload: onUpload,
        );

  final IDCardType idCardType;
}

class IDCardUploadView extends StatelessWidget {
  const IDCardUploadView({super.key, required this.controller});

  final IDCardUploadController controller;

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onPressed: controller.selectPickMethod,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12.dp),
          color: GGColors.border.color,
        ),
        height: 94.dp,
        child: Obx(() {
          if (controller.attachments.isEmpty) {
            return _buildUploadButton();
          }
          return _buildPreview(controller.attachments.first);
        }),
      ),
    );
  }

  String get title {
    switch (controller.idCardType) {
      case IDCardType.front:
        return localized('up_port');
      case IDCardType.back:
        return localized('up_country');
    }
  }

  Widget _buildPreview(String url) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        GamingImage.network(
          width: double.infinity,
          height: double.infinity,
          url: url,
          fit: BoxFit.fitWidth,
          radius: 12.dp,
        ),
        Positioned(
          top: 0,
          right: 0,
          child: ScaleTap(
            onPressed: () => _delete(url),
            child: Padding(
              padding: EdgeInsets.all(4.dp),
              child: SvgPicture.asset(
                R.iconDelete,
                width: 18.dp,
                height: 18.dp,
              ),
            ),
          ),
        )
      ],
    );
  }

  Widget _buildUploadButton() {
    if (controller.uploading) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            height: 14.dp * 1.4,
            child: GoGamingLoading(
              color: controller.uploadMissing
                  ? GGColors.error
                  : GGColors.highlightButton,
              size: 14.dp,
            ),
          ),
        ],
      );
    }
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SvgPicture.asset(
          R.iconCamera,
          width: 24.dp,
          color: GGColors.textSecond.color,
        ),
        Gaps.vGap10,
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

extension _Action2 on IDCardUploadView {
  void _delete(String attachment) {
    controller.delete(attachment);
  }
}
