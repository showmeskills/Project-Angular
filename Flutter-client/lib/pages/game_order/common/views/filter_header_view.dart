part of '../../game_order_page.dart';

class GameOrderFilterHeaderView<C extends BaseGameOrderLogic<T>, T>
    extends StatelessWidget {
  const GameOrderFilterHeaderView({
    super.key,
  });
  C get controller => Get.find<C>();

  IGameOrderState<T> get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp)
          .copyWith(bottom: 16.dp, top: 16.dp),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  localized('status'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                Gaps.vGap4,
                GamingSelectorWidget(
                  onPressed: controller.openStatusSelector,
                  builder: (context) {
                    return Obx(() {
                      return Text(
                        state.status.description,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      );
                    });
                  },
                ),
              ],
            ),
          ),
          Gaps.hGap16,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  localized('scope'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                Gaps.vGap4,
                GamingSelectorWidget(
                  onPressed: controller.openDateSelector,
                  builder: (context) {
                    return Obx(() {
                      return Text(
                        state.dateRange.type.description(true),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      );
                    });
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
