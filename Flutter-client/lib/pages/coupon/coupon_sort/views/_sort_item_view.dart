part of '../coupon_sort_page.dart';

class _SortItemView extends StatelessWidget {
  const _SortItemView({
    required super.key,
    required this.data,
    required this.index,
    required this.couponStatusList,
    this.hideMargin = false,
  });
  final int index;
  final GamingCouponModel data;
  final List<GamingCouponStatusModel> couponStatusList;
  final bool hideMargin;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: hideMargin ? 0 : 20.dp),
      child: ReorderableDelayedDragStartListener(
        index: index,
        child: Stack(
          alignment: Alignment.center,
          children: [
            GamingCouponHomeListItem(
              data: data,
              couponStatusList: couponStatusList,
            ),
            Positioned(
              left: -10.dp,
              child: CustomReorderableDragStartListener(
                index: index,
                child: Container(
                  width: 49.dp,
                  height: 56.dp,
                  alignment: Alignment.center,
                  child: GamingImage.asset(
                    R.iconSortDragBtn,
                    color: GGColors.textSecond.color,
                    height: 16.dp,
                    width: 9.dp,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CustomReorderableDragStartListener extends ReorderableDragStartListener {
  /// Creates a listener for an drag following a long press event over the
  /// given child widget.
  ///
  /// This is most commonly used to wrap an entire list item in a reorderable
  /// list.
  const CustomReorderableDragStartListener({
    super.key,
    required super.child,
    required super.index,
    super.enabled,
  });

  @override
  Widget build(BuildContext context) {
    return Listener(
      behavior: HitTestBehavior.opaque,
      onPointerDown: enabled
          ? (PointerDownEvent event) => _startDragging(context, event)
          : null,
      child: child,
    );
  }

  void _startDragging(BuildContext context, PointerDownEvent event) {
    final DeviceGestureSettings? gestureSettings =
        MediaQuery.maybeGestureSettingsOf(context);
    final SliverReorderableListState? list =
        SliverReorderableList.maybeOf(context);
    list?.startItemDragReorder(
      index: index,
      event: event,
      recognizer: createRecognizer()..gestureSettings = gestureSettings,
    );
  }
}
