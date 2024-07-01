import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/common/service/payment_iq_service/payment_iq_config.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/fiat_withdraw/fiat_to_eb/fiat_to_eb_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../common/api/currency/models/payment/gaming_currency_payment_model.dart';
import '../../../../common/widgets/gaming_image/gaming_image.dart';
import '../../fiat_to_virtual/fiat_to_virtual_logic.dart';
import '../../fiat_withdraw_info/fiat_withdraw_info_logic.dart';
import '../fiat_withdraw_logic.dart';
import '../fiat_withdraw_state.dart';

class FiatWithdrawSelectPaymentView extends StatelessWidget {
  const FiatWithdrawSelectPaymentView({super.key});

  FiatWithdrawLogic get controller => Get.find<FiatWithdrawLogic>();
  FiatWithdrawState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (state.currentCurrency.value == null) {
        return Container();
      }

      if (state.payment.value?.paymentList.isEmpty == true ||
          state.payment.value?.types.isEmpty == true) {
        return Container(
          margin: EdgeInsets.only(top: 16.dp),
          // child: const GoGamingMaintaining(),
          child: Obx(() {
            if (state.showPIQ.value) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildPiqQuotaLimit(),
                  PaymentIQView(
                    controller: controller.paymentIQController,
                  ),
                ],
              );
            } else {
              return SizedBox(
                width: double.infinity,
                child: GGButton.main(
                  onPressed: _submitPIQ,
                  text: localized('continue'),
                ),
              );
            }
          }),
        );
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap16,
          Text(
            localized("defa_me"),
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.content,
            ),
          ),
          Gaps.vGap6,
          _buildTabBar(),
          Gaps.vGap16,
          _buildPaymentMethodView(),
        ],
      );
    });
  }

  Widget _buildPaymentMethodView() {
    return Obx(() {
      List<GamingCurrencyPaymentModel>? l =
          state.payment.value?.paymentList.where((element) {
        if (state.selectPaymentType.value == localized("other_pay")) {
          return element.type.isEmpty;
        } else {
          return element.type.contains(state.selectPaymentType.value);
        }
      }).toList();
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: l?.map((e) => _buildPaymentMethodItem(e)).toList() ?? [],
      );
    });
  }

  Widget _buildPiqQuotaLimit() {
    if (state.currencyQuotaModel.value == null) {
      return Container();
    }
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 12.dp),
      decoration: BoxDecoration(
        border: Border.all(
          width: 1.dp,
          color: GGColors.border.color,
        ),
        borderRadius: BorderRadius.circular(4.dp),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildPiqQuotaLimitItem(
            title: localized('avai_amount'),
            value: state.currencyQuotaModel.value!.availQuota,
          ),
          Gaps.vGap6,
          _buildPiqQuotaLimitItem(
            title: '${FeeService().wdLimit}:',
            value: state.currencyQuotaModel.value!.withdrawQuota,
          ),
          Gaps.vGap6,
          _buildPiqQuotaLimitItem(
            title: localized('avai_amount_24'),
            value: state.currencyQuotaModel.value!.todayQuota,
            valueText: state.currencyQuotaModel.value!.todayUnlimited
                ? localized('no_limit')
                : null,
            unit: 'USDT',
          ),
          Gaps.vGap6,
          _buildPiqQuotaLimitItem(
            title: localized('widthdrawal_amount'),
            value: state.currencyQuotaModel.value!.canUseQuota,
          ),
        ],
      ),
    );
  }

  Widget _buildPiqQuotaLimitItem({
    required String title,
    num? value,
    String? valueText,
    String? unit,
  }) {
    final text = (valueText?.isEmpty ?? true)
        ? '${(value ?? 0).toNP().balanceText(unit == 'USDT')} ${unit ?? state.currentCurrency.value!.currency!}'
        : valueText;

    return Text(
      '$title $text',
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textSecond.color,
      ),
    );
  }

  Widget _buildPaymentMethodItem(GamingCurrencyPaymentModel info) {
    if (info.actionType == 7) {
      return Gaps.empty;
    }
    return Obx(() {
      bool isSelect = state.selectPaymentInfo.value == info;
      return GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => controller.selectPaymentMethod(info),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SvgPicture.asset(
                  isSelect ? R.iconRadioChecked : R.iconRadioUnChecked,
                  width: 16.dp,
                  height: 16.dp,
                ),
                Gaps.hGap16,
                if (info.icons.firstOrNull?.isEmpty ?? true)
                  GamingImage.asset(
                    R.iconDefaultPayment,
                    width: 20.dp,
                    height: 20.dp,
                  )
                else
                  GamingImage.network(
                    url: info.icons.first,
                    width: 20.dp,
                    height: 20.dp,
                  ),
                Gaps.hGap16,
                Text(
                  info.name,
                  style: TextStyle(
                    color: GGColors.textSecond.color,
                    fontSize: GGFontSize.content.fontSize,
                  ),
                ),
              ],
            ),
            Gaps.vGap16
          ],
        ),
      );
    });
  }

  Widget _buildTabTypeItem(String content) {
    return Obx(() {
      return GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          _seletType(content);
        },
        child: Container(
          decoration: BoxDecoration(
            color: (content == state.selectPaymentType.value)
                ? GGColors.border.color
                : GGColors.transparent.color,
            borderRadius: BorderRadius.circular(4.dp),
            border: Border.all(
              width: 1.dp,
              color: GGColors.border.color,
            ),
          ),
          padding: EdgeInsets.symmetric(vertical: 6.dp, horizontal: 8.dp),
          child: Text(
            content,
            style: TextStyle(
              color: (content == state.selectPaymentType.value)
                  ? GGColors.textMain.color
                  : GGColors.textSecond.color,
              fontSize: GGFontSize.content.fontSize,
            ),
          ),
        ),
      );
    });
  }

  Widget _buildTabBar() {
    return Obx(() {
      List<String> l = <String>[];
      l.addAll(state.payment.value?.types ?? []);
      if (l.isEmpty) {
        l.add(localized("other_pay"));
      }
      return SizedBox(
        width: double.infinity,
        child: Wrap(
          direction: Axis.horizontal,
          spacing: 12.dp,
          runSpacing: 12.dp,
          children: l.map((e) {
            return _buildTabTypeItem(e);
          }).toList(),
        ),
      );
    });
  }
}

extension _Action on FiatWithdrawSelectPaymentView {
  void _seletType(String content) {
    state.selectPaymentType.value = content;
    state.selectPaymentInfo.value = null;

    /// 切换 tab 后删除 logic 维护的状态
    Get.delete<FiatWithdrawInfoLogic>();
    Get.delete<FiatToVirtualLogic>();
    Get.delete<FiatToEBLogic>();
    if (controller.getPaymentActionType(content) == 7) {
      final model = controller.getPaymentWithType(content);
      if (model != null) {
        controller.selectPaymentMethod(model);
      }
    }
  }

  void _submitPIQ() {
    controller.submitPIQ();
  }
}
