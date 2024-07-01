part of '../full_certificate_page.dart';

class _IDCardView extends StatelessWidget {
  const _IDCardView();

  FullCertificateLogic get controller => Get.find<FullCertificateLogic>();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap20,
        _buildExample(),
        Gaps.vGap16,
        _buildTips(),
        Gaps.vGap16,
        _buildUpload(),
        Gaps.vGap20,
      ],
    );
  }

  Widget _buildUpload() {
    return Column(
      children: [
        IDCardUploadView(controller: controller.idCardFrontController),
        Gaps.vGap12,
        IDCardUploadView(controller: controller.idCardBackController),
      ],
    );
  }

  Widget _buildTips() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
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
        Gaps.vGap16,
        Text(
          localized("upl_limits"),
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.medium,
          ),
        ),
      ],
    );
  }

  Widget _tip(String content, bool isTrue) {
    return Row(
      children: [
        SvgPicture.asset(
          isTrue ? R.iconVerifySuccessful : R.iconVerifyFailed,
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

  Widget _buildExample() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _cardItem(R.kycCardTip0, true, localized("well")),
        _cardItem(R.kycCardTip1, false, localized("uncropped")),
        _cardItem(R.kycCardTip2, false, localized("avoid_ambiguity")),
        _cardItem(R.kycCardTip3, false, localized("non_reflective")),
      ],
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
