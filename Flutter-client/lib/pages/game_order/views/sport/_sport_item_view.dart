part of 'sport_view.dart';

class _SportItemView extends StatelessWidget {
  const _SportItemView({
    required this.data,
  });

  final GamingSportOrderModel data;

  GamingOrderSportLogic get controller => Get.find<GamingOrderSportLogic>();

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
                        '${data.gameDetail.sport}@${data.odds}',
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
                Gaps.hGap10,
                GestureDetectorHitTestWithoutSizeLimit(
                  extraHitTestArea: EdgeInsets.all(10.dp),
                  onTap: _onPressedShare,
                  child: SvgPicture.asset(
                    R.iconShare,
                    width: 18.dp,
                    height: 18.dp,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ],
            ),
          ),
          _SportGameView(data: data),
          Divider(
            height: 1.dp,
            thickness: 1.dp,
            color: GGColors.border.color,
          ),
          GameOrderItemBottomView(
            data: data,
            padding: EdgeInsets.all(10.dp),
          ),
        ],
      ),
    );
  }
}

extension _Action on _SportItemView {
  void pressDetail() {
    GameOrderDetailPage.show(
      wagerNumber: data.wagerNumber,
      gameType: controller.gameType,
      statusSelector: controller.statusSelector,
    );
  }

  void _onPressedShare() {
    GamingBottomSheet.show<void>(
      title: localized('share_bet'),
      useCloseButton: true,
      centerTitle: false,
      fixedHeight: false,
      builder: (context) {
        return _SportShareView(data: data);
      },
    );

    // showGeneralDialog(
    //   context: Get.overlayContext!,
    //   pageBuilder: (BuildContext buildContext, Animation<double> animation,
    //       Animation<double> secondaryAnimation) {
    //     return;
    //   },
    //   barrierDismissible: false,
    //   barrierLabel: MaterialLocalizations.of(Get.overlayContext!)
    //       .modalBarrierDismissLabel,
    //   barrierColor: Colors.black54,
    //   transitionDuration: const Duration(milliseconds: 150),
    //   transitionBuilder: (BuildContext context, Animation<double> animation,
    //       Animation<double> secondaryAnimation, Widget child) {
    //     return FadeTransition(
    //       opacity: CurvedAnimation(
    //         parent: animation,
    //         curve: Curves.easeOut,
    //       ),
    //       child: child,
    //     );
    //   },
    // );
  }
}
