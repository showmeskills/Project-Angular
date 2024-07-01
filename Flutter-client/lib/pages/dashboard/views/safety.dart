// ignore_for_file: unused_element

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/pages/dashboard/logics/user_info_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import 'module_title.dart';

class DashboardSafety extends StatelessWidget {
  const DashboardSafety({super.key});

  DashboardUserInfoLogic get controller => Get.find<DashboardUserInfoLogic>();

  DashboardUserInfoState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return DashboardModuleContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DashboardModuleTitle(
            title: localized('inc_acc_sec'),
            hasDivider: true,
            onPressed: () {
              Get.toNamed<dynamic>(Routes.accountSecurity.route);
            },
          ),
          Gaps.vGap16,
          Column(
            children: [
              Column(
                children: [
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 16.dp),
                    width: double.infinity,
                    child: Builder(
                      builder: (context) {
                        if (KycService.sharedInstance.isAsia) {
                          return _buildSafetyViewForAsia();
                        }
                        return _buildSafetyViewForEu();
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
          Gaps.vGap16,
        ],
      ),
    );
  }

  Widget _buildSecurityView() {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Obx(() {
              return _DashboardSafetyButton(
                successful: state.isBindGoogleValid,
                title: localized('auth_ver'),
                successfulText: localized('cer'),
                failedText: localized('binding'),
                onPressed: _onPressedGoogle,
              );
            }),
          ),
          VerticalDivider(
            width: 1.dp,
            thickness: 1.dp,
            color: GGColors.border.color,
          ),
          Expanded(
            child: Obx(() {
              return _DashboardSafetyButton(
                successful: state.hasWhiteList,
                title: localized('turn_on_ww'),
                successfulText: localized('opened'),
                failedText: localized('open'),
                onPressed: _onPressedWhiteList,
              );
            }),
          )
        ],
      ),
    );
  }

  Widget _buildSafetyViewForAsia() {
    return Column(
      children: [
        IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Obx(() {
                  return _DashboardSafetyButton(
                    successful: state.isBindMobile,
                    title: localized('phone_verification'),
                    successfulText: localized('ver'),
                    failedText: localized('verification'),
                    onPressed: _onPressedMobile,
                  );
                }),
              ),
              VerticalDivider(
                width: 1.dp,
                thickness: 1.dp,
                color: GGColors.border.color,
              ),
              Expanded(
                child: Obx(() {
                  return _DashboardSafetyButton(
                    successful: state.isCertified,
                    title: localized('id_ver'),
                    successfulText: state.kycTypeText,
                    failedText: localized('verification'),
                    onPressed: _onPressedKyc,
                  );
                }),
              )
            ],
          ),
        ),
        Gaps.vGap12,
        Divider(
          height: 1.dp,
          thickness: 1.dp,
          color: GGColors.border.color,
          indent: 16.dp,
          endIndent: 16.dp,
        ),
        Gaps.vGap12,
        _buildSecurityView(),
      ],
    );
  }

  Widget _buildSafetyViewForEu() {
    return Column(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.dp),
              child: Text(
                localized('verification_infor'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
            ),
            Gaps.vGap10,
            IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Obx(() {
                      return Column(
                        children: [
                          _DashboardSafetyButton(
                            successful: state.isBindMobile,
                            title: localized('phone_verification'),
                            successfulText: localized('ver'),
                            failedText: localized('verification'),
                            onPressed: _onPressedMobile,
                          ),
                          if (state.isCertified)
                            Container(
                              margin: EdgeInsets.only(top: 10.dp),
                              child: _DashboardSafetyButton(
                                successful: state.kycPoaVerified,
                                title: localized('proof_of_address_document'),
                                successfulText: localized('cer'),
                                failedText: localized('verification'),
                                onPressed: state.kycPoaVerified
                                    ? _onPressedKyc
                                    : _onPressedKycMiddle,
                              ),
                            ),
                        ],
                      );
                    }),
                  ),
                  VerticalDivider(
                    width: 1.dp,
                    thickness: 1.dp,
                    color: GGColors.border.color,
                  ),
                  Expanded(
                    child: Obx(() {
                      if (!state.isCertified) {
                        return Gaps.empty;
                      }
                      return _DashboardSafetyButton(
                        successful: state.kycIDVerified,
                        title: localized('identity_document'),
                        successfulText: localized('cer'),
                        failedText: localized('verification'),
                        onPressed: state.kycIDVerified
                            ? _onPressedKyc
                            : _onPressedKycMiddle,
                      );
                    }),
                  )
                ],
              ),
            ),
          ],
        ),
        Gaps.vGap12,
        Divider(
          height: 1.dp,
          thickness: 1.dp,
          color: GGColors.border.color,
          indent: 16.dp,
          endIndent: 16.dp,
        ),
        Gaps.vGap12,
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.dp),
              child: Text(
                localized('security_veri'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
            ),
            Gaps.vGap10,
            _buildSecurityView(),
          ],
        ),
      ],
    );
  }
}

