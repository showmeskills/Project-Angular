import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/game_order/models/betinfo/real_time_bet_info_model.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../R.dart';
import '../../../common/components/number_precision/number_precision.dart';
import '../../../common/service/currency/currency_service.dart';
import '../../../common/widgets/gaming_image/gaming_image.dart';
import '../../../common/widgets/gaming_popup.dart';
import '../../../common/widgets/go_gaming_empty.dart';
import 'game_stats_logic.dart';

class GameStatsView extends StatelessWidget {
  const GameStatsView({super.key, this.gameCategory});

  /// 游戏场景 null是所有  SportsBook体育 Esports电子竞技 Lottery彩票 LiveCasino真人娱乐 SlotGame电子游戏 Chess棋牌
  final List<String>? gameCategory;

  GameStatsLogic get controller => Get.find<GameStatsLogic>(tag: tag);

  GameStatsState get state => controller.state;
  GameStatsState? get safeState =>
      Get.findOrNull<GameStatsLogic>(tag: tag)?.state;

  String? get tag => gameCategory?.join('-');

  @override
  Widget build(BuildContext context) {
    Get.put(GameStatsLogic(gameCategory: gameCategory), tag: tag);
    return Container(
      margin: EdgeInsets.only(top: 22.dp, left: 12.dp, right: 12.dp),
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSelectHeader(),
          _buildRankWidgets(),
        ],
      ),
    );
  }

  Widget _buildRankWidgets() {
    return Obx(() {
      var bettingTitle = controller.state.bettingTitle.value;
      if (bettingTitle == "race_text") {
        return _buildContest();
      }
      if (bettingTitle == "my_bet" ||
          bettingTitle == "all_bet" ||
          bettingTitle == "windy_list" ||
          bettingTitle == "luckiest") {
        return controller.obx(
          (_) {
            if (safeState == null) {
              return Container();
            }
            if (bettingTitle == "my_bet") {
              return _buildMyBettingList(state.currentBet);
            } else if (bettingTitle == "all_bet") {
              return _buildAllBettingList(state.currentBet);
            } else if (bettingTitle == "windy_list") {
              return _buildHeroList(state.currentBet);
            } else if (bettingTitle == "luckiest") {
              return _buildLuckyestRankList(state.currentBet);
            } else {
              return Container();
            }
          },
          onEmpty: SizedBox(
            height: 210.dp,
            width: double.infinity,
            child: const GoGamingEmpty(),
          ),
          onLoading: SizedBox(
            height: 210.dp,
            width: double.infinity,
            child: const GoGamingLoading(),
          ),
        );
      }
      return Container();
    });
  }

  Widget _buildLuckyestRankList(List<RealTimeBetInfoModel> currentBet) {
    return Padding(
      padding: EdgeInsets.only(top: 4.dp),
      child: SizedBox(
        height: 50.dp * (currentBet.length + 1),
        width: double.infinity,
        child: LayoutBuilder(
          builder: (context, constraints) {
            final rowWidth = constraints.maxWidth;
            final totalWidth = rowWidth;
            return SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: SizedBox(
                width: totalWidth,
                child: ListView(
                  scrollDirection: Axis.vertical,
                  // padding: EdgeInsets.only(left: 8.dp, right: 8.dp),
                  physics: const NeverScrollableScrollPhysics(),
                  shrinkWrap: true,
                  children: [
                    _buidScrollRow(rowWidth: totalWidth, [
                      Expanded(
                        flex: 8,
                        child: _buildTitleWidget(
                          localized("game"),
                          end: 0.dp,
                        ),
                      ),
                      SizedBox(
                        width: 100.dp,
                        child: _buildTitleWidget(
                          localized("odds"),
                          start: 0.dp,
                          textAlign: TextAlign.end,
                        ),
                      ),
                    ]),
                    ...currentBet.asMap().entries.map(
                          (entry) => _luckestCell(
                            totalWidth,
                            entry.key,
                            entry.value.gameNameText,
                            entry.value.payAmountText(),
                            entry.value.payAmountText(auto: false),
                            entry.value.dateTimeShortText,
                            entry.value.oddsText,
                            entry.value.currency,
                          ),
                        ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buidScrollRow(List<Widget> childrenWidgets,
      {double height = 50.0,
      Color? backgroundColor,
      required double rowWidth}) {
    return Container(
      color: backgroundColor ?? Colors.transparent,
      height: height,
      width: rowWidth,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          SizedBox(
            width: rowWidth,
            child: Row(
              children: childrenWidgets,
            ),
          ),
        ],
      ),
    );
  }

  Widget _luckestCell(double rowWidth, int index, String gameName, String money,
      String rawMoney, String time, String odds, String? currency) {
    return _buidScrollRow(
      rowWidth: rowWidth,
      [
        Expanded(
          flex: 8,
          child: _buildTitleWidget(
            gameName,
            end: 0.dp,
            textColor: GGColors.textMain.color,
            showPopup: true,
          ),
        ),
        SizedBox(
          width: 100.dp,
          child: _buildTitleWidget(
            odds,
            start: 0.dp,
            textAlign: TextAlign.end,
          ),
        ),
      ],
      backgroundColor: index % 2 == 0
          ? Colors.transparent
          : GGColors.border.color.withOpacity(0.5),
    );
  }

  Widget _buildHeroList(List<RealTimeBetInfoModel> currentBet) {
    return Padding(
      padding: EdgeInsets.only(top: 4.dp),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildFixedSpaceWidget([
            _buildTitleWidget(
              localized("game"),
              end: 0.dp,
            ),
            _buildTitleWidget(
              localized("betting_money"),
              start: 0.dp,
              textAlign: TextAlign.right,
            ),
          ]),
          ...currentBet.asMap().entries.map(
                (entry) => _betingListItem(
                  entry.key,
                  entry.value.gameNameText,
                  entry.value.betAmountText(),
                  entry.value.betAmountText(auto: false),
                  entry.value.currency,
                ),
              ),
        ],
      ),
    );
  }

  Widget _buildAllBettingList(List<RealTimeBetInfoModel> currentBet) {
    return Padding(
      padding: EdgeInsets.only(top: 4.dp),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildFixedSpaceWidget([
            _buildTitleWidget(
              localized("game"),
              end: 0.dp,
            ),
            _buildTitleWidget(
              localized("pay_amount"),
              start: 0.dp,
              textAlign: TextAlign.right,
            ),
          ]),
          ...currentBet.asMap().entries.map((entry) => _betingListItem(
                entry.key,
                entry.value.gameNameText,
                entry.value.payAmountText(),
                entry.value.payAmountText(auto: false),
                entry.value.currency,
              ))
          // SizedBox(
          //   height: 50.dp * min(10, currentBet.length),
          //   width: double.infinity,
          //   child: AnimatedList(
          //     key: state.globalKey,
          //     initialItemCount: currentBet.length,
          //     physics: const NeverScrollableScrollPhysics(),
          //     itemBuilder: (BuildContext context, int index,
          //         Animation<double> animation) {
          //       final value = currentBet[index];
          //       return SlideTransition(
          //         position: animation.drive(Tween(
          //           begin: const Offset(-1.0, 0.0),
          //           end: const Offset(0.0, 0.0),
          //         ).chain(CurveTween(curve: Curves.easeInOutQuart))),
          //         child: _betingListItem(
          //           index,
          //           value.gameNameText,
          //           value.payAmountText(),
          //           value.payAmountText(auto: false),
          //           value.currency,
          //         ),
          //       );
          //     },
          //   ),
          // ),
        ],
      ),
    );
  }

  Widget _buildMyBettingList(List<RealTimeBetInfoModel> currentBet) {
    return Padding(
      padding: EdgeInsets.only(top: 4.dp),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildFixedSpaceWidget([
            _buildTitleWidget(
              localized("game"),
              end: 0.dp,
            ),
            _buildTitleWidget(
              localized("pay_amount"),
              start: 0.dp,
              textAlign: TextAlign.right,
            ),
          ]),
          ...currentBet.asMap().entries.map(
                (entry) => _betingListItem(
                  entry.key,
                  entry.value.gameNameText,
                  entry.value.payAmountText(),
                  entry.value.payAmountText(auto: false),
                  entry.value.currency,
                ),
              ),
        ],
      ),
    );
  }

  Widget _betingListItem(int index, String gameName, String money,
      String rawMoney, String? currency) {
    return _buildFixedSpaceWidget(
      [
        _buildTitleWidget(
          gameName,
          end: 0.dp,
          textColor: GGColors.textMain.color,
          showPopup: true,
        ),
        _buidAmount(money, rawMoney, currency),
      ],
      backgroundColor: index % 2 == 0
          ? Colors.transparent
          : GGColors.border.color.withOpacity(0.5),
    );
  }

  Widget _buidAmountTips(String money, String? currency) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Text(
          money,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textBlackOpposite.color,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        Gaps.hGap4,
        SizedBox(
          width: 14.dp,
          height: 14.dp,
          child: GamingImage.network(
            url: CurrencyService.sharedInstance.getIconUrl(currency ?? 'USDT'),
          ),
        ),
      ],
    );
  }

  Widget _buidAmount(String money, String rawMoney, String? currency) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        GamingPopupLinkWidget(
          followerAnchor: Alignment.bottomCenter,
          targetAnchor: Alignment.topCenter,
          popup: _buidAmountTips(rawMoney, currency),
          child: Text(
            money,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        Gaps.hGap4,
        SizedBox(
          width: 14.dp,
          height: 14.dp,
          child: GamingImage.network(
            url: CurrencyService.sharedInstance.getIconUrl(currency ?? 'USDT'),
          ),
        ),
        Gaps.hGap16,
      ],
    );
  }

  Widget _buildTitleWidget(String title,
      {double? start,
      double? end,
      TextAlign? textAlign,
      Color? textColor,
      bool showPopup = false}) {
    final child = Padding(
      padding: EdgeInsets.only(left: start ?? 16.dp, right: end ?? 16.dp),
      child: Text(
        title,
        overflow: TextOverflow.ellipsis,
        style: GGTextStyle(
          fontSize: GGFontSize.label,
          color: textColor ?? GGColors.textSecond.color,
        ),
        textAlign: textAlign ?? TextAlign.left,
      ),
    );
    if (showPopup) {
      return GamingPopupLinkWidget(
        followerAnchor: Alignment.bottomCenter,
        targetAnchor: Alignment.topCenter,
        popup: _buildDetailTip(title),
        child: child,
      );
    }
    return child;
  }

  Widget _buildFixedWidget(List<Widget> childrenWidgets,
      {double height = 50.0, Color? backgroundColor}) {
    return Container(
      color: backgroundColor ?? Colors.transparent,
      height: height,
      child: Row(
        children: childrenWidgets,
      ),
    );
  }

  Widget _buildFixedSpaceWidget(List<Widget> childrenWidgets,
      {double height = 50.0, Color? backgroundColor}) {
    return _buildFixedWidget(
      childrenWidgets
          .map(
            (e) => Expanded(
              child: e,
            ),
          )
          .toList(),
      height: height,
      backgroundColor: backgroundColor,
    );
  }

  Widget _buildContest() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 12.dp),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Gaps.vGap20,
          Row(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Obx(() {
                    return Row(
                      mainAxisSize: MainAxisSize.min,
                      children: controller.state.dailyContests.map((element) {
                        return Row(
                          children: [
                            ScaleTap(
                              opacityMinValue: 0.8,
                              scaleMinValue: 0.98,
                              onPressed: () {
                                controller.changeCurrentDailyContest(element);
                              },
                              child: Padding(
                                padding: EdgeInsets.symmetric(vertical: 4.dp),
                                child: Row(
                                  children: [
                                    SvgPicture.asset(
                                      R.homeCountdown,
                                      width: 16.dp,
                                      height: 16.dp,
                                      color: GGColors.textSecond.color,
                                    ),
                                    Gaps.hGap8,
                                    Text(
                                      '${element.title} - ${_periodString(element.period)}',
                                      style: GGTextStyle(
                                          fontSize: GGFontSize.content,
                                          color: GGColors.textMain.color,
                                          fontWeight: (controller
                                                      .state
                                                      .currentContest
                                                      .value
                                                      .activitiesNo ==
                                                  element.activitiesNo)
                                              ? GGFontWeigh.bold
                                              : GGFontWeigh.regular),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            Gaps.hGap20,
                          ],
                        );
                      }).toList(),
                    );
                  }),
                ),
              ),
              Gaps.hGap16,
              Row(
                children: [
                  SvgPicture.asset(
                    R.homeStatistics,
                    width: 16.dp,
                    height: 16.dp,
                    color: GGColors.textSecond.color,
                  ),
                  Gaps.hGap8,
                  Obx(() {
                    return Text(
                      _countDownTime((controller
                                  .state.currentContest.value.endTime -
                              controller.state.currentContest.value.nowTime) ~/
                          1000),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                      ),
                    );
                  })
                ],
              ),
            ],
          ),
          Gaps.vGap16,
          Container(
            color: GGColors.border.color,
            height: 2.dp,
          ),
          Gaps.vGap20,
          _rankListHeader(),
          Gaps.vGap2,
          _buildRankList(),
        ],
      ),
    );
  }

  Widget _buildSelectHeader() {
    return Obx(
      () => SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Container(
          padding: EdgeInsets.all(6.dp),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(30.dp),
            color: GGColors.darkBackground.color,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: controller.state.bettingList
                .map((e) => _buildSelectItem(e,
                    selected: e == controller.state.bettingTitle.value))
                .toList(),
          ),
        ),
      ),
    );
  }

  Widget _buildSelectItem(String title, {bool selected = false}) {
    return ScaleTap(
      onPressed: () => controller.changeBetting(title),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(22.dp),
          color: selected ? GGColors.border.color : Colors.transparent,
        ),
        padding: EdgeInsets.symmetric(vertical: 5.dp, horizontal: 15.dp),
        child: Text(
          localized(title),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color:
                selected ? GGColors.textMain.color : GGColors.textSecond.color,
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(double width, double height, String? avatar) {
    avatar = GamingUserModel.defaultAvatar(avatar);
    Widget resultWidget = Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius:
            BorderRadius.circular((width > height ? height : width) / 2.0),
        color: GGColors.brand.color.withOpacity(0.3),
      ),
    );
    if (avatar.startsWith("http") == true) {
      resultWidget = GamingImage.network(
        url: avatar,
        width: width,
        height: height,
        radius: (width > height ? height : width) / 2.0,
        fit: BoxFit.fill,
      );
    } else if (avatar.startsWith('assets/')) {
      resultWidget = ClipRRect(
        borderRadius:
            BorderRadius.circular((width > height ? height : width) / 2.0),
        child: Image.asset(avatar, width: width, height: height),
      );
    }
    return resultWidget;
  }

  Widget _rankListHeader() {
    return Row(
      children: [
        Gaps.hGap8,
        SizedBox(
          width: 50.dp,
          child: Text(
            localized("rank_a"),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
              fontWeight: GGFontWeigh.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Expanded(
                child: Text(
                  localized("gamer"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (controller.state.currentContest.value.executeType == 0)
                      GamingPopupLinkWidget(
                        followerAnchor: Alignment.bottomCenter,
                        targetAnchor: Alignment.topCenter,
                        popup: _buildTip(),
                        offset: Offset(5.dp, 0),
                        triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
                        child: Container(
                          padding: EdgeInsets.only(right: 4.dp),
                          child: SvgPicture.asset(
                            R.iconTipIcon,
                            width: 14.dp,
                            height: 14.dp,
                            color: GGColors.textSecond.color,
                          ),
                        ),
                      ),
                    if (controller.state.currentContest.value.executeType != 0)
                      SizedBox(width: 18.dp),
                    Flexible(
                      child: Text(
                        controller.state.currentContest.value.executeDesc,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textSecond.color,
                          fontWeight: GGFontWeigh.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
        Gaps.hGap4,
        SizedBox(
          width: 60.dp,
          child: Text(
            localized("race_reward"),
            textAlign: TextAlign.right,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
              fontWeight: GGFontWeigh.bold,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        Gaps.hGap8,
      ],
    );
  }

  Widget _buildDetailTip(String title,
      {EdgeInsetsGeometry? padding = EdgeInsets.zero}) {
    return Container(
      constraints: BoxConstraints(maxWidth: 160.dp),
      padding: padding ?? EdgeInsets.symmetric(vertical: 10.dp),
      child: Text(
        title,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textBlackOpposite.color,
        ),
      ),
    );
  }

  Widget _buildTip() {
    return Container(
      width: 250.dp,
      padding: EdgeInsets.symmetric(vertical: 10.dp),
      child: Text(
        localized("race_tips"),
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textBlackOpposite.color,
        ),
      ),
    );
  }

  Widget _buildRankList() {
    final list = controller.state.contestRankList;
    if (list.isEmpty) {
      return SizedBox(
        height: 300.dp,
        child: Center(
          child: controller.state.isRankDataLoading.value
              ? const GoGamingLoading()
              : const GoGamingEmpty(),
        ),
      );
    } else {
      List<Widget> children = [];
      for (var index = 0; index < list.length; index++) {
        final model = controller.state.contestRankList[index];
        children.add(_rankListItem(
            model.rankNumber,
            model.avatar,
            model.userName,
            model.rankMoney,
            model.bonusUsdtMoney,
            index,
            model.uid));
      }
      return Stack(
        children: [
          ListView(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: children,
          ),
          Visibility(
            visible: controller.state.isRankDataLoading.value,
            child: const GoGamingLoading(),
          ),
        ],
      );
    }
  }

  Widget _rankListItem(int rankNumber, String avatar, String userName,
      num rankMoney, num bonusUsdtMoney, int index, String uid) {
    String showName = _showUserName(userName, uid);
    Widget rankNumberWidget;
    if (rankNumber < 4) {
      rankNumberWidget = Align(
        alignment: Alignment.centerLeft,
        child: Image.asset(
          'assets/images/home/${rankNumber}th.png',
          width: 20.dp,
          height: 20.dp,
        ),
      );
    } else {
      rankNumberWidget = Text(
        "${rankNumber}th",
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textSecond.color,
        ),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      );
    }
    return Container(
      color: index % 2 == 0
          ? Colors.transparent
          : GGColors.border.color.withOpacity(0.5),
      height: 55.dp,
      child: Row(
        children: [
          Gaps.hGap8,
          SizedBox(
            width: 50.dp,
            child: rankNumberWidget,
          ),
          Expanded(
            child: _gamerWidget(showName, avatar: avatar),
          ),
          Expanded(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Flexible(
                  child: Text(
                    NumberPrecision(rankMoney).balanceText(true),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Gaps.hGap4,
                SizedBox(
                  width: 14.dp,
                  height: 14.dp,
                  child: GamingImage.network(
                    url: CurrencyService.sharedInstance.getIconUrl('USDT'),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(
            width: 60.dp,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Flexible(
                  child: Text(
                    NumberPrecision(bonusUsdtMoney)
                        .balanceText(true)
                        .stripTrailingZeros(),
                    textAlign: TextAlign.right,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.successText.color,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.clip,
                  ),
                ),
                Gaps.hGap4,
                SizedBox(
                  width: 14.dp,
                  height: 14.dp,
                  child: GamingImage.network(
                    url: CurrencyService.sharedInstance.getIconUrl('USDT'),
                  ),
                ),
              ],
            ),
          ),
          Gaps.hGap8,
        ],
      ),
    );
  }

  Widget _gamerWidget(String userName, {String? avatar}) {
    return Row(
      children: [
        _buildAvatar(14.dp, 14.dp, avatar),
        Gaps.hGap4,
        Text(
          userName,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  String _showUserName(String userName, String uid) {
    if (userName.isEmpty) {
      return localized("invisible");
    } else if (userName.startsWith(r'$$')) {
      return uid;
    }
    return userName;
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

  String _countDownTime(int time) {
    if (time > 60 * 60 * 24) {
      return "${time ~/ (60 * 60 * 24)}${localized("after_day")}";
    } else if (time > 60 * 60) {
      return "${time ~/ (60 * 60)}${localized("after_hours")}";
    } else if (time > 60) {
      return "${time ~/ 60}${localized("after_minutes")}";
    }
    return "$time${localized("second_unit")}";
  }
}
