part of '../digital_currency_withdrawal_view.dart';

class DigitalWithdrawalResultView extends BaseView<DigitalWithdrawResultLogic> {
  const DigitalWithdrawalResultView({
    super.key,
    required this.withdrawModel,
  });

  final GamingWithdrawResultModel withdrawModel;

  DigitalCurrencyWithdrawalLogic get controller2 =>
      Get.find<DigitalCurrencyWithdrawalLogic>();
  DigitalCurrencyWithdrawalState get state => controller2.state;

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      leadingIcon: const GamingCloseButton(),
      title: localized('wd_crypto'),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(DigitalWithdrawResultLogic());
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildStepArea(),
          Gaps.vGap24,
          _buildOderInfo(),
          Gaps.vGap24,
          SizedBox(
            width: double.infinity,
            height: 48.dp,
            child: GGButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              text: localized('sure'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfo(String title, String content, {int index = 0}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.hGap12,
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        const Spacer(),
        Container(
          constraints: BoxConstraints(maxWidth: 200.dp),
          child: RichText(
            text: TextSpan(children: [
              WidgetSpan(
                //对齐方式
                alignment: PlaceholderAlignment.middle,
                //这里就是中间显示的图片了也可以是其他任意的 Widget
                child: Visibility(
                  visible: index == 1,
                  child: GamingImage.network(
                    url: state.currency?.iconUrl,
                    width: 18.dp,
                    height: 18.dp,
                  ),
                ),
              ),
              WidgetSpan(
                child: Gaps.hGap4,
              ),
              TextSpan(
                text: content,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
                // textAlign
              ),
            ]),
            textAlign: TextAlign.end,
            maxLines: 2,
          ),
        ),
        Gaps.hGap12,
      ],
    );
  }

  Widget _buildOderInfo() {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.popBackground.color,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Gaps.vGap16,
          _buildInfo("${localized("order_number")}:", withdrawModel.orderId),
          Gaps.vGap20,
          _buildInfo(
              "${localized("number")}:",
              "${localized("t_t_acc00")} "
                  "${NumberPrecision(withdrawModel.amount - withdrawModel.fee).balanceText(true)} ${withdrawModel.currency}"
                  "(${localized("fee")} "
                  "${withdrawModel.fee} ${withdrawModel.currency})",
              index: 1),
          Gaps.vGap20,
          _buildInfo("${localized("wd_curr_add")}:", withdrawModel.address),
          Gaps.vGap20,
          _buildInfo("${localized("trans_network")}:", withdrawModel.network),
          Gaps.vGap16,
        ],
      ),
    );
  }

  Widget _buildStepArea() {
    return Stack(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Gaps.vGap24,
            _buildStep(
              '1',
              localized("oder_info"),
              numColor: GGColors.highlightButton.color,
            ),
            Gaps.vGap4,
            _buildStepInfo(
              lineColor: GGColors.highlightButton.color,
            ),
            Gaps.vGap4,
            _buildStep('2', localized("fund_review")),
            Gaps.vGap4,
            _buildStepInfo(content: localized("check_account")),
            Gaps.vGap4,
            _buildStep('3', localized("fund_approval")),
            Gaps.vGap4,
            _buildStepInfo(content: localized("wait_block_trans")),
            Gaps.vGap4,
            _buildStep('4', localized("block_complete")),
            Gaps.vGap4,
            _buildStepInfo(
              content: localized("fund_arr"),
              lineColor: Colors.transparent,
            ),
          ],
        ),
        Positioned(
          bottom: 0.dp,
          right: 16.dp,
          child: Image.asset(
            R.currencyWithdrawGuide,
            width: 112.dp,
            height: 112.dp,
          ),
        )
      ],
    );
  }

  Widget _buildStepInfo({String? content, Color? lineColor}) {
    return IntrinsicHeight(
      child: Row(
        children: [
          Gaps.hGap10,
          Container(
            color: lineColor ?? GGColors.border.color,
            width: 4.dp,
          ),
          Gaps.hGap20,
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Visibility(
                visible: content?.isNotEmpty ?? false,
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: Get.width - 70.dp),
                  child: Text(
                    content ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.hint,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ),
              ),
              Gaps.vGap16,
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStep(String num, String title, {Color? numColor}) {
    return Row(
      children: [
        Container(
          width: 24.dp,
          height: 24.dp,
          decoration: BoxDecoration(
            color: numColor ?? GGColors.border.color,
            borderRadius: BorderRadius.circular(12.dp),
          ),
          child: Center(
            child: Text(
              num,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
          ),
        ),
        Gaps.hGap12,
        Expanded(
          child: Text(
            title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
              fontWeight: GGFontWeigh.bold,
            ),
          ),
        )
      ],
    );
  }
}
