part of '../crypto_deposit_page.dart';

class _AddressView extends StatelessWidget with DepositCommonUtilsMixin {
  const _AddressView();

  CryptoDepositLogic get controller => Get.find<CryptoDepositLogic>();

  CryptoDepositState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (state.network == null || state.address == null) {
        return Gaps.empty;
      }
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap16,
          Center(
            child: SizedBox(
              width: 160.dp,
              height: 160.dp,
              child: Obx(() => QrImage(
                    data: state.address!.address,
                    size: 160.dp,
                    backgroundColor: GGColors.buttonTextWhite.color,
                    padding: EdgeInsets.all(16.dp),
                    errorCorrectionLevel: QrErrorCorrectLevel.M,
                  )),
            ),
          ),
          Gaps.vGap4,
          Center(
            child: Text(
              localized('scan_code'),
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
          Gaps.vGap16,
          _buildAddress(),
          Gaps.vGap16,
          _buildConfirmCount(),
          Gaps.vGap16,
          _buildMinDeposit(),
          Gaps.vGap16,
          _buildTips(),
        ],
      );
    });
  }

  Widget _buildAddress() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTitle(localized('address')),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => copyToClipboard(state.address!.address),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Obx(() => Text(
                      localized(state.address!.address),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        fontFamily: GGFontFamily.dingPro,
                        color: GGColors.textMain.color,
                        fontWeight: GGFontWeigh.bold,
                      ),
                    )),
              ),
              Gaps.hGap8,
              SvgPicture.asset(
                R.iconCopy,
                width: 18.dp,
                height: 18.dp,
                color: GGColors.textMain.color,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTitle(String title) {
    return Text(
      title,
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textSecond.color,
      ),
    );
  }

  Widget _buildConfirmCount() {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTitle(localized('exp_arr')),
              Gaps.vGap4,
              Obx(() => Text(
                    '${state.address!.expectedBlock}${localized('time_net')}',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  )),
            ],
          ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTitle(localized('exp_un')),
              Gaps.vGap4,
              RichText(
                text: TextSpan(
                  children: [
                    WidgetSpan(child: Obx(() {
                      return Text(
                        state.address!.expectedUnlockBlock.toString(),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.error.color,
                        ),
                      );
                    })),
                    TextSpan(
                      text: localized('time_net'),
                    ),
                  ],
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMinDeposit() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTitle(localized('min_num')),
        Gaps.vGap4,
        Obx(() => Text(
              '${state.address!.minDeposit} ${state.address!.token}',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                fontFamily: GGFontFamily.dingPro,
                fontWeight: GGFontWeigh.bold,
              ),
            )),
      ],
    );
  }

  Widget _buildTipsIcon() {
    return Container(
      width: 5.dp,
      height: 5.dp,
      decoration: BoxDecoration(
        color: GGColors.textSecond.color,
        shape: BoxShape.circle,
      ),
    );
  }

  Widget _buildTips() {
    return Column(
      children: [
        Row(
          children: [
            _buildTipsIcon(),
            Gaps.hGap8,
            Obx(() => Text(
                  localized('add_receive', params: [state.address!.token]),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                )),
          ],
        ),
        Gaps.vGap4,
        Row(
          children: [
            _buildTipsIcon(),
            Gaps.hGap8,
            RichText(
              text: TextSpan(
                children: [
                  TextSpan(
                    text: localized('again_choose'),
                  ),
                  WidgetSpan(child: Obx(() {
                    return Text(
                      ' ${state.address!.network}',
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.error.color,
                      ),
                    );
                  })),
                ],
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
