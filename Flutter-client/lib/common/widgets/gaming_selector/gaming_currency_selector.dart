import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/widget_header.dart';

import '../gaming_image/gaming_image.dart';
import 'gaming_selector.dart';

class GamingCurrencySelector {
  static List<GamingCurrencyModel> getCurrencyList() {
    final list = CurrencyService.sharedInstance.currencyList
        .where((element) => !element.isDigital && element.isVisible)
        .toList();
    list.sort((a, b) => a.sort.compareTo(b.sort));
    return list;
  }

  static List<GamingCurrencyModel> getCryptoList() {
    final list = CurrencyService.sharedInstance.currencyList
        .where((element) => element.isDigital && element.isVisible)
        .toList();
    list.sort((a, b) => a.sort.compareTo(b.sort));
    return list;
  }

  static Future<GamingCurrencyModel?> show({
    String? title,
    bool isDigital = false,
    List<GamingCurrencyModel> original = const [],
  }) {
    return GamingSelector.simple(
      title: title ?? localized('select_cur'),
      itemBuilder: (context, e, index) {
        return GamingCurrencySelectorItem(
          data: e,
        );
      },
      original: original.isNotEmpty
          ? original
          : isDigital
              ? getCryptoList()
              : getCurrencyList(),
      onSearchDataStream: (keyword, l) {
        List<GamingCurrencyModel> list = l;
        if (keyword.isNotEmpty) {
          list = l.where((element) {
            return element.currency!
                    .toLowerCase()
                    .contains(keyword.toLowerCase()) ||
                element.name!.toLowerCase().contains(keyword.toLowerCase());
          }).toList();
        }
        return Stream.value(list);
      },
    );
  }
}

class GamingCurrencySelectorItem extends StatelessWidget {
  const GamingCurrencySelectorItem({
    super.key,
    required this.data,
  });
  final GamingCurrencyModel data;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 8.dp),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          data.iconUrl.isNotEmpty
              ? GamingImage.network(
                  url: data.iconUrl,
                  width: 24.dp,
                  height: 24.dp,
                )
              : Image.asset(
                  R.iconCurrencyAll,
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
                  data.name ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    fontFamily: GGFontFamily.dingPro,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
