part of '../appeal_page.dart';

class _AppealItemView extends StatelessWidget with AppealCommonUIMixin {
  const _AppealItemView({
    required this.data,
  });

  final GamingAppealModel data;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 30.dp),
      child: ExpandableNotifier(
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    '${localized('app_id')}${data.appealId}',
                    style: GGTextStyle(
                      fontSize: GGFontSize.smallTitle,
                      color: GGColors.textMain.color,
                    ),
                  ),
                ),
                Gaps.hGap16,
                ScaleTap(
                  onPressed:
                      data.needSupplement ? data.onPressedSupplement : null,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 12.dp,
                    ),
                    decoration: BoxDecoration(
                      color: GGColors.highlightButton.color,
                      borderRadius: BorderRadius.circular(4.dp),
                    ),
                    constraints:
                        BoxConstraints(minWidth: 82.dp, minHeight: 30.dp),
                    alignment: Alignment.center,
                    child: Text(
                      data.statusText,
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: GGColors.buttonTextWhite.color,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Gaps.vGap20,
            Divider(
              height: 1.dp,
              thickness: 1.dp,
              color: GGColors.border.color,
            ),
            Gaps.vGap20,
            _buildAppealTime(),
            Gaps.vGap20,
            _buildCompleteTime(),
            Gaps.vGap20,
            _buildPayMethod(),
            Gaps.vGap20,
            _buildAmount(),
            Expandable(
              collapsed: const SizedBox(width: double.infinity),
              expanded: _AppealItemExpandedView(data: data),
            ),
            Gaps.vGap20,
            const Align(
              alignment: Alignment.centerRight,
              child: _AppealExpandableButton(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppealTime() {
    return Row(
      children: [
        Text(
          localized('appli_time00'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textHint.color,
          ),
        ),
        const Spacer(),
        Text(
          DateFormat('yyyy-MM-dd HH:mm:ss').formatTimestamp(data.appealTime!),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }

  Widget _buildCompleteTime() {
    return Row(
      children: [
        Text(
          localized('pro_time'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textHint.color,
          ),
        ),
        const Spacer(),
        Text(
          (data.processTime ?? 0) == 0
              ? '--'
              : DateFormat('yyyy-MM-dd HH:mm:ss')
                  .formatTimestamp(data.processTime!),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }

  Widget _buildAmount() {
    return Row(
      children: [
        Text(
          localized('app_amount'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textHint.color,
          ),
        ),
        const Spacer(),
        Text(
          data.amountText,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
            fontFamily: GGFontFamily.dingPro,
          ),
        ),
        Gaps.hGap4,
        Text(
          data.currency,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
            fontFamily: GGFontFamily.dingPro,
          ),
        ),
        Gaps.hGap8,
        GamingImage.network(
          url: data.currencyIconUrl,
          width: 18.dp,
          height: 18.dp,
        ),
      ],
    );
  }

  Widget _buildPayMethod() {
    return Row(
      children: [
        Text(
          localized('pay_methods'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textHint.color,
          ),
        ),
        const Spacer(),
        Text(
          data.paymentMethod ?? '',
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
            fontFamily: GGFontFamily.dingPro,
          ),
        ),
        // Gaps.hGap8,
        // GamingImage.network(
        //   url: data.currencyIconUrl,
        //   width: 18.dp,
        //   height: 18.dp,
        // ),
      ],
    );
  }
}

extension AppealSupplementAction on GamingAppealModel {
  void onPressedSupplement() {
    Get.toNamed<void>(Routes.currencyAppealSubmit.route, arguments: {
      'id': appealId,
    });
  }
}

class _AppealExpandableButton extends StatelessWidget {
  const _AppealExpandableButton();

  @override
  Widget build(BuildContext context) {
    final controller = ExpandableController.of(context)!;
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        controller.toggle();
      },
      child: ValueListenableBuilder<bool>(
        valueListenable: controller,
        builder: (context, value, child) {
          return SvgPicture.asset(
            value ? R.iconReduceFill : R.iconAddFill,
            width: 20.dp,
            height: 20.dp,
            color: GGColors.iconHint.color,
          );
        },
      ),
    );
  }
}
