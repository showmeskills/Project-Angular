part of '../main_wallet_page.dart';

class _HideSmallAssetButton extends StatelessWidget {
  const _HideSmallAssetButton({
    required this.tag,
    required this.onChanged,
  });
  final String tag;
  final void Function() onChanged;

  MainWalletLogic get controller => Get.find<MainWalletLogic>(tag: tag);

  MainWalletState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onChanged,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Obx(() => GamingCheckBox(
                value: state.hideSmallAsset,
                onChanged: (v) {
                  onChanged();
                },
              )),
          Gaps.hGap10,
          Text(
            localized('hide_small_bal'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
              decoration: TextDecoration.underline,
              decorationStyle: TextDecorationStyle.dashed,
              decorationThickness: 1.dp,
            ),
          ),
        ],
      ),
    );
  }
}
