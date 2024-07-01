import 'package:base_framework/base_framework.dart';
import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';

import '../../../../../R.dart';
import '../../../../../common/api/nonsticky/models/gaming_nonsticky_list_model.dart';
import '../../../../../common/components/number_precision/number_precision.dart';
import '../../../../../common/service/currency/currency_service.dart';
import '../../../../../common/theme/colors/go_gaming_colors.dart';
import '../../../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../../../config/gaps.dart';
import 'logic.dart';

class NoneStickyItem extends StatelessWidget {
  const NoneStickyItem({Key? key, required this.item, required this.isCasino})
      : super(key: key);

  final NonstickyItem item;
  final bool isCasino;

  NonestickyItemLogic get logic =>
      Get.find<NonestickyItemLogic>(tag: '${item.code}${item.name}');

  @override
  Widget build(BuildContext context) {
    Get.put(NonestickyItemLogic(item: item, isCasino: isCasino),
        tag: '${item.code}${item.name}');
    return SizedBox(
      width: Get.width - 32.dp,
      height: (Get.width - 32.dp) * 1.1,
      child: Stack(
        children: [
          Positioned.fill(
            child: _buildBack(),
          ),
          Positioned(
            top: 0.dp,
            right: 0.dp,
            child: _waitingWidget(),
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

  Widget _waitingWidget() {
    if (item.isFreeSpin ?? false) {
      return Gaps.empty;
    }
    return Visibility(
      visible: !(item.isDeposit ?? false),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 2.dp),
        decoration: BoxDecoration(
          color: const Color(0xFF00BD1E),
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(10.dp),
            topRight: Radius.circular(10.dp),
          ),
        ),
        child: Center(
          child: Text(
            localized('none_sticky_waiting'),
            style: GGTextStyle(
              color: GGColors.buttonTextWhite.color,
              fontSize: GGFontSize.hint,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (item.isFreeSpin ?? false) {
      return _buildFreeSpinContent();
    }
    return _buildNonStickyContent();
  }

  Widget _buildDetail() {
    if (item.isFreeSpin ?? false) {
      return _buildFreeSpinDetail();
    }
    return _buildNonStickyDetail();
  }

  Widget _buildFreeSpinContent() {
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
        _buildCenterNetImage(),
        Gaps.vGap6,
        Text(
          item.name ?? '',
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle,
            fontWeight: GGFontWeigh.bold,
            color: GGColors.buttonTextWhite.color,
          ),
        ),
        Gaps.vGap6,
        Row(
          children: [
            Text(
              (item.isDeposit ?? false)
                  ? localized('mini_deposit')
                  : localized("bet_total"),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.couponYellow.color,
              ),
            ),
            Expanded(
              child: Text(
                (item.isDeposit ?? false)
                    ? "${NumberPrecision(item.minimumDeposit).balanceText(true).stripTrailingZeros()} USDT"
                    : (item.currentSpinNum ?? 0) > 0
                        ? "${item.currentSpinNum}/${item.maxSpinNum}"
                        : "${item.maxSpinNum}",
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
              localized('bet_price'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.couponYellow.color,
              ),
            ),
            Expanded(
              child: Text(
                "${NumberPrecision(item.amount).balanceText(CurrencyService.sharedInstance.isDigital(item.currency ?? '')).stripTrailingZeros()} ${item.currency}",
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
        _buildMaxBonusAmount(),
        const Spacer(),
        SizedBox(
          width: double.infinity,
          child: GGButton.main(
            onPressed: () {
              logic.freeSpinButtonClick();
            },
            backgroundColor: _freeSpinButtonColor(),
            text: _freeSpinButtonTitle(),
            radius: 48.dp,
          ),
        )
      ],
    );
  }

  Widget _buildMaxBonusAmount() {
    if ((item.maxBonusAmount ?? 0) != 0) {
      return Padding(
        padding: EdgeInsets.only(top: 6.dp),
        child: Row(
          children: [
            Text(
              localized('bonus_cap'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.couponYellow.color,
              ),
            ),
            Expanded(
              child: Text(
                "${NumberPrecision(item.maxBonusAmount).balanceText(CurrencyService.sharedInstance.isDigital(item.currency ?? '')).stripTrailingZeros()} ${item.currency}",
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
      );
    }
    return Container();
  }

  Widget _buildNonStickyContent() {
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
        Gaps.vGap6,
        Text(
          item.name ?? '',
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle,
            fontWeight: GGFontWeigh.bold,
            color: GGColors.buttonTextWhite.color,
          ),
        ),
        Gaps.vGap6,
        Row(
          children: [
            Text(
              (item.isDeposit ?? false)
                  ? localized('mini_deposit')
                  : localized("none_bonus"),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.couponYellow.color,
              ),
            ),
            Expanded(
              child: Text(
                (item.isDeposit ?? false)
                    ? "${NumberPrecision(item.minimumDeposit).balanceText(true).stripTrailingZeros()} USDT"
                    : "${NumberPrecision(item.amount).balanceText(CurrencyService.sharedInstance.isDigital(item.currency ?? '')).stripTrailingZeros()} ${item.currency}",
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
              localized('wager_requirement'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.couponYellow.color,
              ),
            ),
            Expanded(
              child: Text(
                '${item.betMultiple.toString().stripTrailingZeros()}X',
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
            backgroundColor: _unlockButtonColor(),
            text: _unlockButtonTitle(),
            radius: 48.dp,
          ),
        )
      ],
    );
  }

  Color? _freeSpinButtonColor() {
    if (logic.isVerifyStatus) {
      return (item.isDeposit ?? false) ? null : const Color(0xFF438DFB);
    }
    return (item.isDeposit ?? false)
        ? GGColors.successText.color
        : const Color(0xFF438DFB);
  }

  Color? _unlockButtonColor() {
    if (logic.isVerifyStatus) {
      return (item.isDeposit ?? false) ? null : const Color(0xFF438DFB);
    }
    return (item.isDeposit ?? false)
        ? GGColors.successText.color
        : const Color(0xFF438DFB);
  }

  String _freeSpinButtonTitle() {
    if (!logic.isVerifyStatus && (item.isDeposit ?? false)) {
      return localized('verify_and_unlock');
    }
    return (item.isDeposit ?? false)
        ? localized('recharge')
        : localized("go_game");
  }

  String _unlockButtonTitle() {
    if (!logic.isVerifyStatus && (item.isDeposit ?? false)) {
      return localized('verify_and_unlock');
    }
    return (item.isDeposit ?? false)
        ? localized('recharge')
        : localized("active_now");
  }

  Widget _buildCenterNetImage() {
    return GamingImage.network(
      url: item.freeSpinImage,
      width: 143.dp,
      height: 143.dp,
      fit: BoxFit.cover,
      alignment: Alignment.bottomCenter,
      radius: 143.dp,
      errorBuilder: (context, error, stack) {
        return Image.asset(
          AppLocalizations.of(Get.context!).locale.languageCode.contains('zh')
              ? R.gameGameCoverCh
              : R.gameGameCoverEn,
          fit: BoxFit.cover,
          width: 143.dp,
          height: 143.dp,
        );
      },
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
    } else if (item.typeCode == 'Deposit' && item.isDeposit == false) {
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

  Widget _buildFreeSpinDetail() {
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
        Gaps.vGap12,
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
                      localized("bet_total"),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.couponYellow.color,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        (item.currentSpinNum ?? 0) > 0
                            ? "${item.currentSpinNum}/${item.maxSpinNum}"
                            : "${item.maxSpinNum}",
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
                Row(
                  children: [
                    Text(
                      (item.isDeposit ?? false)
                          ? localized('mini_deposit')
                          : localized("bet_bonus"),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.couponYellow.color,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        (item.isDeposit ?? false)
                            ? "${NumberPrecision(item.minimumDeposit).balanceText(true).stripTrailingZeros()} USDT"
                            : "${NumberPrecision(item.balance).balanceText(CurrencyService.sharedInstance.isDigital(item.currency ?? '')).stripTrailingZeros()} ${item.currency}",
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
                Row(
                  children: [
                    Text(
                      localized('bet_price'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.couponYellow.color,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        "${NumberPrecision(item.amount).balanceText(CurrencyService.sharedInstance.isDigital(item.currency ?? '')).stripTrailingZeros()} ${item.currency}",
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
                if ((item.maxBonusAmount ?? 0) != 0)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Gaps.vGap12,
                      Row(
                        children: [
                          Text(
                            localized('bonus_cap'),
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.couponYellow.color,
                            ),
                          ),
                          Expanded(
                            child: Text(
                              "${NumberPrecision(item.maxBonusAmount).balanceText(CurrencyService.sharedInstance.isDigital(item.currency ?? '')).stripTrailingZeros()} ${item.currency}",
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
                    ],
                  ),
                Gaps.vGap12,
                Text(
                  item.gameName ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.bigTitle,
                    color: GGColors.buttonTextWhite.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
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
            onPressed: () {
              logic.freeSpinButtonClick();
            },
            text: _freeSpinButtonTitle(),
            backgroundColor: _freeSpinButtonColor(),
            radius: 48.dp,
          ),
        )
      ],
    );
  }

  Widget _buildNonStickyDetail() {
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
        Gaps.vGap12,
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.bigTitle,
                    color: GGColors.buttonTextWhite.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
                Gaps.vGap12,
                Visibility(
                  visible: item.isDeposit ?? false,
                  child: _returnRatio(),
                ),
                Row(
                  children: [
                    Text(
                      (item.isDeposit ?? false)
                          ? localized('mini_deposit')
                          : localized("none_bonus"),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.couponYellow.color,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        (item.isDeposit ?? false)
                            ? "${NumberPrecision(item.minimumDeposit).balanceText(true).stripTrailingZeros()} USDT"
                            : "${NumberPrecision(item.amount).balanceText(CurrencyService.sharedInstance.isDigital(item.currency ?? '')).stripTrailingZeros()} ${item.currency}",
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
                      localized('wager_requirement'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.couponYellow.color,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        '${item.betMultiple.toString().stripTrailingZeros()}X',
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
                      localized('after_activated'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.couponYellow.color,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        (item.durationDaysAfterActivation ?? 0) == 0
                            ? localized('no_expiration')
                            : '${item.durationDaysAfterActivation}${localized('days')}',
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
            onPressed: () {
              logic.buttonClick();
            },
            text: _unlockButtonTitle(),
            backgroundColor:
                (!logic.isVerifyStatus && (item.isDeposit ?? false))
                    ? GGColors.successText.color
                    : null,
            radius: 48.dp,
          ),
        )
      ],
    );
  }

  Widget _returnRatio() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Text(
              localized("return_ratio"),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.couponYellow.color,
              ),
            ),
            Expanded(
              child: Text(
                "${item.rate.toString().stripTrailingZeros()}%",
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

extension _Action on NoneStickyItem {
  void openDetail() {
    logic.openDetail();
  }

  void closeDetail() {
    logic.closeDetail();
  }
}
