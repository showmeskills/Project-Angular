import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_level_model.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/generated/r.dart';

class GGKycLevelView extends StatelessWidget {
  const GGKycLevelView({
    Key? key,
    required this.index,
    required this.kycLevelModel,
    required this.isSelected,
  }) : super(key: key);

  final int index;
  final GGKycLevelModel kycLevelModel;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 53.dp,
      constraints: BoxConstraints(
          minWidth: (MediaQuery.of(context).size.width - 32.dp) / 3),
      decoration: BoxDecoration(
        color: isSelected ? GGColors.brand.color : Colors.transparent,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          if (kycLevelModel.isPass)
            Padding(
              padding: EdgeInsetsDirectional.only(end: 8.dp),
              child: SvgPicture.asset(
                isSelected ? R.kycCircleCheckedWhite : R.kycCircleCheckedGreen,
                width: 14.dp,
                height: 14.dp,
              ),
            ),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      localized(kycLevelModel.banner.title),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: GGTextStyle(
                        color:
                            isSelected ? Colors.white : GGColors.textMain.color,
                        fontSize: GGFontSize.content,
                        fontWeight: GGFontWeigh.medium,
                      ),
                    ),
                  ],
                ),
                if (kycLevelModel.isPass)
                  Text(
                    localized('cer'),
                    style: GGTextStyle(
                      color:
                          isSelected ? Colors.white : GGColors.textSecond.color,
                      fontSize: GGFontSize.hint,
                      fontWeight: GGFontWeigh.medium,
                    ),
                  ),
                // _buildCertified(),
                if (!kycLevelModel.isPass)
                  Container(
                    constraints: BoxConstraints(
                      maxWidth: (MediaQuery.of(context).size.width - 30) / 3 -
                          (kycLevelModel.isPass ? 25 : 8),
                    ),
                    child: Text(
                      localized(kycLevelModel.banner.subTitle ?? ''),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GGTextStyle(
                        color: isSelected
                            ? Colors.white
                            : GGColors.textSecond.color,
                        fontSize: GGFontSize.hint,
                        fontWeight: GGFontWeigh.medium,
                      ),
                    ),
                  )
              ],
            ],
          ),
        ],
      ), // Container(width: 50, height: 50,color: Colors.red,),
    );
  }
}