class _DashboardSafetyButton extends StatelessWidget {
  final bool successful;
  final String title;
  final String successfulText;
  final String failedText;
  final void Function()? onPressed;

  const _DashboardSafetyButton({
    this.successful = false,
    required this.title,
    required this.successfulText,
    required this.failedText,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final bool isAsia = KycService.sharedInstance.isAsia;
    return ScaleTap(
      opacityMinValue: 0.8,
      scaleMinValue: 0.98,
      onPressed: onPressed,
      child: Container(
        height: isAsia ? 86.dp : null,
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment:
              isAsia ? MainAxisAlignment.center : MainAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  height: 14.dp * 1.4,
                  child: Container(
                    width: 6.dp,
                    height: 6.dp,
                    decoration: BoxDecoration(
                      color: successful
                          ? GGColors.success.color
                          : GGColors.textSecond.color,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                Gaps.hGap8,
                Expanded(
                  child: Text(
                    title,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
            Gaps.vGap2,
            Container(
              margin: EdgeInsets.only(left: 14.dp),
              child: Text(
                successful ? successfulText : failedText,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: successful
                      ? GGColors.textMain.color
                      : GGColors.brand.color,
                  decoration: successful ? null : TextDecoration.underline,
                  height: 1.4,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DivderRoundedRectangleBorder extends RoundedRectangleBorder {
  const _DivderRoundedRectangleBorder({
    BorderSide side = BorderSide.none,
    BorderRadius borderRadius = BorderRadius.zero,
    this.color = Colors.black,
  }) : super(side: side, borderRadius: borderRadius);

  final Color color;

  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {
    super.paint(canvas, rect);

    final paint = Paint()
      ..color = color
      ..strokeCap = StrokeCap.butt
      ..strokeWidth = 1.dp
      ..style = PaintingStyle.fill
      ..strokeJoin = StrokeJoin.round;

    final centerX = (rect.right + rect.left) / 2;
    final centerY = (rect.bottom - 86.dp);
    canvas.drawLine(
        Offset(centerX, rect.top), Offset(centerX, rect.bottom), paint);

    canvas.drawLine(
        Offset(rect.left, centerY), Offset(rect.right, centerY), paint);
  }

  @override
  bool operator ==(Object other) {
    if (other.runtimeType != runtimeType) {
      return false;
    }
    return other is _DivderRoundedRectangleBorder &&
        other.side == side &&
        other.borderRadius == borderRadius &&
        other.color == color;
  }

  @override
  int get hashCode => Object.hash(side, borderRadius, color);
}

extension _Action on DashboardSafety {
  void _onPressedMobile() {
    if (state.isBindMobile) {
      Get.toNamed<void>(Routes.accountSecurity.route);
    } else {
      Get.toNamed<void>(Routes.bindMobile.route);
    }
  }

  void _onPressedGoogle() {
    if (state.isBindGoogleValid) {
      Get.toNamed<void>(Routes.accountSecurity.route);
    } else {
      Get.toNamed<void>(Routes.bindGoogle.route);
    }
  }

  void _onPressedKyc() {
    Get.toNamed<dynamic>(Routes.kycHome.route);
  }

  void _onPressedKycMiddle() {
    controller.navigateToKycMiddleForEu();
  }

  void _onPressedWhiteList() {
    Get.toNamed<dynamic>(Routes.accountSecurity.route);
  }
}
