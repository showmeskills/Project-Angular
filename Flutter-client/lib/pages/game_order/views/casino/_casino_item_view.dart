part of 'casino_view.dart';

class _CasinoItemView extends StatelessWidget {
  const _CasinoItemView({
    required this.data,
  });

  final GamingCasinoOrderModel data;

  GamingOrderCasinoLogic get controller => Get.find<GamingOrderCasinoLogic>();

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
                  child: Row(
                    children: [
                      Text(
                        data.gameProvider,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                      ),
                      Gaps.hGap8,
                      Text(
                        data.gameDetail.gameName,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                      ),
                    ],
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
                  title: localized('table_name'),
                  value: data.gameDetail.table,
                ),
                Gaps.vGap10,
                GameOrderCellItem(
                  title: localized('play_type'),
                  value: data.gameDetail.playOption,
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

extension _Action on _CasinoItemView {
  void pressDetail() {
    GameOrderDetailPage.show(
      wagerNumber: data.wagerNumber,
      gameType: controller.gameType,
      statusSelector: controller.statusSelector,
    );
  }
}
