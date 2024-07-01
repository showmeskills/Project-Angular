part of '../main_wallet_page.dart';

class _CurrencyItemView extends StatelessWidget with GamingOverlayMixin {
  _CurrencyItemView({
    required this.data,
    required this.onExpandPressed,
    required this.tag,
    this.hasDivider = true,
    required this.onBuyPressed,
    required this.onPressedClearNegative,
  });

  final GamingMainWalletCurrencyModel data;
  final bool hasDivider;

  final void Function(String) onExpandPressed;
  final void Function(String) onBuyPressed;
  final void Function(GamingMainWalletCurrencyModel) onPressedClearNegative;
  final String tag;

  MainWalletLogic get controller => Get.find<MainWalletLogic>(tag: tag);

  MainWalletState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => onExpandPressed(data.currency),
      child: Column(
        children: [
          if (hasDivider)
            Divider(
              indent: 16.dp,
              endIndent: 16.dp,
              color: GGColors.border.color,
              height: 1.dp,
              thickness: 1.dp,
            ),
          Container(
            padding: EdgeInsets.only(top: 16.dp, left: 16.dp),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Row(
                        children: [
                          GamingImage.network(
                            url: data.iconUrl,
                            width: 24.dp,
                            height: 24.dp,
                          ),
                          Gaps.hGap12,
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                data.currency,
                                style: GGTextStyle(
                                  fontSize: GGFontSize.content,
                                  color: GGColors.textMain.color,
                                  height: 1.2,
                                  fontWeight: GGFontWeigh.bold,
                                ),
                              ),
                              Gaps.vGap4,
                              Text(
                                data.currency,
                                style: GGTextStyle(
                                  fontSize: GGFontSize.hint,
                                  color: GGColors.textSecond.color,
                                  height: 1.2,
                                  fontWeight: GGFontWeigh.bold,
                                ),
                              ),
                            ],
                          ),
                          Expanded(
                            child: Text(
                              data.totalText,
                              style: GGTextStyle(
                                fontSize: GGFontSize.content,
                                color: GGColors.textMain.color,
                              ),
                              maxLines: 1,
                              textAlign: TextAlign.end,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      Obx(() => AnimatedContainer(
                            height: state.expanded == data.currency ? null : 0,
                            duration: const Duration(milliseconds: 300),
                            child: Column(
                              children: [
                                Gaps.vGap16,
                                Row(
                                  children: [
                                    Builder(builder: (context) {
                                      final text = Text(
                                        localized('in_order'),
                                        style: GGTextStyle(
                                          fontSize: GGFontSize.hint,
                                          color: GGColors.textSecond.color,
                                          decoration: TextDecoration.underline,
                                          decorationStyle:
                                              TextDecorationStyle.dashed,
                                          decorationThickness: 1.dp,
                                        ),
                                      );

                                      return GamingPopupLinkWidget(
                                        contentPadding: EdgeInsets.symmetric(
                                          horizontal: 16.dp,
                                          vertical: 10.dp,
                                        ),
                                        targetAnchor: Alignment.topLeft,
                                        followerAnchor: Alignment.bottomLeft,
                                        triangleInset: EdgeInsets.only(
                                          left: text.size.width / 2 - 5,
                                        ),
                                        popup: ConstrainedBox(
                                          constraints: BoxConstraints(
                                            maxWidth: 258.dp,
                                          ),
                                          child: Text(
                                            localized('lock_note'),
                                            style: GGTextStyle(
                                              fontSize: GGFontSize.content,
                                              color: GGColors
                                                  .textBlackOpposite.color,
                                            ),
                                          ),
                                        ),
                                        child: text,
                                      );
                                    }),
                                    const Spacer(),
                                    Text(
                                      data.freezeAmountText,
                                      style: GGTextStyle(
                                        fontSize: GGFontSize.hint,
                                        color: GGColors.textSecond.color,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                                Gaps.vGap8,
                                Row(
                                  children: [
                                    Text(
                                      localized('ava'),
                                      style: GGTextStyle(
                                        fontSize: GGFontSize.hint,
                                        color: GGColors.textSecond.color,
                                      ),
                                    ),
                                    const Spacer(),
                                    Text(
                                      data.canUseAmountText,
                                      style: GGTextStyle(
                                        fontSize: GGFontSize.hint,
                                        color: GGColors.textSecond.color,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          )),
                    ],
                  ),
                ),
                Gaps.hGap8,
                SizedBox(
                  height: GGFontSize.content.fontSize * 1.2 +
                      GGFontSize.hint.fontSize * 1.2 +
                      4.dp,
                  child: Row(
                    children: [
                      Container(
                        height: double.infinity,
                        padding: EdgeInsets.symmetric(horizontal: 8.dp),
                        child: Obx(() => AnimatedRotation(
                              turns: state.expanded == data.currency ? 0.5 : 1,
                              duration: const Duration(milliseconds: 300),
                              child: SvgPicture.asset(
                                R.iconDown,
                                width: 6.dp,
                                height: 6.dp,
                                color: GGColors.textSecond.color,
                              ),
                            )),
                      ),
                      Container(
                        height: double.infinity,
                        padding: EdgeInsets.only(right: 8.dp),
                        child: _buildMoreIcon(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Gaps.vGap16,
        ],
      ),
    );
  }

  Widget _buildMoreIcon() {
    return GamingPopupLinkWidget(
      overlay: overlay,
      contentPadding: EdgeInsets.zero,
      targetAnchor: Alignment.centerLeft,
      followerAnchor: Alignment.centerRight,
      offset: Offset(6.dp, 0),
      triangleSize: const Size(6, 10),
      usePenetrate: true,
      popup: Column(
        children: data.total < 0
            ? [
                _buildMenuItem(
                    title: localized('c_n_assets'),
                    isFirst: true,
                    onPressed: () => onPressedClearNegative(data)),
              ]
            : [
                _buildMenuItem(
                    title: localized('deposit'),
                    isFirst: true,
                    onPressed: () {
                      if (data.isDigital) {
                        DepositRouterUtil.goCryptoDeposit(data.currency);
                      } else {
                        DepositRouterUtil.goCurrencyDeposit(data.currency);
                      }
                    }),
                _buildMenuItem(
                  title: localized('withdraw'),
                  isLast: !data.isDigital,
                  onPressed: () {
                    if (data.isDigital) {
                      WithdrawRouterUtil.goCryptoWithdraw(data.currency);
                    } else {
                      WithdrawRouterUtil.goCurrencyWithdraw(data.currency);
                    }
                  },
                ),
                if (data.isDigital)
                  _buildMenuItem(
                    title: localized('buy'),
                    isLast: true,
                    onPressed: () {
                      onBuyPressed(data.currency);
                    },
                  ),
              ],
      ),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 8.dp, horizontal: 8.dp),
        child: SvgPicture.asset(
          R.iconMore,
          width: 16.dp,
          height: 16.dp,
          color: GGColors.textSecond.color,
        ),
      ),
    );
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
        child: Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textBlackOpposite.color,
          ),
        ),
      ),
    );
  }
}
