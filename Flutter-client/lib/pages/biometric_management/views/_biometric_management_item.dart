part of '../biometric_management_page.dart';

class _BiometricManagementItem extends StatelessWidget {
  const _BiometricManagementItem({
    required this.data,
  });

  final BiometricModel data;

  BiometricManagementLogic get controller =>
      Get.find<BiometricManagementLogic>();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 8.dp),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4.dp),
        color: GGColors.darkPopBackground.color,
      ),
      padding: EdgeInsets.symmetric(
        horizontal: 16.dp,
        vertical: 18.dp,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (data.isCurrentDevice ?? false)
                  Container(
                    margin: EdgeInsets.only(bottom: 8.dp),
                    padding:
                        EdgeInsets.symmetric(vertical: 2.dp, horizontal: 4.dp),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(4.dp),
                      color: GGColors.brand.color.withOpacity(0.1),
                    ),
                    child: Text(
                      localized('current_device'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: GGColors.brand.color,
                      ),
                    ),
                  ),
                Text(
                  data.deviceName ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                ),
                Gaps.vGap8,
                Text(
                  localized('add_time') +
                      DateFormat('yyyy-MM-dd HH:mm:ss').format(
                          DateTime.fromMillisecondsSinceEpoch(
                              data.createTime!)),
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ],
            ),
          ),
          ScaleTap(
            onPressed: rename,
            child: Container(
              width: 38.dp,
              height: 38.dp,
              alignment: Alignment.center,
              child: SvgPicture.asset(
                R.iconEdit2,
                width: 16.dp,
                height: 16.dp,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
          ScaleTap(
            onPressed: delete,
            child: Container(
              width: 38.dp,
              height: 38.dp,
              alignment: Alignment.center,
              child: SvgPicture.asset(
                R.iconDelete2,
                width: 16.dp,
                height: 16.dp,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

extension _Action2 on _BiometricManagementItem {
  void delete() {
    final hasPassword =
        AccountService.sharedInstance.gamingUser?.hasPassword ?? false;
    if (hasPassword) {
      GamingBottomSheet.show<void>(
        title: localized('biometric_delete'),
        fixedHeight: false,
        useCloseButton: false,
        builder: (p0) {
          return _BiometricDeleteTextFieldView(
            onSavePressed: (v) {
              controller.delete(
                id: data.id!,
                input: v,
                isCurrent: data.isCurrentDevice ?? false,
              );
            },
          );
        },
      );
    } else {
      DialogUtil(
        context: Get.overlayContext!,
        iconPath: R.commonDialogErrorBig,
        iconWidth: 80.dp,
        iconHeight: 80.dp,
        title: localized('biometric_delete'),
        content: localized('delete_without_password'),
        rightBtnName: localized('go_settings'),
        onRightBtnPressed: () {
          Get.back<void>();
          Get.toNamed<dynamic>(Routes.setPassword.route, arguments: {
            'navigateToModifyPwd': false,
          });
        },
      ).showNoticeDialogWithTwoButtons();
    }
  }

  void rename() {
    GamingBottomSheet.show<void>(
      title: localized('rename_label'),
      fixedHeight: false,
      useCloseButton: false,
      builder: (p0) {
        return _BiometricRenameTextFieldView(
          value: data.deviceName,
          onSavePressed: (v) {
            controller.rename(data.id!, v);
          },
        );
      },
    );
  }
}
