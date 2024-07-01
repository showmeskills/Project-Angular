part of 'wallet.dart';

class _BalanceView extends StatefulWidget {
  const _BalanceView();

  @override
  State<_BalanceView> createState() => __BalanceViewState();
}

class __BalanceViewState extends State<_BalanceView> {
  DashboardWalletLogic get logic => Get.find<DashboardWalletLogic>();
  DashboardWalletState get state => logic.state;

  bool showPie = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildUSDT(),
          Gaps.vGap10,
          _buildCurrencyConversion(),
          _buildPie(),
          Gaps.vGap18,
          _buildButtonGroup(),
        ],
      ),
    );
  }

  Widget _buildPie() {
    if (!showPie) {
      return Gaps.empty;
    }
    return Obx(() => Container(
          margin: EdgeInsets.only(top: 18.dp),
          child: PieChartSample2(
            chartData: state.currentPieChartSectionData,
            onTouchedIndex: logic.onTouchedIndex,
          ),
        ));
  }

  Widget _buildButton({
    required double width,
    required Widget child,
    required void Function()? onPressed,
    Color? color,
    Color? textColor,
  }) {
    return ScaleTap(
      opacityMinValue: 0.8,
      scaleMinValue: 0.98,
      onPressed: onPressed,
      child: Container(
        width: width.toDouble(),
        height: 40.dp,
        decoration: ShapeDecoration(
          shape: StadiumBorder(
            side: BorderSide(
              color: color ?? GGColors.border.color,
              width: 1.dp,
            ),
          ),
        ),
        alignment: Alignment.center,
        child: DefaultTextStyle(
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: textColor ?? GGColors.textSecond.color,
          ),
          child: child,
        ),
      ),
    );
  }

  Widget _buildButtonGroup() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = ((constraints.maxWidth - 8.dp * 2) ~/ 3).toDouble();
        return Row(
          children: [
            _buildButton(
              width: width,
              child: Text(localized('deposit')),
              color: GGColors.brand.color,
              textColor: GGColors.brand.color,
              onPressed: _onPressCharge,
            ),
            Gaps.hGap8,
            _buildButton(
              width: width,
              child: Text(localized('withdraw')),
              onPressed: _onPressTake,
            ),
            Gaps.hGap8,
            _buildButton(
              width: width,
              child: Text(localized('trans')),
              onPressed: _onPressTransfer,
            ),
          ],
        );
      },
    );
  }

  Widget _buildUSDT() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Obx(
          () => Text(
            state.totalText,
            style: GGTextStyle(
              fontSize: GGFontSize.superBigTitle,
              color: GGColors.textMain.color,
              fontFamily: GGFontFamily.dingPro,
              fontWeight: GGFontWeigh.bold,
            ),
          ),
        ),
        Container(
          margin: EdgeInsets.only(left: 4.dp),
          child: Text(
            'USDT',
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textSecond.color,
              height: 1.44,
            ),
          ),
        ),
        Gaps.hGap12,
        Container(
          height: GGFontSize.hint.fontSize * 1.44,
          alignment: Alignment.center,
          child: Obx(
            () => GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {
                logic.toggleEncryption();
              },
              child: SvgPicture.asset(
                state.encryption ? R.iconVisibilityOff : R.iconVisibility,
                width: 14.dp,
                height: 14.dp,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCurrencyConversion() {
    return Row(
      children: [
        Expanded(
          child: Row(
            children: [
              Text(
                '≈',
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textSecond.color,
                ),
              ),
              Gaps.hGap4,
              Obx(
                () => Text(
                  state.totalText2,
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.textSecond.color,
                    fontFamily: GGFontFamily.dingPro,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ),
              Gaps.hGap4,
              Obx(
                () => Text(
                  state.selectedCurrency.currency!,
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
            ],
          ),
        ),
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            setState(() {
              showPie = !showPie;
            });
          },
          child: Container(
            height: 12.dp * 1.4,
            padding: EdgeInsets.only(left: 12.dp),
            child: AnimatedRotation(
              turns: showPie ? 0 : -0.5,
              duration: const Duration(milliseconds: 200),
              child: SvgPicture.asset(
                R.iconUp,
                width: 8.dp,
                height: 6.dp,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

extension _Action on __BalanceViewState {
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
}
