import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';

import '../../../../R.dart';
import '../../../../common/api/base/base_api.dart';
import '../../../../common/lang/locale_lang.dart';
import '../../../../common/theme/colors/go_gaming_colors.dart';
import '../../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../../common/widgets/gaming_image/gaming_image.dart';
import '../../../../config/gaps.dart';
import '../fiat_withdraw_logic.dart';
import '../fiat_withdraw_state.dart';

class FiatWithdrawSelectCurrencyView extends StatelessWidget {
  const FiatWithdrawSelectCurrencyView({super.key});

  FiatWithdrawLogic get controller => Get.find<FiatWithdrawLogic>();

  FiatWithdrawState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap24,
        _title('1.${localized("select_curr_wd")}'),
        Gaps.vGap16,
        Text(
          localized("curr"),
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.content,
          ),
        ),
        Gaps.vGap4,
        _buildSelectCurrency(),
      ],
    );
  }

  Widget _title(String title) {
    return Text(
      title,
      style: GGTextStyle(
        color: GGColors.textMain.color,
        fontSize: GGFontSize.smallTitle,
      ),
    );
  }

  Widget _buildSelectCurrency() {
    return Obx(() {
      List<Widget> showWidgets = <Widget>[];
      if (state.currentCurrency.value?.name?.isNotEmpty ?? false) {
        showWidgets = [
          Gaps.hGap16,
          GamingImage.network(
            url: state.currentCurrency.value?.icon ?? '',
            width: 18.dp,
            height: 18.dp,
          ),
          Gaps.hGap8,
          Text(
            state.currentCurrency.value?.currency ?? '',
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.content,
            ),
          ),
          Gaps.hGap8,
          Text(
            state.currentCurrency.value?.name ?? '',
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
            ),
          ),
        ];
      } else {
        showWidgets = [
          Gaps.hGap14,
          Text(
            localized("select_cur"),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
            ),
          ),
        ];
      }
      return InkWell(
        onTap: controller.pressSelectCurrency,
        child: Container(
          height: 48.dp,
          width: double.infinity,
          decoration: BoxDecoration(
            border: Border.all(
              color: GGColors.border.color,
              width: 1.dp,
            ),
            borderRadius: BorderRadius.circular(4.dp),
          ),
          child: Row(
            children: [
              ...showWidgets,
              const Spacer(),
              SvgPicture.asset(R.iconDown, width: 10, height: 8),
              Gaps.hGap14,
            ],
          ),
        ),
      );
    });
  }
}
