part of 'lottery_view.dart';

class _LotteryItemView extends StatelessWidget {
  const _LotteryItemView({
    required this.data,
  });

  final GamingLotteryOrderModel data;

  GamingOrderLotteryLogic get controller => Get.find<GamingOrderLotteryLogic>();

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
                  title: localized('play_type'),
                  value: data.gameDetail.playWay,
                ),
                Gaps.vGap10,
                GameOrderCellItem(
                  title: localized('issue'),
                  value: data.gameDetail.roundNo,
                ),
                Gaps.vGap10,
                GameOrderCellItem(
                  title: localized('odds'),
                  value: data.odds,
                ),
                Gaps.vGap10,
                GameOrderCellItem(
                  title: localized('tran_content'),
                  value: data.gameDetail.betContent,
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

extension _Action on _LotteryItemView {
  void pressDetail() {
    GameOrderDetailPage.show(
      wagerNumber: data.wagerNumber,
      gameType: controller.gameType,
      statusSelector: controller.statusSelector,
    );
  }
}
