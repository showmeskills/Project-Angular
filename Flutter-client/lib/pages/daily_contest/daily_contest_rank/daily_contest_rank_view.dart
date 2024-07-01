import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:gogaming_app/pages/base/base_view.dart';

import '../../../R.dart';
import '../../../common/components/number_precision/number_precision.dart';
import '../../../common/service/currency/currency_service.dart';
import '../../../common/widgets/appbar/appbar.dart';
import '../../../common/widgets/gaming_close_button.dart';
import '../../../common/widgets/gaming_image/gaming_image.dart';
import 'daily_contest_rank_logic.dart';
import 'daily_contest_rank_state.dart';

class DailyContestRankPage extends BaseView<DailyContestRankLogic> {
  const DailyContestRankPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const DailyContestRankPage(),
    );
  }

  DailyContestRankState get state => Get.find<DailyContestRankLogic>().state;

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('my_rank_btn'),
      leadingIcon: const GamingCloseButton(),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(DailyContestRankLogic());
    return SingleChildScrollView(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 20.dp, horizontal: 16.dp),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Align(
              alignment: Alignment.center,
              child: Image.asset(
                R.commonDailyContestRankBack,
                height: 115.dp,
                width: 284.dp,
              ),
            ),
            Align(
              alignment: Alignment.center,
              child: Obx(() {
                return Text(
                  '${state.rankModel.value.title} - ${_periodString(state.rankModel.value.period)}',
                  style: GGTextStyle(
                    fontSize: GGFontSize.smallTitle,
                    color: GGColors.textMain.color,
                  ),
                );
              }),
            ),
            Gaps.vGap24,
            Align(
              alignment: Alignment.center,
              child: _countDownWidget(),
            ),
            Gaps.vGap24,
            Align(
              alignment: Alignment.center,
              child: Text(
                localized("rank_tips"),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                ),
                textAlign: TextAlign.justify,
              ),
            ),
            Gaps.vGap16,
            Text(
              localized("my_rank_btn"),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
            Gaps.vGap4,
            Container(
              width: double.infinity,
              height: 48.dp,
              decoration: BoxDecoration(
                color: GGColors.border.color,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.dp),
                child: Align(
                  alignment: Alignment.centerLeft,
                  child: Obx(() {
                    return Text(
                      (state.rankModel.value.bonusInfo?.isDataNull() ?? true)
                          ? localized("apply_rank")
                          : "${state.rankModel.value.bonusInfo?.rankNumber ?? 0}th",
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textMain.color,
                      ),
                    );
                  }),
                ),
              ),
            ),
            Gaps.vGap16,
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    localized("current_reward"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ),
                Gaps.hGap10,
                Expanded(
                  child: Text(
                    localized("current_bet"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                )
              ],
            ),
            Gaps.vGap4,
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Container(
                    width: double.infinity,
                    height: 48.dp,
                    decoration: BoxDecoration(
                      color: GGColors.border.color,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16.dp),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Obx(() {
                          return Row(
                            children: [
                              Expanded(
                                child: Text(
                                  (state.rankModel.value.bonusInfo
                                              ?.isDataNull() ??
                                          false)
                                      ? '0.00000000'
                                      : NumberPrecision(state.rankModel.value
                                                  .bonusInfo?.bonusUsdtMoney ??
                                              0)
                                          .balanceText(true),
                                  style: GGTextStyle(
                                    fontSize: GGFontSize.content,
                                    color: GGColors.textMain.color,
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: 14.dp,
                                height: 14.dp,
                                child: GamingImage.network(
                                  url: CurrencyService.sharedInstance
                                      .getIconUrl('USDT'),
                                ),
                              ),
                            ],
                          );
                        }),
                      ),
                    ),
                  ),
                ),
                Gaps.hGap10,
                Expanded(
                  child: Container(
                    width: double.infinity,
                    height: 48.dp,
                    decoration: BoxDecoration(
                      color: GGColors.border.color,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16.dp),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Obx(() {
                          return Row(
                            children: [
                              Expanded(
                                child: Text(
                                  (state.rankModel.value.bonusInfo
                                              ?.isDataNull() ??
                                          false)
                                      ? '0.00000000'
                                      : NumberPrecision(state.rankModel.value
                                                  .bonusInfo?.rankMoney ??
                                              0)
                                          .balanceText(true),
                                  style: GGTextStyle(
                                    fontSize: GGFontSize.content,
                                    color: GGColors.textMain.color,
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: 14.dp,
                                height: 14.dp,
                                child: GamingImage.network(
                                  url: CurrencyService.sharedInstance
                                      .getIconUrl('USDT'),
                                ),
                              ),
                            ],
                          );
                        }),
                      ),
                    ),
                  ),
                )
              ],
            ),
            Gaps.vGap16,
            Text.rich(
              TextSpan(
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textSecond.color,
                ),
                children: [
                  TextSpan(
                    text: '*',
                    style: GGTextStyle(
                      color: GGColors.error.color,
                      fontSize: GGFontSize.hint,
                    ),
                  ),
                  TextSpan(
                    text: localized("rank_hind"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.hint,
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _countDownWidget() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Obx(() {
          return _timeWidget(state.day.value, localized("day"));
        }),
        Gaps.hGap16,
        Obx(() {
          return _timeWidget(state.hours.value, localized("hour_unit"));
        }),
        Gaps.hGap16,
        Obx(() {
          return _timeWidget(state.minutes.value, localized("minu"));
        }),
        Gaps.hGap16,
        Obx(() {
          return _timeWidget(state.second.value, localized("second_unit"));
        }),
      ],
    );
  }

  Widget _timeWidget(String time, String unit) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          height: 50.dp,
          width: 50.dp,
          decoration: BoxDecoration(
            border: Border.all(
              color: GGColors.border.color,
              width: 1.dp,
            ),
          ),
          child: Center(
            child: Text(
              time,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            ),
          ),
        ),
        Gaps.vGap4,
        Text(
          unit,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        )
      ],
    );
  }

  String _periodString(String period) {
    if (period == "day") {
      return "24${localized("hour_unit")}";
    } else if (period == "week") {
      return localized("seven_day");
    } else if (period == "month") {
      return localized("one_month");
    } else if (period == "single") {
      return localized("single");
    }
    return "";
  }
}
