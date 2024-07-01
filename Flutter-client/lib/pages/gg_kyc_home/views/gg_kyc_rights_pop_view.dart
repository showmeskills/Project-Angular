import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_info.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_power_limit.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class GGKycRightsPopView extends StatelessWidget {
  const GGKycRightsPopView({
    Key? key,
    required this.modelInfo,
    required this.isAsia,
  }) : super(key: key);

  final GGKycInfo modelInfo;
  // 是否亚洲
  final bool isAsia;
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 188.dp,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: EdgeInsetsDirectional.only(top: 9.dp),
            child: _buildWrapText(
              Text(
                localized('curr_be'),
                style: GGTextStyle(
                  fontSize: GGFontSize.smallTitle,
                  fontWeight: GGFontWeigh.medium,
                  color: GGColors.textBlackOpposite.color,
                ),
              ),
            ),
          ),
          SizedBox(height: 17.dp),
          ...?(isAsia
                  ? modelInfo.getCurrentLevelAsia()
                  : modelInfo.getCurrentLevelEurope())
              ?.powerAndLimits
              .map(
                (e) => _buildLimitItems(e),
              ),
        ],
      ),
    );
  }

  Widget _buildLimitItems(KycPowerAndLimits limits) {
    var isPassLimit = true;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(height: 10.dp),
        _buildLimitTitle(limits),
        SizedBox(height: 6.dp),
        ...limits.info.map(
          (e) => Padding(
            padding: EdgeInsetsDirectional.only(
              bottom: 6.dp,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildName(isPassLimit, e),
                _buildDesc(e),
                SizedBox(height: 6.dp),
                if (limits.info.last != e)
                  Divider(height: 1, color: GGColors.border.color),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDesc(KycPowerDesc e) {
    return Row(
      children: [
        ...e.desc.map(
          (desc) => Expanded(
            flex: 1,
            child: Text(
              localized(desc),
              style: GGTextStyle(
                color: GGColors.textBlackOpposite.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildName(bool isPassLimit, KycPowerDesc e) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Visibility(
          visible: isPassLimit,
          child: SvgPicture.asset(
            R.kycCircleCheckedGreen,
            width: 12.dp,
            height: 12.dp,
          ),
        ),
        Visibility(
          visible: isPassLimit,
          child: SizedBox(width: 3.dp),
        ),
        Expanded(
          flex: 1,
          child: Text(
            localized(e.name),
            style: GGTextStyle(
              color: GGColors.textBlackOpposite.color,
              fontSize: GGFontSize.hint,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLimitTitle(KycPowerAndLimits limits) {
    return Row(
      children: [
        Text(
          localized(limits.title),
          style: GGTextStyle(
            color: GGColors.textBlackOpposite.color,
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.medium,
          ),
        ),
      ],
    );
  }

  Widget _buildWrapText(Text textView) {
    return Row(
      children: [Expanded(child: textView)],
    );
  }
}
