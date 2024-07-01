part of '../full_certificate_page.dart';

class _PersonalDeclarationView extends StatelessWidget {
  const _PersonalDeclarationView();

  FullCertificateLogic get controller => Get.find<FullCertificateLogic>();
  FullCertificateState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap20,
        _buildVideoView(),
        Gaps.vGap24,
      ],
    );
  }

  Widget _buildVideoView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('precautions02'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.vGap10,
        Text(
          localized('personal_declaration_video_tips'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.vGap20,
        Text(
          localized('sure_content'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textHint.color,
          ),
        ),
        Gaps.vGap10,
        VideoUploadView(
          controller: controller.personalVideoController,
        ),
      ],
    );
  }
}
