import 'dart:math';

import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_aggs_wallet_model.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/common/service/wallet_service.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';
import 'package:gogaming_app/helper/withdraw_router_util.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

import 'views/wallet_home_item_view.dart';
import 'wallet_home_logic.dart';
import 'wallet_home_state.dart';

class WalletHomePage extends BaseView<WalletHomeLogic> {
  const WalletHomePage({Key? key}) : super(key: key);

  WalletHomeState get state => controller.state;

  @override
  // String? get tag => AccountService().gamingUser?.uid;
  String? get tag => '';

  String get obscureFundText => "*****";

  @override
  bool? showTopTips() {
    return false;
  }

  @override
  bool resizeToAvoidBottomInset() => false;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    final height = 58.dp;
    return PreferredSize(
      preferredSize: Size.fromHeight(height),
      child: Container(
        color: GGColors.background.color,
        child: Row(
          children: [
            Gaps.hGap16,
            SizedBox(height: height),
            Text(
              localized('wallet_over'),
              style: GGTextStyle(
                fontSize: GGFontSize.bigTitle20,
                color: GGColors.textMain.color,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  @override
  Widget body(BuildContext context) {
    Get.put(WalletHomeLogic(), permanent: true, tag: tag);
    return GetBuilder(
      init: controller,
      builder: (logic) {
        return FocusDetector(
          onVisibilityGained: controller.getWalletViewData,
          child: ListView(
            children: [
              _buildOverview(context),
              _buildMainWallet(),
              ...state.transferWallets.map(
                (element) => WalletHomeItemView(
                  name: localized(element.category.toLowerCase()),
                  balance: element.totalText,
                  subTitle: localized(
                      state.walletDesc[element.category.toLowerCase()] ?? ''),
                  onPress: () {
                    _onPressTransferWallet(element);
                  },
                  obscureFund: state.obscureFund.value,
                ),
              ),
              Gaps.vGap24,
            ],
          ),
        );
      },
    );
  }

  Widget _buildMainWallet() {
    final mainWallet = state.walletOverview.value.overviewWallet;
    final category = mainWallet.category.toLowerCase();
    return WalletHomeItemView(
      name: localized(category),
      balance: state.mainTotalText,
      subTitle: localized(state.walletDesc[category] ?? ''),
      onPress: _onPressMainWallet,
      obscureFund: state.obscureFund.value,
    );
  }

  Widget _buildOverview(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.moduleBackground.color,
        borderRadius: const BorderRadiusDirectional.only(
          topStart: Radius.circular(25),
          topEnd: Radius.circular(25),
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0x0D000000),
            blurRadius: 6.dp,
            offset: Offset(0, 3.dp),
          ),
        ],
      ),
      padding: EdgeInsetsDirectional.only(
          top: 12.dp, start: 16.dp, bottom: 24.dp, end: 16.dp),
      child: GetBuilder(
        id: 'header',
        init: controller,
        builder: (logic) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              _buildOverViewRow1(),
              _buildOverViewRow2(),
              Gaps.vGap20,
              _buildOpenBalanceRow1(),
              _buildOpenBalanceRow2(),
              Gaps.vGap20,
              _buildOverViewRow3(),
              _buildOverViewRow4(),
              Gaps.vGap20,
              _buildOverViewRow5(),
              _buildOverViewRow6(),
              Gaps.vGap20,
              _buildOverViewRow7(),
              _buildOverViewRow8(),
              Gaps.vGap20,
              _buildOverViewRow9(),
              _buildOverViewRow10(),
              Gaps.vGap24,
              _buildOperationRow(context),
            ],
          );
        },
      ),
    );
  }

  Widget _buildOpenBalanceRow1() {
    final hasData = state.totalFreeze > 0;
    return Obx(() {
      final x = max(0.0, state.freezePosition.value.dx - 16.dp + 3.dp);
      return GamingPopupLinkWidget(
        popup: hasData ? _buildFreezePop() : null,
        targetAnchor: Alignment.topLeft,
        followerAnchor: Alignment.bottomLeft,
        offset: Offset(0, 12.dp),
        triangleInset: EdgeInsetsDirectional.only(start: x),
        child: Row(
          children: [
            SizedBox(height: 44.dp),
            Text(
              localized('open_balance'),
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
            Gaps.hGap16,
            MeasureSize(
              onChange: (Size size, Offset globalOffset) =>
                  state.freezePosition.value = globalOffset,
              child: Visibility(
                visible: hasData,
                child: SvgPicture.asset(
                  R.iconQuestion,
                  width: 14.dp,
                  height: 14.dp,
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildOpenBalanceRow2() {
    return _buildNumRow(
      GGFontSize.superBigTitle,
      state.totalFreezeText,
      state.totalFreeze,
      state.obscureFund.value,
      null,
    );
  }

  Widget _buildOperationRow(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Container(
          constraints: BoxConstraints(
              minWidth: MediaQuery.of(context).size.width / 3 - 30.dp),
          child: GGButton.main(
            onPressed: _onPressCharge,
            text: localized('deposit'),
            isSmall: true,
            backgroundColor: GGColors.brand.color,
          ),
        ),
        Gaps.hGap10,
        Container(
          constraints: BoxConstraints(
              minWidth: MediaQuery.of(context).size.width / 3 - 30.dp),
          child: GGButton.minor(
            onPressed: _onPressTake,
            text: localized('withdrawl'),
            isSmall: true,
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
              minWidth: MediaQuery.of(context).size.width / 3 - 30.dp),
          child: GGButton.minor(
            onPressed: _onPressTransfer,
            text: localized('trans'),
            isSmall: true,
            backgroundColor: GGColors.transparent.color,
            border: Border.all(
              width: 1.dp,
              color: GGColors.border.color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOverViewRow8() {
    return _buildNumRow(
      GGFontSize.superBigTitle,
      state.liveCasinoTotalAmountText,
      state.liveCasinoTotalAmount,
      state.obscureFund.value,
      null,
    );
  }

  Widget _buildOverViewRow10() {
    return _buildNumRow(
      GGFontSize.superBigTitle,
      state.casinoTotalAmountText,
      state.casinoTotalAmount,
      state.obscureFund.value,
      null,
    );
  }

  Widget _buildOverViewRow6() {
    return _buildNumRow(
      GGFontSize.superBigTitle,
      state.takeLimitText,
      state.takeLimit.value,
      state.obscureFund.value,
      null,
    );
  }

  Widget _buildClear(VoidCallback onPressed) {
    return GGButton.main(
      onPressed: onPressed,
      text: localized('clear_zero'),
      height: 30.dp,
      textStyle: GGTextStyle(
        color: GGColors.buttonTextWhite.color,
        fontSize: GGFontSize.content,
      ),
      backgroundColor: GGColors.brand.color,
    );
  }

  Widget _buildOverViewRow9() {
    final hasData = state.casinoTotalAmount > 0;
    return Obx(() {
      final x = max(0.0, state.slotPosition.value.dx - 16.dp + 3.dp);
      return GamingPopupLinkWidget(
        popup: hasData ? _buildNonStickyCasinoPop() : null,
        targetAnchor: Alignment.bottomLeft,
        followerAnchor: Alignment.topLeft,
        offset: Offset(0, -12.dp),
        triangleInset: EdgeInsetsDirectional.only(start: x),
        child: Row(
          children: [
            SizedBox(height: 44.dp),
            Text(
              localized('cas'),
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
            Gaps.hGap16,
            MeasureSize(
              onChange: (Size size, Offset globalOffset) =>
                  state.slotPosition.value = globalOffset,
              child: Visibility(
                visible: hasData,
                child: SvgPicture.asset(
                  R.iconQuestion,
                  width: 14.dp,
                  height: 14.dp,
                ),
              ),
            ),
            Gaps.hGap16,
            Visibility(
              visible: hasData,
              child: _buildClear(_onPressClearCoupon),
            )
          ],
        ),
      );
    });
  }

  Widget _buildOverViewRow7() {
    final hasData = state.liveCasinoTotalAmount > 0;
    return Obx(() {
      final x = max(0.0, state.liveCasinoPosition.value.dx - 16.dp + 3.dp);
      return GamingPopupLinkWidget(
        popup: hasData ? _buildNonStickyLiveCasinoPop() : null,
        targetAnchor: Alignment.bottomLeft,
        followerAnchor: Alignment.topLeft,
        offset: Offset(0, -12.dp),
        triangleInset: EdgeInsetsDirectional.only(start: x),
        child: Row(
          children: [
            SizedBox(height: 44.dp),
            Text(
              localized('live_cas'),
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
            Gaps.hGap16,
            MeasureSize(
              onChange: (Size size, Offset globalOffset) =>
                  state.liveCasinoPosition.value = globalOffset,
              child: Visibility(
                visible: hasData,
                child: SvgPicture.asset(
                  R.iconQuestion,
                  width: 14.dp,
                  height: 14.dp,
                ),
              ),
            ),
            Gaps.hGap16,
            Visibility(
              visible: hasData,
              child: _buildClear(_onPressClearCoupon),
            )
          ],
        ),
      );
    });
  }

  Widget _buildOverViewRow5() {
    final hasData = state.takeLimit.value > 0;
    return Obx(() {
      final x = max(0.0, state.withdrawPosition.value.dx - 16.dp + 3.dp);
      return GamingPopupLinkWidget(
        popup: hasData ? _buildLimitPop() : null,
        targetAnchor: Alignment.bottomLeft,
        followerAnchor: Alignment.topLeft,
        offset: Offset(0, -12.dp),
        triangleInset: EdgeInsetsDirectional.only(start: x),
        child: Row(
          children: [
            SizedBox(height: 44.dp),
            Text(
              FeeService().wdLimit,
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
            Gaps.hGap16,
            MeasureSize(
              onChange: (Size size, Offset globalOffset) =>
                  state.withdrawPosition.value = globalOffset,
              child: Visibility(
                visible: hasData,
                child: SvgPicture.asset(
                  R.iconQuestion,
                  width: 14.dp,
                  height: 14.dp,
                ),
              ),
            ),
            Gaps.hGap16,
            Obx(() {
              return Visibility(
                visible: state.clearWithdrawCurrencies.isNotEmpty,
                child: _buildClear(_onPressClearLimit),
              );
            }),
          ],
        ),
      );
    });
  }

  Widget _buildOverViewRow4() {
    return _buildNumRow(
      GGFontSize.superBigTitle,
      state.totalBonusText,
      state.totalBonus,
      state.obscureFund.value,
      null,
    );
  }

  Widget _buildOverViewRow3() {
    final hasData = state.totalBonus > 0;
    return Obx(() {
      final x = max(0.0, state.bonusPosition.value.dx - 16.dp + 3.dp);
      return GamingPopupLinkWidget(
        popup: hasData ? _buildCouponPop() : null,
        targetAnchor: Alignment.bottomLeft,
        followerAnchor: Alignment.topLeft,
        offset: Offset(0, -12.dp),
        triangleInset: EdgeInsetsDirectional.only(start: x),
        child: Row(
          children: [
            SizedBox(height: 44.dp),
            Text(
              localized('cre_bal'),
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
            Gaps.hGap16,
            MeasureSize(
              onChange: (Size size, Offset globalOffset) =>
                  state.bonusPosition.value = globalOffset,
              child: Visibility(
                visible: hasData,
                child: SvgPicture.asset(
                  R.iconQuestion,
                  width: 14.dp,
                  height: 14.dp,
                ),
              ),
            ),
            Gaps.hGap16,
            Visibility(
              visible: hasData,
              child: _buildClear(_onPressClearCoupon),
            )
          ],
        ),
      );
    });
  }

  Widget _buildOverViewRow2() {
    return _buildNumRow(
      GGFontSize.superBigTitle,
      state.totalText,
      state.totalAsset,
      state.obscureFund.value,
      null,
    );
  }

  Widget _buildNumRow(GGFontSize fontSize, String totalValue, double total,
      bool obscureFund, Widget? rightView,
      {GGFontSize? subFontSize}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: obscureFund
              ? CrossAxisAlignment.center
              : CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.ideographic,
          children: [
            Text(
              obscureFund ? obscureFundText : totalValue,
              style: GGTextStyle(
                fontSize: fontSize,
                height: 1,
                color: GGColors.textMain.color,
                fontFamily: GGFontFamily.dingPro,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
            Gaps.hGap4,
            Text(
              'USDT',
              style: GGTextStyle(
                fontSize: GGFontSize.bigTitle20,
                color: GGColors.textMain.color,
                // fontWeight: GGFontWeigh.bold,
              ),
            ),
            SizedBox(width: 12.dp),
            if (rightView != null) ...[
              const Spacer(),
              rightView,
            ],
          ],
        ),
        if (state.selectedCurrency.currency != 'USDT')
          Container(
            margin: EdgeInsets.only(top: 10.dp),
            child: RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: obscureFund
                        ? obscureFundText
                        : '≈ ${controller.usdtConvert(total)}',
                  ),
                  TextSpan(
                    text: ' ${state.currency}',
                    style: GGTextStyle(
                      fontSize: subFontSize ?? GGFontSize.content,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ],
                style: GGTextStyle(
                  fontWeight: GGFontWeigh.bold,
                  fontSize: subFontSize ?? GGFontSize.content,
                  color: GGColors.textSecond.color,
                  fontFamily: GGFontFamily.dingPro,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildOverViewRow1() {
    return Row(
      children: [
        SizedBox(height: 44.dp),
        TextButton(
          onPressed: _onPressSecure,
          style: ButtonStyle(
            foregroundColor: MaterialStateProperty.all(GGColors.textMain.color),
            textStyle: MaterialStateProperty.all(
              GGTextStyle(
                fontSize: GGFontSize.content,
              ),
            ),
            padding: MaterialStateProperty.all(EdgeInsetsDirectional.zero),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                localized('es_bal'),
                style: GGTextStyle(
                  color: GGColors.textMain.color,
                  fontSize: GGFontSize.content,
                ),
              ),
              Gaps.hGap12,
              SvgPicture.asset(
                state.obscureFund.value ? R.iconSecureOn : R.iconSecureOff,
                // 'assets/wallet/secure_on.svg',
                width: 14.dp,
                height: 14.dp,
                fit: BoxFit.fill,
              ),
            ],
          ),
        ),
        const Spacer(),
        InkWell(
          onTap: _onPressHistory,
          child: Text(
            localized('trans_history'),
            style: GGTextStyle(
              color: GGColors.brand.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.medium,
              decoration: TextDecoration.underline,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLimitPop() {
    final style = GGTextStyle(
      fontSize: GGFontSize.hint,
      color: GGColors.textBlackOpposite.color,
    );
    final list = state.walletOverview.value.overviewWallet.currencies
        .where((element) => element.withdrawLimit > 0);
    final height = min(120.dp, list.length * (10 + 17.dp) - 10.dp);
    return SizedBox(
      height: height,
      child: SingleChildScrollView(
        child: Column(
          children: list
              .map(
                (e) => Padding(
                  padding: EdgeInsetsDirectional.only(
                      bottom: e == list.last ? 0 : 10.dp),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${e.currency}:',
                        style: style,
                      ),
                      Gaps.hGap12,
                      Text(
                        e.withdrawLimitText,
                        style: style,
                      ),
                    ],
                  ),
                ),
              )
              .toList(),
        ),
      ),
    );
  }

  Widget _buildCouponPop() {
    final style = GGTextStyle(
      fontSize: GGFontSize.hint,
      color: GGColors.textBlackOpposite.color,
    );
    final list = state.walletOverview.value.bonusDetail;
    final height = min(120.dp, list.length * (10 + 17.dp) - 10.dp);

    return SizedBox(
      width: 220.dp,
      height: height,
      child: ListView(
        children: list
            .map(
              (e) => Padding(
                padding: EdgeInsetsDirectional.only(
                    bottom: e == list.last ? 0 : 10.dp),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        e.bonusName,
                        style: style,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Gaps.vGap8,
                    Text(
                      '${e.balanceText} ${e.currency}',
                      style: style,
                    ),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }

  Widget _buildNonStickyLiveCasinoPop() {
    final style = GGTextStyle(
      fontSize: GGFontSize.hint,
      color: GGColors.textBlackOpposite.color,
    );
    final liveCasinoModel = state.walletOverview.value.nonStickyBonusWallet
        .firstWhereOrNull((element) {
      return element.category == 'NSLiveCasino';
    });

    return SizedBox(
      height: 17.dp,
      child: Row(
        children: [
          Text(
            '${liveCasinoModel?.amountText.stripTrailingZeros()} ${liveCasinoModel?.currency}',
            style: style,
          ),
        ],
      ),
    );
  }

  Widget _buildNonStickyCasinoPop() {
    final style = GGTextStyle(
      fontSize: GGFontSize.hint,
      color: GGColors.textBlackOpposite.color,
    );
    final liveCasinoModel = state.walletOverview.value.nonStickyBonusWallet
        .firstWhereOrNull((element) {
      return element.category == 'NSSlotGame';
    });

    return SizedBox(
      height: 17.dp,
      child: Row(
        children: [
          Text(
            '${liveCasinoModel?.amountText.stripTrailingZeros()} ${liveCasinoModel?.currency}',
            style: style,
          ),
        ],
      ),
    );
  }

  Widget _buildFreezePop() {
    final style = GGTextStyle(
      fontSize: GGFontSize.hint,
      color: GGColors.textBlackOpposite.color,
    );
    final list = state.walletOverview.value.overviewWallet.currencies
        .where((element) => element.freezeAmount > 0);
    final height = min(120.dp, list.length * (10 + 17.dp) - 10.dp);

    return SizedBox(
      width: 150.dp,
      height: height,
      child: ListView(
        children: list
            .map(
              (e) => Padding(
                padding: EdgeInsetsDirectional.only(
                    bottom: e == list.last ? 0 : 10.dp),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${e.currency} :',
                      style: style,
                    ),
                    const Spacer(),
                    Text(
                      e.freezeText,
                      style: style,
                    ),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

extension _Action on WalletHomePage {
  Widget _buildClearCreditContent(String balance, String nonstickBonus) {
    final textList = [
      localized('clear_desc1'),
      localized('clear_desc2'),
      localized('clear_desc3'),
      localized('clear_desc4'),
      localized('clear_desc5'),
      localized('clear_desc6')
    ]
        .asMap()
        .entries
        .map((entry) => _buildClearContent(
            entry.value,
            entry.key % 2 == 0
                ? GGColors.textSecond.color
                : GGColors.textMain.color))
        .toList();
    Widget buildTitleRow(String title, String num) {
      return Row(
        children: [
          Expanded(
            child: Text.rich(
              textAlign: TextAlign.center,
              TextSpan(
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
                children: [
                  TextSpan(
                    text: '$title: ',
                  ),
                  TextSpan(
                    text: '$num USDT',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.brand.color,
                    ),
                  )
                ],
              ),
            ),
          ),
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (num.tryParse(balance)?.isGreaterThan(0) == true) ...[
          buildTitleRow(localized('current_credit_bal'), balance),
          Gaps.vGap10,
        ],
        if (num.tryParse(nonstickBonus)?.isGreaterThan(0) == true)
          buildTitleRow(localized('current_nonstick_bonus'), nonstickBonus),
        Container(
          width: double.infinity,
          padding:
              EdgeInsetsDirectional.only(top: 10.dp, start: 10.dp, end: 10.dp),
          margin: EdgeInsets.all(20.dp),
          decoration: BoxDecoration(
            color: GGColors.border.color,
            borderRadius: BorderRadius.circular(10),
          ),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxHeight: 200.dp),
            child: ListView(
              children: textList,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildClearContent(String text, Color textColor) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10.dp),
      child: Row(
        children: [
          Expanded(
              child: Text(
            text,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: textColor,
            ),
          )),
        ],
      ),
    );
  }

  /// 抵用金额清零
  void _onPressClearCoupon() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('confirm_clear_credit_title'),
      moreWidget: _buildClearCreditContent(
          "${state.totalBonus}", "${state.totalNonStickyBonus}"),
      leftBtnName: localized('cancels'),
      rightBtnName: localized('clear_zero'),
      rightCountdown: 5,
      onRightBtnPressed: () {
        Get.back<void>();
        controller.clearCredit();
      },
    ).showNoticeDialogWithTwoButtons();
  }

  /// 提款限额清零
  void _onPressClearLimit() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: FeeService().confirmClearWithdrawlimit,
      content: state.clearWithdrawHint,
      contentMaxLine: 10,
      leftBtnName: localized('cancels'),
      rightBtnName: localized('confirm_button'),
      onRightBtnPressed: () {
        Get.back<void>();
        controller.clearWithdraw();
      },
    ).showNoticeDialogWithTwoButtons();
  }

  /// 点击钱包
  void _onPressTransferWallet(GamingAggsWalletModel wallet) {
    WalletService.sharedInstance.openTransferWallet(wallet);
  }

  /// 点击主钱包
  void _onPressMainWallet() {
    WalletService.sharedInstance
        .openMainWallet(state.walletOverview.value.overviewWallet);
  }

  /// 划转
  void _onPressTransfer() {
    Get.toNamed<dynamic>(Routes.transfer.route);
  }

  /// 提现
  void _onPressTake() {
    WithdrawRouterUtil.goWithdrawHome();
  }

  /// 充值
  void _onPressCharge() {
    DepositRouterUtil.goDepositHome();
  }

  void _onPressSecure() {
    controller.changeSecure();
  }

  void _onPressHistory() {
    Get.toNamed<dynamic>(Routes.walletHistory.route);
  }
}
