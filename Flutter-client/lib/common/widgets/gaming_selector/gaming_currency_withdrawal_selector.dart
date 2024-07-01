import 'package:flutter/material.dart';

import 'package:gogaming_app/common/api/wallet/models/gg_user_balance.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_selector.dart';

class GamingCurrencyWithdrawalSelector {
  static Future<GGUserBalance?> show({
    required List<GGUserBalance> original,
    RxBool? isLoad,
    void Function(List<GGUserBalance>)? onLoadComplate,
  }) {
    return GamingSelector.simple(
      title: localized('select_cur'),
      itemBuilder: (context, e, index) {
        return _GamingCurrencyWithdrawalSelectorItem(
          data: e,
          isLoad: isLoad ?? false.obs,
        );
      },
      original: original,
      onSearchDataStream: (keyword, l) {
        List<GGUserBalance> list = l;
        if (keyword.isNotEmpty) {
          list = l.where((element) {
            return element.currency!
                    .toLowerCase()
                    .contains(keyword.toLowerCase()) ||
                element.name.toLowerCase().contains(keyword.toLowerCase());
          }).toList();
        }
        return Stream.value(list);
      },
    );
  }
}

class _GamingCurrencyWithdrawalSelectorItem extends StatelessWidget {
  const _GamingCurrencyWithdrawalSelectorItem({
    required this.data,
    required this.isLoad,
  });

  final GGUserBalance data;
  final RxBool isLoad;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 8.dp),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          GamingImage.network(
            url: data.iconUrl,
            width: 24.dp,
            height: 24.dp,
          ),
          Gaps.hGap8,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.currency ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    fontFamily: GGFontFamily.dingPro,
                    fontWeight: GGFontWeigh.bold,
                    color: GGColors.textMain.color,
                  ),
                ),
                Gaps.vGap2,
                Text(
                  data.name,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    fontFamily: GGFontFamily.dingPro,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ],
            ),
          ),
          Obx(() {
            return isLoad.value
                ? ThreeBounceLoading(
                    dotColor: GGColors.buttonTextWhite.color,
                    dotSize: 15.dp,
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        GGUtil.parseStr(data.balance),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          fontFamily: GGFontFamily.dingPro,
                          fontWeight: GGFontWeigh.bold,
                          color: GGColors.textMain.color,
                        ),
                      ),
                      Gaps.vGap2,
                      Text(
                        '≈\$${NumberPrecision(data.balance).times(NumberPrecision(GGUtil.parseDouble(CurrencyService.sharedInstance.getUSDTRate(data.currency)))).balanceText(true)}',
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          fontFamily: GGFontFamily.dingPro,
                          color: GGColors.textSecond.color,
                        ),
                      ),
                    ],
                  );
          }),
        ],
      ),
    );
  }
}
