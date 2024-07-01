import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/wallet/models/gg_user_balance.dart';
import 'package:gogaming_app/widget_header.dart';

import '../gaming_image/gaming_image.dart';
import 'gaming_selector.dart';

class GamingCurrencyTransferSelector {
  static Future<GGUserBalance?> show({
    required List<GGUserBalance> original,
  }) {
    return GamingSelector.simple(
      title: localized('select_cur'),
      itemBuilder: (context, e, index) {
        return _GamingCurrencyTransferSelectorItem(
          data: e,
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

class _GamingCurrencyTransferSelectorItem extends StatelessWidget {
  const _GamingCurrencyTransferSelectorItem({
    required this.data,
  });
  final GGUserBalance data;

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
                    fontSize: GGFontSize.hint,
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
