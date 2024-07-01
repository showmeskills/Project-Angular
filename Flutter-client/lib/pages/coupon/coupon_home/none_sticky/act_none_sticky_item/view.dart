import 'package:base_framework/base_framework.dart';
import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/coupon/coupon_home/none_sticky/act_none_sticky_item/none_sticky_progress.dart';

import '../../../../../R.dart';
import '../../../../../common/api/nonsticky/models/gaming_nonsticky_list_model.dart';
import '../../../../../common/components/number_precision/number_precision.dart';
import '../../../../../common/theme/colors/go_gaming_colors.dart';
import '../../../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../../../config/gaps.dart';
import '../../../../../helper/time_helper.dart';
import 'logic.dart';

class ActNoneStickyItem extends StatelessWidget {
  const ActNoneStickyItem(
      {Key? key, required this.item, required this.isCasino})
      : super(key: key);

  final NonstickyItem item;
  final bool isCasino;

  ActNonestickyItemLogic get logic =>
      Get.find<ActNonestickyItemLogic>(tag: item.code ?? '');

  @override
  Widget build(BuildContext context) {
    Get.put(ActNonestickyItemLogic(item: item), tag: item.code ?? '');
    return SizedBox(
      width: Get.width - 32.dp,
      height: (Get.width - 32.dp) * 1.25,
      child: Stack(
        children: [
          Positioned.fill(
            child: _buildBack(),
          ),
          Positioned(
            top: 20.dp,
            bottom: 20.dp,
            right: 20.dp,
            left: 20.dp,
            child: Obx(() {
              return Visibility(
                visible: !logic.showDetail.value,
                child: _buildContent(),
              );
            }),
          ),
          Positioned(
            top: 20.dp,
            bottom: 20.dp,
            right: 20.dp,
            left: 20.dp,
            child: Obx(() {
              return Visibility(
                visible: logic.showDetail.value,
                child: _buildDetail(),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    String format = "yyyy-MM-dd HH:mm:ss";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(item.expires ?? 0);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                isCasino ? localized('cas') : localized('live_cas'),
                style: GGTextStyle(
                  fontSize: GGFontSize.smallTitle,
                  fontWeight: GGFontWeigh.bold,
                  color: GGColors.buttonTextWhite.color,
                ),
              ),
            ),
            GestureDetectorHitTestWithoutSizeLimit(
              behavior: HitTestBehavior.opaque,
              extraHitTestArea: EdgeInsets.all(10.dp),
              onTap: () {
                openDetail();
              },
              child: GamingImage.asset(
                R.iconTipIcon,
                color: GGColors.buttonTextWhite.color,
                width: 14.dp,
                height: 14.dp,
              ),
            ),
          ],
        ),
        _buildCenterImage(),
        Gaps.vGap10,
        Text(
          item.name ?? '',
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle,
            fontWeight: GGFontWeigh.bold,
            color: GGColors.buttonTextWhite.color,
          ),
        ),
        Gaps.vGap12,
        NonestickyProgress(
          isCasino: isCasino,
          progress:
              (item.currentBetTurnover ?? 0) / (item.targetBetTurnover ?? 1) > 1
                  ? 1
                  : (item.currentBetTurnover ?? 0) /
                      (item.targetBetTurnover ?? 1),
        ),
        Gaps.vGap12,
        Row(
          children: [
            Text(
              localized('left_to_wallet'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.couponYellow.color,
              ),
            ),
            Expanded(
              child: Text(
                "${logic.leftToWallet()} ${item.currency}",
                textAlign: TextAlign.end,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.couponYellow.color,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
            ),
          ],
        ),
        Gaps.vGap6,
        Row(
          children: [
            Text(
              localized('max_bet_per_line'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.couponYellow.color,
              ),
            ),
            Expanded(
              child: Text(
                '${NumberPrecision(item.maxBetPerSpin).balanceText(true).stripTrailingZeros()} USDT',
                textAlign: TextAlign.end,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.couponYellow.color,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
            ),
          ],
        ),
        Gaps.vGap6,
        Row(
          children: [
            Text(
              localized('expires'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.couponYellow.color,
              ),
            ),
            Expanded(
              child: Text(
                (item.expires ?? 0) == 0
                    ? localized("no_expiration")
                    : DateFormat(format).format(aTime).toString(),
                textAlign: TextAlign.end,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.couponYellow.color,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
            ),
          ],
        ),
        const Spacer(),
        SizedBox(
          width: double.infinity,
          child: GGButton.main(
            onPressed: () {
              logic.buttonClick();
            },
            text: logic.receivedBonus()
                ? localized('receive_bonus')
                : localized("whe_g_g"),
          ),
        )
      ],
    );
  }

  Widget _buildCenterImage() {
    if (item.typeCode == 'Turntable') {
      return GamingImage.asset(
        R.couponTurnTable,
        width: 143.dp,
        height: 143.dp,
      );
    } else if (item.typeCode == null || item.typeCode == 'slot') {
      return GamingImage.asset(
        R.couponDefalutBg,
        width: 143.dp,
        height: 143.dp,
      );
    } else if (item.typeCode == 'Deposit') {
      return GamingImage.asset(
        R.couponDepoitse,
        width: 143.dp,
        height: 143.dp,
      );
    } else if (item.typeCode == 'CouponCodeDeposit') {
      return GamingImage.asset(
        R.couponCodeDeposit,
        width: 143.dp,
        height: 143.dp,
      );
    } else if (item.typeCode == 'VipSignIn') {
      return GamingImage.asset(
        R.couponSignIn,
        width: 143.dp,
        height: 143.dp,
      );
    }
    return GamingImage.asset(
      R.couponNewUser,
      width: 143.dp,
      height: 143.dp,
    );
  }

  Widget _buildDetail() {
    String format = "yyyy-MM-dd HH:mm:ss";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(item.expires ?? 0);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                isCasino ? localized('cas') : localized('live_cas'),
                style: GGTextStyle(
                  fontSize: GGFontSize.smallTitle,
                  fontWeight: GGFontWeigh.bold,
                  color: GGColors.buttonTextWhite.color,
                ),
              ),
            ),
            GestureDetectorHitTestWithoutSizeLimit(
              behavior: HitTestBehavior.opaque,
              extraHitTestArea: EdgeInsets.all(10.dp),
              onTap: () {
                closeDetail();
              },
              child: GamingImage.asset(
                R.iconClose,
                color: GGColors.buttonTextWhite.color,
                width: 14.dp,
                height: 14.dp,
              ),
            ),
          ],
        ),
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Gaps.vGap12,
                Row(
                  children: [
                    Text(
                      localized("bet_requirement"),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.couponYellow.color,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        '${item.currentBetNum}/${item.targetBetNum} ${localized('times_for_none')}',
                        textAlign: TextAlign.end,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.couponYellow.color,
                          fontWeight: GGFontWeigh.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                Gaps.vGap12,
                Text(
                  item.name ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.bigTitle,
                    color: GGColors.buttonTextWhite.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
                Gaps.vGap12,
                Row(
                  children: [
                    Text(
                      localized('left_to_wallet'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.couponYellow.color,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        "${logic.leftToWallet()} ${item.currency}",
                        textAlign: TextAlign.end,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.couponYellow.color,
                          fontWeight: GGFontWeigh.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                Gaps.vGap6,
                Row(
                  children: [
                    Text(
                      localized('max_bet_per_line'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.couponYellow.color,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        '${NumberPrecision(item.maxBetPerSpin).balanceText(true).stripTrailingZeros()} USDT',
                        textAlign: TextAlign.end,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.couponYellow.color,
                          fontWeight: GGFontWeigh.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                Gaps.vGap6,
                Row(
                  children: [
                    Text(
                      localized('expires'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.couponYellow.color,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        (item.expires ?? 0) == 0
                            ? localized("no_expiration")
                            : DateFormat(format).format(aTime).toString(),
                        textAlign: TextAlign.end,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.couponYellow.color,
                          fontWeight: GGFontWeigh.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                Gaps.vGap12,
                Text(
                  localized('terms'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.smallTitle,
                    color: GGColors.buttonTextWhite.color,
                  ),
                ),
                Gaps.vGap6,
                Obx(() {
                  return Text(
                    logic.detailContent.value,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.buttonTextWhite.color,
                    ),
                  );
                }),
              ],
            ),
          ),
        ),
        Gaps.vGap20,
        SizedBox(
          width: double.infinity,
          child: GGButton.main(
            backgroundColor: GGColors.error.color,
            onPressed: () {
              if (logic.receivedBonus()) {
                logic.buttonClick();
              } else {
                logic.giveUp();
              }
            },
            text: logic.receivedBonus()
                ? localized("receive_bonus")
                : localized("give_up_1"),
          ),
        )
      ],
    );
  }

  Widget _buildBack() {
    return GamingImage.asset(
      isCasino ? R.couponCasBack : R.couponLiveCasBack,
      fit: BoxFit.cover,
      radius: 10.dp,
    );
  }
}

extension _Action on ActNoneStickyItem {
  void openDetail() {
    logic.openDetail();
  }

  void closeDetail() {
    logic.closeDetail();
  }
}
