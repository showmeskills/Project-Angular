part of 'digital_currency_withdrawal_view.dart';

class WithdrawalLastConfirmSheet extends StatelessWidget {
  const WithdrawalLastConfirmSheet({
    super.key,
  });

  DigitalCurrencyWithdrawalLogic get controller =>
      Get.find<DigitalCurrencyWithdrawalLogic>();

  DigitalCurrencyWithdrawalState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Container(
          padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
          // width: 321.dp,
          child: Column(
            children: [
              Container(
                height: 148.dp,
                padding: EdgeInsets.only(
                    left: 12.dp, right: 12.dp, top: 16.dp, bottom: 16.dp),
                decoration: BoxDecoration(
                  color: GGColors.popBackground.color,
                  borderRadius: BorderRadius.all(Radius.circular(6.0.dp)),
                ),
                child: _buildContent(),
              ),
              Gaps.vGap16,
              _buildWithHint(localized('make_netwk_addrs00'), context),
              Gaps.vGap16,
              _buildWithHint(localized('make_netwk_addrs01'), context),
              Gaps.vGap24,
              SizedBox(
                width: double.infinity,
                height: 48.dp,
                child: GGButton(
                  onPressed: () {
                    _withdraw();
                  },
                  enable: controller.enableNext.value,
                  isLoading: controller.isWithdraw.value,
                  text: localized('continue'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildContent() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        /// 数量
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              localized('number'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
              maxLines: 2,
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
                    child: GamingImage.network(
                      url: state.currency?.iconUrl,
                      width: 18.dp,
                      height: 18.dp,
                    ),
                  ),
                  WidgetSpan(
                    child: Gaps.hGap4,
                  ),
                  TextSpan(
                    text:
                        '${localized("t_t_acc00")} ${controller.getCanReceive.value} ${state.currency?.currency} (${localized('network__fee')} ${state.network?.withdrawFee} ${state.limit?.currency})',
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
          ],
        ),

        /// 提币地址
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              localized('wd_curr_add'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
              maxLines: 2,
            ),
            const Spacer(),
            SizedBox(
              width: 200.dp,
              child: Text(
                state.addressController.textController.text,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
                maxLines: 2,
                textAlign: TextAlign.end,
              ),
            ),
          ],
        ),

        /// 转账网络
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              localized('trans_network'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
              maxLines: 2,
            ),
            const Spacer(),
            SizedBox(
              width: 200.dp,
              child: Text(
                state.network?.desc ?? '',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
                maxLines: 2,
                textAlign: TextAlign.end,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildWithHint(String str, BuildContext context) {
    return Row(
      children: [
        Container(
          width: 6.dp,
          height: 6.dp,
          decoration: BoxDecoration(
            color: GGColors.textMain.color.withOpacity(0.8),
            borderRadius: BorderRadius.all(Radius.circular(6.0.dp)),
          ),
        ),
        Gaps.hGap16,
        SizedBox(
          width: MediaQuery.of(context).size.width - 54.dp,
          child: Text(
            str,
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textMain.color,
            ),
            maxLines: 2,
          ),
        ),
      ],
    );
  }

  void _withdraw() {
    Navigator.pop(Get.overlayContext!);
    controller.withdraw();
  }
}
