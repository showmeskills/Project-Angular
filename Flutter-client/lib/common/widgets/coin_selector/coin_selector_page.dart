import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import 'coin_selector_logic.dart';

class CoinSelectorPage extends StatelessWidget {
  const CoinSelectorPage({
    Key? key,
    required this.list,
  }) : super(key: key);

  final List<GamingCurrencyModel> list;

  CoinSelectorLogic get c => Get.find<CoinSelectorLogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(CoinSelectorLogic(list));
    c.list = list;

    return SafeArea(
      top: false,
      bottom: true,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16.dp),
            child: GamingTextField(
              controller: c.textFieldController,
              hintText: localized('sea00'),
              fillColor: GGColors.alertBackground,
              prefixIcon: GamingTextFieldIcon(
                icon: R.iconSearch,
                padding: EdgeInsets.only(right: 10.dp, left: 14.dp),
              ),
              prefixIconConstraints: BoxConstraints.tightFor(
                height: 14.dp,
                width: 42.dp,
              ),
              contentPadding:
                  EdgeInsets.symmetric(vertical: 10.dp, horizontal: 13.dp),
            ),
          ),
          Gaps.vGap8,
          Expanded(
            child: Obx(
              () {
                return ListView.builder(
                  padding: EdgeInsetsDirectional.only(top: 8.dp, bottom: 8.dp),
                  itemCount: c.displayList.length,
                  itemExtent: 51.dp,
                  itemBuilder: (context, index) {
                    return _buildItem(c.displayList[index]);
                  },
                  // itemScrollController: c.scrollController,
                  // itemPositionsListener: c.positionsListener,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItem(GamingCurrencyModel data) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        c.select(data);
      },
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: 16.dp,
        ),
        child: Row(
          children: [
            GamingImage.network(
              url: data.iconUrl,
              width: 24.dp,
              height: 24.dp,
            ),
            Gaps.hGap6,
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    data.currency ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  ),
                  Text(
                    data.name ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.hint,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
