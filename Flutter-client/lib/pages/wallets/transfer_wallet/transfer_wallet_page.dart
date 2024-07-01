import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_aggs_wallet_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_transfer_wallet_history_model.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/wallets/common/mixin/wallet_common_ui_mixin.dart';
import 'package:gogaming_app/pages/wallets/common/view/wallet_amout_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:gogaming_app/pages/wallets/common/view/wallet_base_view.dart';

import 'transfer_wallet_logic.dart';

class TransferWalletPage extends WalletBaseView<TransferWalletLogic>
    with BaseRefreshViewDelegate, WalletCommonUIMixin {
  const TransferWalletPage({super.key, required this.wallet});

  final GamingAggsWalletModel wallet;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () =>
          TransferWalletPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory TransferWalletPage.argument(Map<String, dynamic> argument) {
    return TransferWalletPage(
        wallet: argument['data'] as GamingAggsWalletModel);
  }

  @override
  RefreshViewController get renderController => controller.controller;

  TransferWalletState get state => controller.state;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      title: localized('wallet_over'),
    );
  }

  @override
  Color backgroundColor() {
    return GGColors.background.color;
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  @override
  Widget? getLoadingWidget(BuildContext context) {
    return buildOverviewContainer(
      padding: EdgeInsets.zero,
      child: super.getLoadingWidget(context)!,
    );
  }

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildOverview(),
        Expanded(
          child: Container(
            width: double.infinity,
            color: GGColors.moduleBackground.color,
            child: super.getEmptyWidget(context)!,
          ),
        ),
      ],
    );
  }

  @override
  Color get footerColor => GGColors.moduleBackground.color;

  @override
  Widget body(BuildContext context) {
    Get.put(TransferWalletLogic(wallet), tag: tag);
    return FocusDetector(
      onVisibilityGained: controller.getWalletViewData,
      child: RefreshView(
        delegate: this,
        controller: controller,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              buildOverview(),
              Divider(
                height: 1.dp,
                thickness: 1.dp,
                color: GGColors.border.color,
                indent: 16.dp,
                endIndent: 16.dp,
              ),
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: GGColors.moduleBackground.color,
                ),
                child: _buildHistory(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHistory() {
    return Obx(() {
      return Column(
        children: state.data.list.map((e) => _buildHistoryItem(e)).toList(),
      );
    });
  }

  Widget _buildHistoryItem(GamingTransferWalletHistoryModel data) {
    return Container(
      margin: EdgeInsets.symmetric(
        horizontal: 16.dp,
      ),
      padding: EdgeInsets.symmetric(
        vertical: 8.dp,
      ),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            width: 1.dp,
            color: GGColors.border.color,
          ),
        ),
      ),
      child: Column(
        children: [
          _buildHistoryItemRow(
            title: data.transferTypeText,
            value: data.amountText,
            currencyIconUrl: data.currencyIconUrl,
            isTitle: true,
          ),
          _buildHistoryItemRow(
            title: localized('order_number'),
            value: data.transactionId,
          ),
          _buildHistoryItemRow(
            title: localized('time'),
            value: DateFormat('yyyy-MM-dd HH:mm:ss')
                .formatTimestamp(data.createdTime),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryItemRow({
    required String title,
    required String value,
    String? currencyIconUrl,
    bool isTitle = false,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 8.dp),
      child: Row(
        children: [
          Text(
            title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color:
                  isTitle ? GGColors.textMain.color : GGColors.textSecond.color,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.end,
            ),
          ),
          if (currencyIconUrl != null)
            Container(
              margin: EdgeInsets.only(left: 4.dp),
              child: GamingImage.network(
                url: currencyIconUrl,
                width: 16.dp,
                height: 16.dp,
              ),
            ),
        ],
      ),
    );
  }

  @override
  Widget buildOverview() {
    return buildOverviewContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          buildWalletName(localized(state.wallet.category.toLowerCase())),
          Gaps.vGap24,
          buildTotalAmount(
            child: Obx(() {
              return WalletAmountView(
                fontSize: GGFontSize.superBigTitle,
                totalValue: state.wallet.totalText,
                obscureFund: false,
                convertWidegt: Obx(() {
                  if (state.selectedCurrency.currency == 'USDT') {
                    return Gaps.empty;
                  }
                  return RichText(
                    text: TextSpan(
                      children: [
                        TextSpan(
                          text: '≈ ${state.usdtConvert} ',
                        ),
                        TextSpan(
                          text: ' ${state.selectedCurrency.currency}',
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.textSecond.color,
                          ),
                        ),
                      ],
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                        fontFamily: GGFontFamily.dingPro,
                        fontWeight: GGFontWeigh.bold,
                      ),
                    ),
                  );
                }),
              );
            }),
          ),
          Gaps.vGap14,
          _buildOperationRow(),
        ],
      ),
    );
  }

  // Widget _buildNumRow(GGFontSize fontSize, String totalValue) {
  //   return Row(
  //     crossAxisAlignment: CrossAxisAlignment.baseline,
  //     textBaseline: TextBaseline.ideographic,
  //     children: [
  //       Text(
  //         totalValue,
  //         style: GGTextStyle(
  //           fontSize: fontSize,
  //           height: 1,
  //           color: GGColors.textMain.color,
  //           fontFamily: GGFontFamily.dingPro,
  //           // fontWeight: GGFontWeigh.bold,
  //         ),
  //       ),
  //       Gaps.hGap4,
  //       Text(
  //         'USDT',
  //         style: GGTextStyle(
  //           fontSize: GGFontSize.content,
  //           color: GGColors.textMain.color,
  //           // fontWeight: GGFontWeigh.bold,
  //         ),
  //       ),
  //     ],
  //   );
  // }

  Widget _buildOperationRow() {
    final textStyle = GGTextStyle(fontSize: GGFontSize.content);
    return SizedBox(
      width: MediaQuery.of(Get.context!).size.width - 32.dp,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              constraints: BoxConstraints(
                  minWidth: MediaQuery.of(Get.context!).size.width / 3 - 50.dp),
              child: GGButton.main(
                onPressed: _onTransPressed,
                text: localized('trans'),
                isSmall: true,
                textStyle: textStyle,
                backgroundColor: GGColors.brand.color,
              ),
            ),
            Gaps.hGap10,
            Container(
              constraints: BoxConstraints(
                  minWidth: MediaQuery.of(Get.context!).size.width / 3 - 50.dp),
              child: GGButton.minor(
                onPressed: _onPressHistory,
                text: localized('trans_history'),
                isSmall: true,
                textStyle: textStyle,
                backgroundColor: GGColors.transparent.color,
                border: Border.all(
                  width: 1.dp,
                  color: GGColors.border.color,
                ),
              ),
            ),
            Gaps.hGap10,
            Container(
              constraints: BoxConstraints(
                  minWidth: MediaQuery.of(Get.context!).size.width / 3 - 50.dp),
              child: GGButton.minor(
                onPressed: _onPlayGamePressed,
                text: localized('go_game'),
                isSmall: true,
                textStyle: textStyle,
                image: controller.hasMultiCategorys
                    ? SvgPicture.asset(
                        R.iconDown,
                        height: 7.dp,
                        color: GGColors.textSecond.color,
                      )
                    : null,
                space: 4.dp,
                imageAlignment: AlignmentDirectional.centerEnd,
                backgroundColor: GGColors.transparent.color,
                border: Border.all(
                  width: 1.dp,
                  color: GGColors.border.color,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

extension _Action on TransferWalletPage {
  void _onTransPressed() {
    Get.toNamed<dynamic>(Routes.transfer.route,
        arguments: {'category': state.wallet.category});
  }

  void _onPlayGamePressed() {
    controller.onPlayGamePressed();
  }

  void _onPressHistory() {
    Get.toNamed<dynamic>(Routes.walletHistory.route);
  }
}
