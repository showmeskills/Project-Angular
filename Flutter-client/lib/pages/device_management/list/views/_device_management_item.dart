part of '../device_management_page.dart';

class _DeviceManagementItem extends StatelessWidget with GamingOverlayMixin {
  _DeviceManagementItem({
    required this.data,
  });

  final GamingDeviceHistoryModel data;

  DeviceManagementLogic get controller => Get.find<DeviceManagementLogic>();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.dp),
      margin: EdgeInsets.only(top: 8.dp),
      decoration: BoxDecoration(
        color: GGColors.darkPopBackground.color,
        borderRadius: BorderRadius.circular(8.dp),
      ),
      child: Column(
        children: [
          ScaleTap(
            onPressed: _onMorePressed,
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    data.osBrowser,
                    style: GGTextStyle(
                      fontSize: GGFontSize.smallTitle,
                      color: GGColors.textMain.color,
                    ),
                  ),
                ),
                Gaps.hGap16,
                CompositedTransformTarget(
                  link: overlay.layerLink,
                  child: SvgPicture.asset(
                    R.iconMore,
                    width: 14.dp,
                    height: 14.dp,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ],
            ),
          ),
          Gaps.vGap8,
          _buildCellItem(
            title: localized('time'),
            value: DateFormat('yyyy-MM-dd HH:mm:ss')
                .formatTimestamp(data.lastLoginTime!),
          ),
          Gaps.vGap8,
          _buildCellItem(
            title: localized('location'),
            value: '${data.createZone}',
          ),
          Gaps.vGap8,
          _buildCellItem(
            title: localized('ip_addr00'),
            value: '${data.createIp}',
          ),
        ],
      ),
    );
  }

  Widget _buildCellItem({
    required String title,
    required String value,
  }) {
    return Row(
      children: [
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
              fontFamily: GGFontFamily.dingPro,
            ),
          ),
        ),
      ],
    );
  }
}

extension _Action on _DeviceManagementItem {
  void _onMorePressed() {
    overlay.show(builder: (context) {
      return GamingPopupView(
        link: overlay.layerLink,
        contentPadding: EdgeInsets.zero,
        targetAnchor: Alignment.bottomRight,
        followerAnchor: Alignment.topRight,
        triangleSize: const Size(10, 6),
        triangleInset: const EdgeInsetsDirectional.only(end: 10),
        // popColor: GGColors.background.color,
        onDismiss: () => overlay.hide(),
        usePenetrate: true,
        child: Container(
          constraints: BoxConstraints(minWidth: 88.dp),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildMenuItem(
                title: localized('delete'),
                isFirst: true,
                onPressed: _onDeletePressed,
              ),
              _buildMenuItem(
                title: localized('view_more'),
                isLast: true,
                onPressed: _onViewMorePressed,
              ),
            ],
          ),
        ),
      );
    });
  }

  void _onDeletePressed() {
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.accountDeleteDevice,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('del_device00'),
      titleSize: GGFontSize.bigTitle20,
      content: '${localized('device')}: ${data.osBrowser}',
      rightBtnName: localized('confirm_button'),
      leftBtnName: localized('cancels'),
      onRightBtnPressed: () {
        Get.back<dynamic>();
        controller.delete(data.id!);
      },
      onLeftBtnPressed: () {
        Get.back<dynamic>();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  void _onViewMorePressed() {
    Get.toNamed<void>(Routes.deviceManagementLog.route, arguments: {
      'title': data.osBrowser,
      'id': data.id,
    });
  }

  Widget _buildMenuItem({
    required String title,
    bool isFirst = false,
    bool isLast = false,
    void Function()? onPressed,
  }) {
    return InkWell(
      borderRadius: BorderRadius.vertical(
        bottom: isLast ? Radius.circular(4.dp) : Radius.zero,
        top: isFirst ? Radius.circular(4.dp) : Radius.zero,
      ),
      onTap: onPressed != null
          ? () {
              hidePopup();
              onPressed();
            }
          : null,
      child: Ink(
        padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 10.dp),
        width: double.infinity,
        child: Text(
          title,
          textAlign: TextAlign.start,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textBlackOpposite.color,
          ),
        ),
      ),
    );
  }
}
