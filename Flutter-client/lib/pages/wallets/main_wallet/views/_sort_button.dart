part of '../main_wallet_page.dart';

class _SortButton extends StatelessWidget {
  const _SortButton({
    required this.data,
    this.selectedSort,
  });
  final MainWalletCurrencySortType data;
  final MainWalletCurrencySort? selectedSort;

  @override
  Widget build(BuildContext context) {
    final bool seleted = selectedSort?.type == data;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 6.dp,
        vertical: 10.dp,
      ),
      child: Row(
        children: [
          Container(
            constraints: BoxConstraints(maxWidth: 80.dp),
            child: Text(
              data.title,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: seleted
                    ? GGColors.highlightButton.color
                    : GGColors.textSecond.color,
              ),
              maxLines: 2,
            ),
          ),
          Gaps.hGap6,
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SvgPicture.asset(
                R.iconSortAscending,
                width: 6.dp,
                height: 5.dp,
                color: seleted &&
                        selectedSort?.order ==
                            MainWalletCurrencySortOrder.ascending
                    ? GGColors.highlightButton.color
                    : GGColors.textSecond.color,
              ),
              Gaps.vGap2,
              SvgPicture.asset(
                R.iconSortDescending,
                width: 6.dp,
                height: 5.dp,
                color: seleted &&
                        selectedSort?.order ==
                            MainWalletCurrencySortOrder.descending
                    ? GGColors.highlightButton.color
                    : GGColors.textSecond.color,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
