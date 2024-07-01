import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'transfer_logic.dart';

class TransferPage extends BaseView<TransferLogic> {
  const TransferPage({
    super.key,
    this.category = '',
  });
  final String? category;
  TransferState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () {
        String category = '';
        if (Get.arguments != null) {
          Map<String, dynamic> arguments =
              Get.arguments as Map<String, dynamic>;
          if (arguments.containsKey('category')) {
            category = arguments['category'].toString();
          }
        }
        return TransferPage(
          category: category,
        );
      },
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      leadingIcon: GamingCloseButton(
        onPressed: () {
          Get.back<void>();
        },
      ),
      title: localized('trans'),
      backgroundColor: GGColors.alertBackground.color,
    );
  }

  @override
  Color backgroundColor() {
    return GGColors.alertBackground.color;
  }

  @override
  Widget body(BuildContext context) {
    Get.put(TransferLogic(category: category));
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Obx(() {
        return _buildContent(context);
      }),
    );
  }

  Widget _buildContent(BuildContext context) {
    if (state.showResult.value) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap20,
          _buildResult(context),
        ],
      );
    } else {
      return SizedBox(
          height:
              MediaQuery.of(context).size.height - 115.dp - Util.bottomMargin,
          child: _buildSteps(context));
    }
  }

  Widget _buildTopTips() {
    return Text(
      localized("free_trans"),
      textAlign: TextAlign.center,
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textHint.color,
      ),
    );
  }

  Widget _buildSteps(BuildContext context) {
    return Column(
      children: [
        _buildTopTips(),
        _accountsWidget(),
        Gaps.vGap8,
        _buildNoMainTip(),
        _buildCoinType(),
        Gaps.vGap24,
        _buildQuantity(),
        Gaps.vGap8,
        _buildBalanceTips(),
        _buildErrorAmountTips(),
        const Spacer(),
        _buildBottomBtn(context),
        _buildNoMainBtn(),
      ],
    );
  }

  Widget _buildNoMainTip() {
    return Visibility(
      visible: controller.isNoMainWallet.value,
      child: SizedBox(
        width: double.infinity,
        child: Text(
          localized('top_to_curr'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.error.color,
          ),
        ),
      ),
    );
  }

  Widget _buildNoMainBtn() {
    return Visibility(
      visible: controller.isNoMainWallet.value,
      child: Container(
        padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
        height: 48.dp,
        width: double.infinity,
        child: GGButton(
          backgroundColor: GGColors.highlightButton.color,
          onPressed: () => onPressDeposit(),
          enable: true,
          isLoading: false,
          text: getLocalString('recharge'),
        ),
      ),
    );
  }

  void onPressDeposit() {
    Get.back<dynamic>();
    DepositRouterUtil.goDepositHome();
  }

  Widget _buildResult(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp, bottom: 40.dp),
      width: double.infinity,
      decoration: BoxDecoration(
        color: GGColors.popBackground.color,
        borderRadius: BorderRadius.circular(12.dp),
      ),
      child: Column(
        children: [
          Gaps.vGap38,
          Image.asset(
            controller.success.value ? R.iconBindSuccess : R.iconResultFailed,
            width: 92.dp,
            height: 84.dp,
            fit: BoxFit.contain,
          ),
          Gaps.vGap20,
          Text(
            controller.success.value
                ? localized('successful')
                : localized('failed'),
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle20,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap26,
          Text(
            controller.success.value
                ? localized('succ_trans')
                : localized('trans_fail'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap6,
          Text(
            '${state.numTextFieldController.textController.text} ${state.curBalance.value.currency}',
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle20,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap38,
          _buildResultRow(
              localized('from'),
              state.fromWallet.value.walletName ??
                  state.fromWallet.value.category),
          Gaps.vGap16,
          _buildResultRow(localized('f_to'),
              state.toWallet.value.walletName ?? state.toWallet.value.category),
          Gaps.vGap16,
          _buildResultRow(
              localized('time'), state.result.value.timeStampString),
          Gaps.vGap16,
          _buildResultRow(localized('order_number'),
              GGUtil.parseStr(state.result.value.data?.transactionId)),
          Gaps.vGap42,
          _buildBackBtn(context),
        ],
      ),
    );
  }

  /// 返回
  Widget _buildBackBtn(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).pop();
      },
      child: Container(
        padding: EdgeInsets.only(left: 7.dp, right: 7.dp),
        height: 42.dp,
        width: double.infinity,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: GGColors.highlightButton.color,
          borderRadius: BorderRadius.all(Radius.circular(4.dp)),
        ),
        child: Text(localized('return'),
            style: GGTextStyle(
              color: GGColors.buttonTextWhite.color,
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.regular,
            )),
      ),
    );
  }

  Widget _buildResultRow(String name, String value) {
    return Row(
      children: [
        Text(
          name,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }

  Widget titleLeft() {
    return SizedBox(
      height: 224.dp,
      child: Column(
        children: [
          SizedBox(
            height: 61.dp,
          ),
          Stack(
            alignment: Alignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(9.dp),
                child: Container(
                  width: 9.dp,
                  height: 9.dp,
                  color: GGColors.success.color,
                ),
              ),
              ClipRRect(
                borderRadius: BorderRadius.circular(5.dp),
                child: Container(
                  width: 5.dp,
                  height: 5.dp,
                  color: GGColors.background.color,
                ),
              ),
            ],
          ),
          SvgPicture.asset(
            R.iconTransferLeftDot,
            height: 36.dp,
            color: GGColors.textSecond.color,
          ),
          GestureDetector(
            onTap: () {
              controller.exchangeWallets();
            },
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24.dp),
              child: Container(
                width: 24.dp,
                height: 24.dp,
                padding: EdgeInsets.only(
                    left: 6.dp, right: 6.dp, top: 7.dp, bottom: 7.dp),
                decoration: BoxDecoration(
                  color: GGColors.border.color,
                  borderRadius: BorderRadius.all(Radius.circular(24.dp)),
                ),
                child: SvgPicture.asset(
                  R.iconTransferArrows,
                  height: 12.dp,
                  color: GGColors.similarSecond.color,
                  fit: BoxFit.fitHeight,
                ),
              ),
            ),
          ),
          SvgPicture.asset(
            R.iconTransferLeftDot,
            height: 36.dp,
            color: GGColors.textSecond.color,
          ),
          Stack(
            alignment: Alignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(9.dp),
                child: Container(
                  width: 9.dp,
                  height: 9.dp,
                  color: GGColors.brand.color,
                ),
              ),
              ClipRRect(
                borderRadius: BorderRadius.circular(5.dp),
                child: Container(
                  width: 5.dp,
                  height: 5.dp,
                  color: GGColors.background.color,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _accountsWidget() {
    return SizedBox(
      height: 224.dp,
      child: Row(
        children: [
          titleLeft(),
          Gaps.hGap24,
          _buildAccountsWidget(),
        ],
      ),
    );
  }

  Widget _buildContainer({
    required Widget child,
    Color? color,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: 14.dp,
        vertical: color == null ? 16.dp : 17.dp,
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4.dp),
        border: color == null
            ? Border.all(
                color: GGColors.border.color,
                width: 1.dp,
              )
            : null,
      ),
      child: child,
    );
  }

  Widget _buildAccountsWidget() {
    return SizedBox(
      width: 294.dp,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          Text(
            localized('from'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap4,
          _buildFromInput(),
          Gaps.vGap30,
          Text(
            localized('to'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap4,
          _buildToInput(),
        ],
      ),
    );
  }

  Widget _buildFromInput() {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: controller.selectFromWallet,
      child: _buildContainer(
        color: GGColors.homeFootBackground.color,
        child: Row(
          children: [
            SvgPicture.asset(
              R.iconTransferFromIcon,
              width: 13.dp,
              height: 13.dp,
              color: GGColors.iconHint.color,
            ),
            Gaps.hGap12,
            if (controller.isLoadWallets.value)
              ThreeBounceLoading(
                dotColor: GGColors.textMain.color,
                dotSize: 15.dp,
              ),
            Text(
              state.fromWallet.value.walletName ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            ),
            const Spacer(),
            SvgPicture.asset(
              R.iconDown,
              height: 7.dp,
              color: GGColors.textSecond.color,
            ),
          ],
        ),
      ),
    );
  }

  /// 币种
  Widget _buildCurrencyInput() {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: controller.selectCurrency,
      child: _buildContainer(
        color: GGColors.homeFootBackground.color,
        child: Row(
          children: [
            if (controller.isLoadWallets.value)
              ThreeBounceLoading(
                dotColor: GGColors.textMain.color,
                dotSize: 15.dp,
              ),
            GamingImage.network(
              url: state.curBalance.value.iconUrl,
              width: 13.dp,
              height: 13.dp,
            ),
            Gaps.hGap12,
            Text(
              state.curBalance.value.currency ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            ),
            const Spacer(),
            SvgPicture.asset(
              R.iconDown,
              height: 7.dp,
              color: GGColors.textSecond.color,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToInput() {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: controller.selectToWallet,
      child: _buildContainer(
        color: GGColors.homeFootBackground.color,
        child: Row(
          children: [
            SvgPicture.asset(
              R.iconTransferToIcon,
              width: 13.dp,
              height: 13.dp,
              color: GGColors.iconHint.color,
            ),
            Gaps.hGap12,
            if (controller.isLoadWallets.value)
              ThreeBounceLoading(
                dotColor: GGColors.textMain.color,
                dotSize: 15.dp,
              ),
            Text(
              state.toWallet.value.walletName ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            ),
            const Spacer(),
            SvgPicture.asset(
              R.iconDown,
              height: 7.dp,
              color: GGColors.textSecond.color,
            ),
          ],
        ),
      ),
    );
  }

  /// 币种
  Widget _buildCoinType() {
    return Visibility(
      visible: !controller.isNoMainWallet.value,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            localized('curr'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap6,
          _buildCurrencyInput(),
        ],
      ),
    );
  }

  /// 数量
  Widget _buildQuantity() {
    return Visibility(
      visible: !controller.isNoMainWallet.value,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            localized('number'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap4,
          GamingBaseTextField(
            hintText: '${localized('min_wd')} ${state.min.value}',
            autofocus: true,
            // 带有小数点的数字键盘
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            controller: state.numTextFieldController.textController,
            // fillColor: GGColors.homeFootBackground,
            suffixIcon: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  state.curBalance.value.currency ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textHint.color,
                  ),
                ),
                Gaps.hGap14,
                GestureDetector(
                  onTap: () {
                    state.numTextFieldController.textController.text =
                        state.max.value.toString();
                    FocusScope.of(Get.overlayContext!)
                        .requestFocus(FocusNode());
                  },
                  child: SizedBox(
                    child: Text(
                      localized('all'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.brand.color,
                      ),
                    ),
                  ),
                ),
                Gaps.hGap12,
              ],
            ),
          ),
          // web暂时去掉这个提示了
          // Visibility(
          //   visible: controller.isToBig.value,
          //   child: Container(
          //     padding: EdgeInsets.only(top: 4.dp, bottom: 2.dp),
          //     child: Text(
          //       localized('too_big'),
          //       style: GGTextStyle(
          //         fontSize: GGFontSize.hint,
          //         color: GGColors.error.color,
          //       ),
          //     ),
          //   ),
          // ),
          Gaps.vGap4,
          Text(
            '${localized('ava_balance')} ${state.max.value} ${state.curBalance.value.currency}',
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textSecond.color,
            ),
          ),
          Visibility(
            visible: controller.showTip.value,
            child: Container(
              padding: EdgeInsets.only(top: 14.dp, bottom: 4.dp),
              child: Text(
                localized('trans_money'),
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.error.color,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceTips() {
    return Visibility(
      visible: state.max.value == 0,
      child: SizedBox(
        width: double.infinity,
        child: Text(
          localized('tips_balance'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.error.color,
          ),
        ),
      ),
    );
  }

  Widget _buildErrorAmountTips() {
    return SizedBox(
      width: double.infinity,
      child: Text(
        state.errorAmountTip.value,
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
          color: GGColors.error.color,
        ),
      ),
    );
  }

  /// 底部按钮
  Widget _buildBottomBtn(BuildContext context) {
    return Obx(() {
      return Visibility(
        visible: !controller.isNoMainWallet.value,
        child: Container(
          padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
          height: 48.dp,
          width: double.infinity,
          child: GGButton(
            backgroundColor: GGColors.highlightButton.color,
            onPressed: () => controller.transfer(),
            enable: controller.enableNext.value,
            isLoading: controller.isTransfer.value,
            text: getLocalString('confirm_trans'),
          ),
        ),
      );
    });
  }
}
