part of '../currency_deposit_result_confirm_page.dart';

class _ConfirmRemarkInfoView extends StatelessWidget with DepositCommonUIMixin {
  const _ConfirmRemarkInfoView({
    required this.data,
    required this.payment,
  });
  final GamingCurrencyDepositModel data;
  final GamingCurrencyPaymentModel payment;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildConfirmPageTitle(localized('remark_info')),
        Gaps.vGap20,
        if (data.remark?.isNotEmpty ?? false)
          Container(
            margin: EdgeInsets.only(bottom: 20.dp),
            child: Text(
              data.remark!,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        Container(
          width: double.infinity,
          color: GGColors.alertBackground.color,
          padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 4.dp),
          child: _buildContent(),
        ),
      ],
    );
  }

  Widget _buildContent() {
    if (payment.detailContent.isEmpty) {
      return Container(
        padding: EdgeInsets.symmetric(vertical: 4.dp),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${localized('desc')}: ',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
            Gaps.hGap8,
            Expanded(
              child: Text(
                localized('fill_content'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.link.color,
                ),
              ),
            ),
          ],
        ),
      );
    }
    return Html(
      data: payment.detailContent,
      style: {
        'body': Style(
          margin: Margins.zero,
        ),
      },
    );
  }

  // Widget _buildItem(String content, [String? highlight]) {
  //   List<TextSpan> text = [TextSpan(text: content)];
  //   if (highlight != null) {
  //     final list = content.split(highlight);
  //     text = (list..insert(list.isNotEmpty ? 1 : 0, highlight)).map((e) {
  //       if (e == highlight) {
  //         return TextSpan(
  //           text: e,
  //           style: GGTextStyle(
  //             fontSize: GGFontSize.content,
  //             color: GGColors.error.color,
  //           ),
  //         );
  //       } else {
  //         return TextSpan(
  //           text: e,
  //         );
  //       }
  //     }).toList();
  //   }
  //   return Row(
  //     crossAxisAlignment: CrossAxisAlignment.start,
  //     children: [
  //       Gaps.hGap8,
  //       SizedBox(
  //         height: GGFontSize.content.fontSize * 1.4,
  //         child: Container(
  //           decoration: BoxDecoration(
  //             color: GGColors.textSecond.color,
  //             shape: BoxShape.circle,
  //           ),
  //           width: 5.dp,
  //           height: 5.dp,
  //         ),
  //       ),
  //       Gaps.hGap8,
  //       Expanded(
  //         child: RichText(
  //           text: TextSpan(
  //             children: text,
  //             style: GGTextStyle(
  //               fontSize: GGFontSize.content,
  //               color: GGColors.textSecond.color,
  //             ),
  //           ),
  //         ),
  //       )
  //     ],
  //   );
  // }
}
