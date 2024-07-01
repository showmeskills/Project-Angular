import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/game_order/models/game_order_model_interface.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import 'game_order_cell_item.dart';

class GameOrderItemBottomView extends StatelessWidget {
  const GameOrderItemBottomView({
    super.key,
    required this.data,
    this.padding,
  });

  final GameOrderInterface data;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      child: Column(
        children: [
          GameOrderCellItem(
            title: localized('tran_hour'),
            value: data.betDateTimeText,
          ),
          Gaps.vGap10,
          GameOrderCellItem(
            title: localized('transaction_num'),
            value: data.wagerNumber,
            icon: SvgPicture.asset(
              R.iconCopy,
              width: 14.dp,
              height: 14.dp,
              color: GGColors.textSecond.color,
            ),
            onTap: () => copyToClipboard(data.wagerNumber),
          ),
          Gaps.vGap10,
          GameOrderCellItem(
            title: localized('amount_transaction'),
            value: data.betAmountText,
            icon: GamingImage.network(
              url: data.currencyIconUrl,
              width: 14.dp,
              height: 14.dp,
            ),
          ),
          Gaps.vGap10,
          GameOrderCellItem(
            title: localized('wol'),
            color: data.payoutAmountColor,
            value: data.payoutAmountTextWithSymbol,
            icon: data.payoutAmount == null
                ? null
                : GamingImage.network(
                    url: data.currencyIconUrl,
                    width: 14.dp,
                    height: 14.dp,
                  ),
          ),
        ],
      ),
    );
  }
}

extension _Action on GameOrderItemBottomView {
  void copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(
      text: text,
    ));
    Toast.showMessage(
      state: GgToastState.success,
      message: localized('copy_succe'),
    );
  }
}
