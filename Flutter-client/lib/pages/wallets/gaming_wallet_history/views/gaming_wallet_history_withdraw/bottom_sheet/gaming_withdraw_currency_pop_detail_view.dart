import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/history/models/gaming_currency_history_model.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/views/gaming_wallet_history_withdraw/bottom_sheet/gaming_withdraw_currency_pop_detail_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../../../common/service/currency/currency_service.dart';
import '../../../../../../common/widgets/gaming_image/gaming_image.dart';

// ignore: must_be_immutable
class GamingWithdrawCurrencyPopDetailView extends StatelessWidget
    with DepositCommonUtilsMixin {
  GamingWithdrawCurrencyPopDetailView({Key? key, required this.data})
      : super(key: key);
  final GamingCurrencyHistoryModel data;

  GamingWithdrawCurrencyPopDetailLogic get controller =>
      Get.find<GamingWithdrawCurrencyPopDetailLogic>();
  GamingOverlay limitOverlay = GamingOverlay();
  @override
  Widget build(BuildContext context) {
    return _buildDetail();
  }

  Widget _buildDetail() {
    Get.lazyPut(() => GamingWithdrawCurrencyPopDetailLogic());
    return Container(
      padding: EdgeInsets.only(
          bottom: 20.dp + Util.iphoneXBottom, left: 24.dp, right: 24.dp),
      child: Column(
        children: [
          _buildRow(localized('dates'), data.timeToSS),
          Gaps.vGap18,
          GestureDetectorHitTestWithoutSizeLimit(
            extraHitTestArea: EdgeInsets.all(10.dp),
            onTap: () => copyToClipboard(data.orderNum ?? ''),
            child: _buildRow(
              localized('order_number'),
              data.orderNum,
              icon: SvgPicture.asset(
                R.iconCopy,
                width: 14.dp,
                height: 14.dp,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
          Gaps.vGap18,
          _buildRow(localized('curr'), data.currency),
          Gaps.vGap18,
          _buildRow(localized('withdraw_amount'), data.amount),
          Gaps.vGap18,
          _buildRow(localized('overhead_fee_deduct'), data.feeWaiver),
          Gaps.vGap18,
          _buildRow(localized('real_overhead_fee_deduct'), data.fee),
          Gaps.vGap18,
          _buildRow(
            localized('digital_currency_fee'),
            (data.coinFee == 0 ? '-' : data.coinFee),
            icon: data.coinFee == 0
                ? null
                : SizedBox(
                    width: 14.dp,
                    height: 14.dp,
                    child: GamingImage.network(
                      url:
                          CurrencyService.sharedInstance.getIconUrl(data.token),
                    ),
                  ),
          ),
          Gaps.vGap18,
          _buildRow(
              localized('total_receive'),
              data.token.isEmpty
                  ? (data.receiveAmount == 0 ? '-' : data.receiveAmount)
                  : (data.coinAmount == 0 ? '-' : data.coinAmount),
              icon: (data.token.isNotEmpty && data.coinAmount != 0)
                  ? SizedBox(
                      width: 14.dp,
                      height: 14.dp,
                      child: GamingImage.network(
                        url: CurrencyService.sharedInstance
                            .getIconUrl(data.token),
                      ),
                    )
                  : null),
          Gaps.vGap18,
          _buildRow(localized('pay_method'), data.paymentMethod),
          Gaps.vGap18,
          _buildStatus(localized('status')),
          Gaps.vGap24,
          _buildCancelOrder(),
          Gaps.vGap18,
        ],
      ),
    );
  }

  Widget _buildCancelOrder() {
    return Visibility(
      visible: (data.status == GamingCurrencyHistoryModelStatus.review.value ||
          data.status == GamingCurrencyHistoryModelStatus.passed.value),
      child: SizedBox(
        width: double.infinity,
        height: 48.dp,
        child: GGButton(
          onPressed: () {
            Navigator.of(Get.overlayContext!).pop();
            click();
          },
          image: Image.asset(R.iconCancelIcon, width: 14.dp, height: 14.dp),
          text: localized('cancel'),
          imageTextSpace: 4.dp,
        ),
      ),
    );
  }

  Widget _buildRow(String title, dynamic content, {Widget? icon}) {
    return Row(
      children: [
        Text(title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            )),
        const Spacer(),
        Text('$content',
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            )),
        if (icon != null)
          Container(
            margin: EdgeInsets.only(left: 4.dp),
            child: icon,
          ),
      ],
    );
  }

  Widget _buildStatus(
    String title,
  ) {
    String strName = data.statusName;
    if (data.status == GamingCurrencyHistoryModelStatus.success.value) {
      if (data.amount - data.fee > data.receiveAmount) {
        strName = localized('partial_success');
      } else {
        strName = localized('successful');
      }
    }

    return Row(
      children: [
        Text(title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            )),
        const Spacer(),
        Text(strName,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            )),
        Visibility(
            visible:
                data.status == GamingCurrencyHistoryModelStatus.canceled.value,
            child: Gaps.hGap8),
        Visibility(
          visible:
              data.status == GamingCurrencyHistoryModelStatus.canceled.value,
          child: GamingPopupLinkWidget(
            overlay: limitOverlay,
            followerAnchor: Alignment.bottomRight,
            targetAnchor: Alignment.topLeft,
            popup: _buildTip(),
            offset: Offset(10.dp, 0.dp),
            triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
            child: SvgPicture.asset(
              R.iconTipIcon,
              width: 15.dp,
              height: 15.dp,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTip() {
    String str = '';
    if (data.failReason == 0) {
      str = 'other_reason';
    } else if (data.failReason == 1) {
      str = 'user_cancel';
    } else if (data.failReason == 2) {
      str = 'withdraw_fail';
    }

    return Text(
      localized(str),
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textBlackOpposite.color,
      ),
    );
  }

  void click() {
    final title = localized('cancel_c_t');
    final content = localized('cancel_c_d');
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: title,
      content: content,
      rightBtnName: localized('confirm_button'),
      leftBtnName: localized('cancels'),
      onRightBtnPressed: () {
        Get.back<dynamic>();
        controller.clearWithdraw(data.orderNum ?? '');
      },
      onLeftBtnPressed: () {
        Get.back<dynamic>();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }
}
