import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_level_model.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_power_limit.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class GGKycRequireEuropeView extends StatelessWidget {
  const GGKycRequireEuropeView({
    Key? key,
    required this.levelModel,
    this.rejectTips,
    required this.rejectOverlay,
  }) : super(key: key);

  final Widget? rejectTips;
  final GGKycLevelModel levelModel;
  final GamingOverlay rejectOverlay;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsetsDirectional.only(top: 34.dp),
      child: Column(
        children: [
          ..._buildRequire(),
          SizedBox(height: 20.dp),
          ..._buildLimits(),
        ],
      ),
    );
  }

  List<Widget> _buildRequire() {
    return [
      Row(
        children: [
          Text(
            localized('require'),
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle,
              fontWeight: GGFontWeigh.medium,
              color: GGColors.textMain.color,
            ),
          ),
          const Spacer(),
          _buildStatusMark(),
        ],
      ),
      ...levelModel.requires.map(
        (e) => Padding(
          padding: EdgeInsetsDirectional.only(top: 3.dp),
          child: Row(
            children: [
              Container(
                width: 18.dp,
                height: 20.dp,
                alignment: AlignmentDirectional.centerStart,
                child: SvgPicture.asset(
                  e.iconPath,
                  color: GGColors.textSecond.color,
                  width: 13.dp,
                  height: 13.dp,
                ),
              ),
              Text(
                localized(e.title),
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content,
                ),
              ),
            ],
          ),
        ),
      ),
    ];
  }

  Widget _buildStatusMark() {
    var backColor = GGColors.success.color.withOpacity(0.2);
    var iconPath = R.kycKycPass;
    var title = localized('cer');
    var titleColor = GGColors.success.color;
    if (levelModel.isReject) {
      // backColor = LColor.kycRejectBackColor;
      backColor = Colors.transparent;
      iconPath = R.kycKycResultError;
      title = localized('veri_fail');
      titleColor = GGColors.error.color;
    } else if (levelModel.isPending) {
      backColor = GGColors.error.color.withOpacity(0.2);
      iconPath = R.kycKycPendingIcon;
      title = localized("refunding");
      titleColor = GGColors.highlightButton.color;
    }

    return Visibility(
      visible: levelModel.isPass || levelModel.isReject || levelModel.isPending,
      child: Transform.translate(
        offset: Offset(16.dp, 0),
        child: Container(
          constraints: BoxConstraints(minWidth: 90.dp, minHeight: 36.dp),
          decoration: BoxDecoration(
            color: backColor,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(32),
              bottomLeft: Radius.circular(32),
            ),
          ),
          child: GamingPopupLinkWidget(
            popup: rejectTips,
            followerAnchor: Alignment.topRight,
            offset: Offset(-12.dp, 0),
            overlay: rejectOverlay,
            child: Row(
              children: [
                SizedBox(width: 9.dp),
                SvgPicture.asset(
                  iconPath,
                  width: 18.dp,
                  height: 18.dp,
                ),
                SizedBox(width: 7.dp),
                Text(
                  localized(title),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    fontWeight: GGFontWeigh.medium,
                    color: titleColor,
                    decoration:
                        levelModel.isReject ? TextDecoration.underline : null,
                    decorationStyle: TextDecorationStyle.solid,
                  ),
                ),
                SizedBox(width: 10.dp),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildLimits() {
    return [
      Row(
        children: [
          Text(
            localized('feature_limit'),
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle,
              fontWeight: GGFontWeigh.medium,
              color: GGColors.textMain.color,
            ),
          ),
        ],
      ),
      ...levelModel.powerAndLimits.map(
        (e) => _buildLimitItems(e),
      ),
    ];
  }

  Widget _buildLimitItems(KycPowerAndLimits limits) {
    var isPassLimit = levelModel.isPass == true;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(height: 10.dp),
        Row(
          children: [
            Text(
              localized(limits.title),
              style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ],
        ),
        SizedBox(height: 20.dp),
        ...limits.info.map(
          (e) => Padding(
            padding: EdgeInsetsDirectional.only(
              bottom: 20.dp,
              end: 20.dp,
              start: 10.dp,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Visibility(
                      visible: isPassLimit,
                      child: SvgPicture.asset(
                        R.kycCircleCheckedGreen,
                        width: 14.dp,
                        height: 14.dp,
                      ),
                    ),
                    Visibility(
                      visible: isPassLimit,
                      child: SizedBox(width: 5.dp),
                    ),
                    Expanded(
                      flex: 1,
                      child: Text(
                        localized(e.name),
                        style: GGTextStyle(
                          color: GGColors.textSecond.color,
                          fontSize: GGFontSize.content,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 10.dp),
                Row(
                  children: [
                    Visibility(
                      visible: isPassLimit,
                      child: SizedBox(width: 25.dp),
                    ),
                    ...e.desc.map(
                      (desc) => Expanded(
                        flex: 1,
                        child: Text(
                          localized(desc),
                          style: GGTextStyle(
                            color: GGColors.textMain.color,
                            fontSize: GGFontSize.content,
                            fontWeight: GGFontWeigh.medium,
                          ),
                        ),
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        ),
        Divider(
          height: 1,
          color: GGColors.border.color,
          // endIndent: 15,
        ),
      ],
    );
  }
}
