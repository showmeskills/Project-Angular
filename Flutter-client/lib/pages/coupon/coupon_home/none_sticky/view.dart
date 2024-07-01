import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:flutter/material.dart';
import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/pages/coupon/coupon_home/none_sticky/none_sticky_item/view.dart';

import '../../../../R.dart';
import '../../../../common/components/number_precision/number_precision.dart';
import '../../../../common/delegate/base_refresh_view_delegate.dart';
import '../../../../common/theme/colors/go_gaming_colors.dart';
import '../../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../../common/widgets/gaming_image/gaming_image.dart';
import '../../../../common/widgets/gaming_popup.dart';
import '../../../../common/widgets/gg_button.dart';
import '../../../../config/gaps.dart';
import 'act_none_sticky_item/view.dart';
import 'logic.dart';

class NoneStickyComponent extends StatelessWidget with BaseRefreshViewDelegate {
  NoneStickyComponent({Key? key}) : super(key: key);

  final logic = Get.put(NoneStickyLogic());
  final state = Get.find<NoneStickyLogic>().state;

  @override
  Widget build(BuildContext context) {
    return RefreshView(
      delegate: this,
      controller: logic,
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Gaps.vGap16,
            _buildTop(),
            Gaps.vGap22,
            _buildActList(),
            _buildUnactList(),
          ],
        ),
      ),
    );
  }

  Widget _buildActList() {
    return Obx(() {
      if ((state.activatedModel.value.casinoBonus?.code?.isEmpty ?? true) &&
          (state.activatedModel.value.liveCasinoBonus?.code?.isEmpty ?? true)) {
        return Gaps.empty;
      }
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            localized('active_rewards'),
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.bold,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap22,
          if (state.activatedModel.value.casinoBonus?.code?.isNotEmpty ?? false)
            _buildActCasino(),
          if (state.activatedModel.value.liveCasinoBonus?.code?.isNotEmpty ??
              false)
            _buildActLiveCasino(),
          Gaps.vGap22,
        ],
      );
    });
  }

  Widget _buildActCasino() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('cas'),
          style: GGTextStyle(
            fontSize: GGFontSize.smallTitle,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap10,
        ActNoneStickyItem(
          item: state.activatedModel.value.casinoBonus!,
          isCasino: true,
        ),
        Gaps.vGap10,
      ],
    );
  }

  Widget _buildActLiveCasino() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('live_cas'),
          style: GGTextStyle(
            fontSize: GGFontSize.smallTitle,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap10,
        ActNoneStickyItem(
          item: state.activatedModel.value.liveCasinoBonus!,
          isCasino: false,
        ),
        Gaps.vGap10,
      ],
    );
  }

  Widget _buildUnactList() {
    return Obx(() {
      if ((state.unactivatedModel.value.casinoBonusList?.isEmpty ?? true) &&
          (state.unactivatedModel.value.liveCasinoBonusList?.isEmpty ?? true)) {
        return Gaps.empty;
      }
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            localized('eligible_rewards'),
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.bold,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap22,
          if (state.unactivatedModel.value.casinoBonusList?.isNotEmpty ?? false)
            _buildUnactCasino(),
          if (state.unactivatedModel.value.liveCasinoBonusList?.isNotEmpty ??
              false)
            _buildUnactLiveCasino(),
          Gaps.vGap22,
        ],
      );
    });
  }

  Widget _buildUnactCasino() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('cas'),
          style: GGTextStyle(
            fontSize: GGFontSize.smallTitle,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap10,
        _buildCasinoBonusList(),
      ],
    );
  }

  Widget _buildCasinoBonusList() {
    return Obx(() {
      if (state.unactivatedModel.value.casinoBonusList?.isNotEmpty ?? false) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: state.unactivatedModel.value.casinoBonusList?.map((e) {
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    NoneStickyItem(
                      item: e,
                      isCasino: true,
                    ),
                    Gaps.vGap10,
                  ],
                );
              }).toList() ??
              [],
        );
      }
      return Container();
    });
  }

  Widget _buildUnactLiveCasino() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('live_cas'),
          style: GGTextStyle(
            fontSize: GGFontSize.smallTitle,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap10,
        _buildLiveCasinoBonusList(),
      ],
    );
  }

  Widget _buildLiveCasinoBonusList() {
    return Obx(() {
      if (state.unactivatedModel.value.liveCasinoBonusList?.isNotEmpty ??
          false) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: state.unactivatedModel.value.liveCasinoBonusList?.map((e) {
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    NoneStickyItem(
                      item: e,
                      isCasino: false,
                    ),
                    Gaps.vGap10,
                  ],
                );
              }).toList() ??
              [],
        );
      }
      return Container();
    });
  }

  Widget _buildTop() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 12.dp),
      width: double.infinity,
      decoration: BoxDecoration(
        color: GGColors.background.color,
        borderRadius: BorderRadius.all(
          Radius.circular(16.dp),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GamingImage.asset(
            R.couponNoneSticky,
            height: 58.dp,
          ),
          Gaps.vGap8,
          Row(
            children: [
              Expanded(child: _topLeft()),
              Expanded(child: _topRight()),
            ],
          ),
          _buildButtons(),
        ],
      ),
    );
  }

  Widget _topRight() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('casino_bonus'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.vGap8,
        Obx(
          () => Text(
            '${NumberPrecision(state.walletOverview.value.casinoBonus).balanceText(true).stripTrailingZeros()} USDT',
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
        ),
        Gaps.vGap20,
        Text(
          localized('lock_bonus'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.vGap8,
        Obx(
          () => Text(
            '${NumberPrecision(state.walletOverview.value.lockedBonus).balanceText(true).stripTrailingZeros()} USDT',
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
        ),
        Gaps.vGap10,
      ],
    );
  }

  Widget _buildButtons() {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: _showExchange,
            child: Container(
              height: 40.dp,
              decoration: BoxDecoration(
                color: Colors.transparent,
                border: Border.all(
                  color: GGColors.border.color,
                  width: 1.dp,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: EdgeInsets.only(bottom: 4.dp),
                    child: Image.asset(
                      R.couponCouponCodeIcon,
                      height: 14.dp,
                    ),
                  ),
                  Gaps.hGap10,
                  Text(
                    localized("coupon_code"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
        Gaps.hGap20,
        Expanded(
          child: Obx(() {
            return GGButton(
              enable: (state.walletOverview.value.cashableBonus ?? 0) > 0,
              backgroundColor: GGColors.pinkBtnBg.color,
              height: 40.dp,
              onPressed: () {
                logic.onReceiveAllSticky();
              },
              text: localized('accept_all_prizes'),
            );
          }),
        ),
      ],
    );
  }

  Widget _topLeft() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              localized('cashable_bonus'),
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.textMain.color,
              ),
            ),
            Gaps.hGap4,
            Obx(() {
              if (state.walletOverview.value.cashableBonusInfos?.isNotEmpty ??
                  false) {
                return GamingPopupLinkWidget(
                  followerAnchor: Alignment.bottomCenter,
                  targetAnchor: Alignment.topRight,
                  popup: _buildTip(),
                  child: GamingImage.asset(
                    R.iconTipIcon,
                    width: 14.dp,
                    height: 14.dp,
                    color: GGColors.textSecond.color,
                  ),
                );
              }
              return Container();
            }),
          ],
        ),
        Gaps.vGap8,
        Obx(
          () => Text(
            '${NumberPrecision(state.walletOverview.value.cashableBonus).balanceText(true).stripTrailingZeros()} USDT',
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.pinkBtnBg.color,
            ),
          ),
        ),
        Gaps.vGap20,
        Text(
          localized('live_casino_bonus'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.vGap8,
        Obx(
          () => Text(
            '${NumberPrecision(state.walletOverview.value.liveCasinoBonus).balanceText(true).stripTrailingZeros()} USDT',
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
        ),
        Gaps.vGap10,
      ],
    );
  }

  Widget _buildTip() {
    return Column(
      children: state.walletOverview.value.cashableBonusInfos?.map((e) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Text(
                      '${e.currency}:',
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textBlackOpposite.color,
                      ),
                    ),
                    Gaps.hGap4,
                    Text(
                      NumberPrecision(e.amount)
                          .balanceText(true)
                          .stripTrailingZeros(),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textBlackOpposite.color,
                      ),
                    ),
                  ],
                ),
                Gaps.vGap4,
              ],
            );
          }).toList() ??
          [],
    );
  }

  @override
  RefreshViewController get renderController => logic.controller;

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return null;
  }

  @override
  Widget? getLoadingWidget(BuildContext context) {
    return null;
  }

  @override
  Widget getNoMoreWidget(BuildContext context) {
    return Gaps.empty;
  }
}

extension _Action on NoneStickyComponent {
  void _showExchange() {
    logic.onExchange();
  }
}
