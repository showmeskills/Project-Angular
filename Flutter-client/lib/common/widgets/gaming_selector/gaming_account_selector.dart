import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_transfer_wallet.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_selector.dart';

class GamingAccountSelector {
  static Future<GamingOverviewTransferWalletModel?> show({
    required List<GamingOverviewTransferWalletModel> original,
    required String curWalletName,
  }) {
    return GamingSelector.simple(
      title: localized('select_account'),
      itemBuilder: (context, e, index) {
        return _GamingAccountSelectorItem(
          data: e,
          curWalletName: curWalletName,
        );
      },
      original: original,
    );
  }
}

class _GamingAccountSelectorItem extends StatelessWidget {
  const _GamingAccountSelectorItem({
    required this.data,
    required this.curWalletName,
  });

  final GamingOverviewTransferWalletModel data;
  final String curWalletName;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 16.dp),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Text(
              data.walletName ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: (curWalletName == data.walletName)
                    ? GGColors.highlightButton.color
                    : GGColors.textMain.color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
