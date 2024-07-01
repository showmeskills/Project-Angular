part of 'chess_view.dart';

class _ChessItemView extends StatelessWidget {
  const _ChessItemView({
    required this.data,
  });

  final GamingChessOrderModel data;

  GamingOrderChessLogic get controller => Get.find<GamingOrderChessLogic>();

  @override
  Widget build(BuildContext context) {
    return GameOrderItemContainer(
      onTap: pressDetail,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(10.dp),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    data.gameProvider,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  ),
                ),
                Text(
                  controller.getStatusText(data.wagerStatus),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: data.statusColor,
                  ),
                ),
              ],
            ),
          ),
          Divider(
            height: 1.dp,
            thickness: 1.dp,
            color: GGColors.border.color,
          ),
          Container(
            padding: EdgeInsets.all(10.dp),
            child: Column(
              children: [
                GameOrderCellItem(
                  title: localized('gname'),
                  value: data.gameDetail,
                ),
                Gaps.vGap10,
                GameOrderCellItem(
                  title: localized('odds'),
                  value: data.odds,
                ),
                Gaps.vGap10,
                GameOrderItemBottomView(data: data),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

extension _Action on _ChessItemView {
  void pressDetail() {
    GameOrderDetailPage.show(
      wagerNumber: data.wagerNumber,
      gameType: controller.gameType,
      statusSelector: controller.statusSelector,
    );
  }
}
