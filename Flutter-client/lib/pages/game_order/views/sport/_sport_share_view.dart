part of 'sport_view.dart';

class _SportShareView extends StatelessWidget
    with BaseSingleRenderViewDelegate {
  const _SportShareView({
    required this.data,
  });

  final GamingSportOrderModel data;

  GameOrderShareLogic get controller => Get.find<GameOrderShareLogic>();

  @override
  SingleRenderViewController get renderController => controller.controller;

  @override
  Widget getLoadingWidget(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final maxHeight = screenHeight * 0.5 - 58.dp;
    return SizedBox(
      height: maxHeight,
      child: const GoGamingLoading(),
    );
  }

  @override
  Widget build(BuildContext context) {
    Get.put(GameOrderShareLogic());
    final screenHeight = MediaQuery.of(context).size.height;
    return ConstrainedBox(
      constraints: BoxConstraints(
        minWidth: double.infinity,
        minHeight: screenHeight * 0.5 - 58.dp,
        maxHeight: screenHeight * 0.85,
      ),
      child: SingleRenderView(
        controller: controller,
        delegate: this,
        child: _buildInfo(),
      ),
    );
  }

  Widget _buildInfo() {
    return Column(
      children: [
        Expanded(
          child: LayoutBuilder(builder: (context, constraints) {
            final minHeight = constraints.maxHeight - 76.dp;
            return SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: 16.dp),
              child: RepaintBoundary(
                key: controller.globalKey,
                child: Column(
                  children: [
                    Container(
                      width: double.infinity,
                      constraints: BoxConstraints(
                        minHeight: minHeight,
                      ),
                      decoration: const BoxDecoration(
                        image: DecorationImage(
                          image: AssetImage(R.gameInviteBg),
                          fit: BoxFit.fitWidth,
                          alignment: Alignment.topCenter,
                        ),
                      ),
                      child: Column(
                        children: [
                          Container(
                            constraints: BoxConstraints(
                              minHeight: minHeight -
                                  GGFontSize.bigTitle20.fontSize * 1.4 * 2 -
                                  8.dp -
                                  16.dp,
                            ),
                            child: Builder(
                              builder: (context) {
                                if (data.subOrderList.isEmpty) {
                                  return _buildSingle();
                                } else {
                                  return _buildMutil();
                                }
                              },
                            ),
                          ),
                          _buildAmount(),
                        ],
                      ),
                    ),
                    _buildQRCode(),
                  ],
                ),
              ),
            );
          }),
        ),
        _buildFooter(),
      ],
    );
  }

  Widget _buildFooter() {
    return SafeArea(
      top: false,
      minimum: EdgeInsets.only(bottom: 24.dp, top: 24.dp),
      child: Row(
        children: [
          Expanded(
            child: _buildButton(icon: R.iconShare2, onPressed: _share),
          ),
          Expanded(
            child: CompositedTransformTarget(
              link: controller.overlay.layerLink,
              child: _buildButton(icon: R.iconCopy2, onPressed: _copy),
            ),
          ),
          Expanded(
            child: _buildButton(icon: R.iconDownload, onPressed: _save),
          ),
        ],
      ),
    );
  }

  Widget _buildButton({
    required String icon,
    void Function()? onPressed,
  }) {
    return ScaleTap(
      onPressed: onPressed,
      child: Container(
        decoration: BoxDecoration(
          color: GGColors.border.color,
          shape: BoxShape.circle,
        ),
        width: 56.dp,
        height: 56.dp,
        alignment: Alignment.center,
        child: SvgPicture.asset(
          icon,
          width: 24.dp,
          height: 24.dp,
          color: GGColors.textSecond.color,
        ),
      ),
    );
  }

  Widget _buildQRCode() {
    return Container(
      height: 76.dp,
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      color: const Color(0xFF0DAB5F),
      child: Row(
        children: [
          GamingImage.network(
            url: controller.appLogo,
            height: 44.dp,
            width: 44.dp,
            fit: BoxFit.contain,
            errorBuilder: (p0, p1, p2) {
              return SvgPicture.asset(
                R.appbarTempLogo,
                width: 44.dp,
                fit: BoxFit.contain,
              );
            },
          ),
          const Spacer(),
          Obx(() {
            if (controller.invite?.inviteUrl == null) {
              return Gaps.empty;
            }
            return QrImage(
              data: controller.invite!.inviteUrl!,
              size: 60.dp,
              backgroundColor: GGColors.buttonTextWhite.color,
              padding: EdgeInsets.all(2.dp),
              errorCorrectionLevel: QrErrorCorrectLevel.M,
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSingle() {
    return Column(
      mainAxisSize: MainAxisSize.max,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              R.gameInviteBgTop,
              width: double.infinity,
              fit: BoxFit.fitWidth,
              alignment: Alignment.topCenter,
            ),
            Text(
              data.gameDetail.tournamentName ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.smallTitle,
                color: Colors.white,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
            Gaps.vGap16,
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.dp),
              child: Builder(builder: (context) {
                final event = (data.gameDetail.eventName ?? '')
                    .split('v')
                    .map((e) => e.trim())
                    .toList();
                return Row(
                  children: [
                    Expanded(
                      child: Text(
                        event.first,
                        textAlign: TextAlign.center,
                        style: GGTextStyle(
                          fontSize: GGFontSize.smallTitle,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    Gaps.hGap4,
                    Text(
                      'vs',
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: Colors.white,
                      ),
                    ),
                    Gaps.hGap4,
                    Expanded(
                      child: Text(
                        event.last,
                        textAlign: TextAlign.center,
                        style: GGTextStyle(
                          fontSize: GGFontSize.smallTitle,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                );
              }),
            ),
            Gaps.vGap16,
            _buildBetDateTime(),
          ],
        ),
        Container(
          margin: EdgeInsets.only(bottom: 46.dp),
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
          child: _buildGameItem(
            value1: '${data.gameDetail.betContent ?? ''} @${data.odds}',
            value2: data.gameDetail.betoptionName ?? '',
          ),
        ),
      ],
    );
  }

  Widget _buildMutil() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        Stack(
          children: [
            Image.asset(
              R.gameInviteBgTop,
              width: double.infinity,
              fit: BoxFit.fitWidth,
              alignment: Alignment.topCenter,
            ),
            Positioned(
              top: 133.dp,
              left: 0,
              right: 0,
              child: _buildBetDateTime(),
            ),
          ],
        ),
        Transform.translate(
          offset: Offset(0, -12.dp * 1.4 - 8.dp),
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 16.dp),
            child: Column(
              children: data.subOrderList.map((e) {
                return _buildGameItem(
                  value1: e.eventName ?? '',
                  value2: '${e.betContent ?? ''} @${e.detailOdds}',
                  isMulti: true,
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGameItemEvent({
    required String eventName,
    bool isMulti = false,
  }) {
    if (!isMulti) {
      return Text(
        eventName,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: Colors.white,
        ),
      );
    }
    final event = eventName.split('v').map((e) => e.trim()).toList();
    return Row(
      children: [
        Expanded(
          child: Text(
            event.first,
            textAlign: TextAlign.end,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: Colors.white,
            ),
          ),
        ),
        Gaps.hGap4,
        Text(
          'vs',
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: Colors.white,
          ),
        ),
        Gaps.hGap4,
        Expanded(
          child: Text(
            event.last,
            textAlign: TextAlign.start,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGameItem({
    required String value1,
    required String value2,
    bool isMulti = false,
  }) {
    return Container(
      margin: EdgeInsets.only(top: 8.dp),
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF0DAB5F),
        borderRadius: BorderRadius.circular(8.dp),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: 12.dp,
        vertical: 8.dp,
      ),
      child: Column(
        children: [
          _buildGameItemEvent(eventName: value1, isMulti: isMulti),
          Gaps.vGap4,
          Text(
            value2,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmount() {
    return Container(
      padding: EdgeInsets.symmetric(
        vertical: 16.dp,
        horizontal: 16.dp,
      ).copyWith(top: 0),
      child: Obx(() => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildAmountItem(
                title: localized('amount_transaction'),
                value: data.betAmountUSDTText,
              ),
              Gaps.vGap8,
              _buildAmountItem(
                title: data.payoutAmount == null
                    ? localized('exp_b_amount')
                    : localized('wol'),
                value: data.payoutAmount == null
                    ? data.expectedReturnUSDTTextWithSymbol
                    : data.payoutAmountTextWithSymbol,
              ),
            ],
          )),
    );
  }

  Widget _buildAmountItem({
    required String title,
    required String value,
  }) {
    return Row(
      children: [
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: Colors.white,
          ),
        ),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle20,
              color: const Color(0xFF00F57E),
              fontWeight: GGFontWeigh.medium,
            ),
          ),
        ),
        Gaps.hGap4,
        GamingImage.network(
          url: GamingCurrencyModel.usdt().iconUrl,
          width: 20.dp,
          height: 20.dp,
        ),
      ],
    );
  }

  Widget _buildBetDateTime() {
    return Align(
      alignment: Alignment.center,
      child: Text(
        '${localized('tran_hour')}: ${data.betDateTimeText}',
        textAlign: TextAlign.center,
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
          color: GGColors.buttonTextWhite.color,
        ),
      ),
    );
  }
}

extension _ShareAction on _SportShareView {
  void _save() {
    controller.save();
  }

  void _copy() {
    controller.copy();
  }

  void _share() {
    controller.share();
  }
}
