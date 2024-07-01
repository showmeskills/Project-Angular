import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/account/models/gaming_user_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/tag_model.dart';
import 'package:gogaming_app/common/api/game_order/models/betinfo/real_time_bet_info_model.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/realtime_service/game_realtime_logic.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/go_gaming_empty.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/game_detail/game_detail_logic.dart';
import 'package:gogaming_app/pages/game_detail/game_detail_state.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:tab_indicator_styler/tab_indicator_styler.dart';

class GameDetailDesView extends StatelessWidget {
  const GameDetailDesView({
    Key? key,
    required this.state,
    required this.onPressExpand,
    required this.onPressTag,
    this.tag,
  }) : super(key: key);

  final GameDetailState state;
  final void Function() onPressExpand;
  final void Function(GamingGameTagModel tag) onPressTag;
  final String? tag;

  GameDetailLogic get logic => Get.find<GameDetailLogic>(tag: tag);
  GameRealtimeLogic get realtimeController => logic.realtimeController;

  @override
  Widget build(BuildContext context) {
    return _buildGameDes();
  }

  Widget _buildGameDes() {
    return Obx(() {
      final currentGame = state.gameData.value;
      return Container(
        padding: EdgeInsetsDirectional.all(16.dp),
        decoration: BoxDecoration(
          color: GGColors.darkPopBackground.color,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            InkWell(
              onTap: onPressExpand,
              child: _buildDetailRow1(currentGame),
            ),
            Visibility(
                visible: state.detailExpand.value,
                child: __buildDetailExpanded(currentGame)),
          ],
        ),
      );
    });
  }

  Widget __buildDetailExpanded(GamingGameModel currentGame) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Gaps.vGap16,
        _buildTabbar(),
        Gaps.vGap8,
        _buildTabBarView(currentGame),
      ],
    );
  }

  Widget _buildTabBarView(GamingGameModel currentGame) {
    return Obx(() {
      final index = logic.index.value;
      if (1 == index || 2 == index) {
        return realtimeController.obx(
          (state) {
            if (2 == index) {
              return _buildLuckyWinner(state);
            } else if (1 == index) {
              return _buildBigWinner(state);
            } else {
              return Container();
            }
          },
          onLoading: SizedBox(
            height: 210.dp,
            width: double.infinity,
            child: const GoGamingLoading(),
          ),
          onEmpty: SizedBox(
            height: 210.dp,
            width: double.infinity,
            child: const GoGamingEmpty(),
          ),
        );
      } else {
        return _buildDescContent(currentGame);
      }
    });
  }

  Widget _buildLuckyWinner(List<RealTimeBetInfoModel>? state) {
    return SizedBox(
      height: 210.dp,
      width: double.infinity,
      child: LayoutBuilder(builder: (context, constraints) {
        final rowWidth = constraints.maxWidth;
        // final totalWidth = (100.0 + 100 + 54) / 311.0 * rowWidth;
        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: SizedBox(
            width: rowWidth,
            child: ListView(
              scrollDirection: Axis.vertical,
              // padding: EdgeInsets.only(left: 8.dp, right: 8.dp),
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildLuckyWinnerHeader(rowWidth),
                ...state!.asMap().entries.map(
                      (e) => _buildLuckyWinnerRow(
                        e.key + 1,
                        rowWidth,
                        isDark: e.key % 2 == 1,
                        model: state[e.key],
                      ),
                    ),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildLuckyWinnerRow(
    num rankNumber,
    double rowWidth, {
    bool isDark = false,
    RealTimeBetInfoModel? model,
  }) {
    if (model == null) return Container();

    final rankWidth = 80.0 / 311.0 * rowWidth;
    final gamerWidth = 120.0 / 311.0 * rowWidth;
    final oddsWidth = 80.0 / 311.0 * rowWidth;
    final rankNumberWidget = SizedBox(
      width: rankWidth,
      child: Align(
        alignment: Alignment.centerLeft,
        child: Image.asset(
          'assets/images/home/${rankNumber}th.png',
          width: 20.dp,
          height: 20.dp,
        ),
      ),
    );
    // final icon = _buildCurrencyIcon(model.currency ?? 'USDT');
    return Container(
      height: 50.dp,
      color: isDark ? GGColors.border.color : null,
      padding: EdgeInsets.only(left: 8.dp, right: 8.dp),
      child: ListView(
        scrollDirection: Axis.horizontal,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          rankNumberWidget,
          // _buildListItem(
          //   dateWidth,
          //   model.dateTimeText,
          //   Alignment.centerLeft,
          // ),
          _buildListItem(
            gamerWidth,
            _showUserName(model.playerName ?? ''),
            icon: _buildAvatar(14.dp, 14.dp, model.avatar),
            Alignment.center,
            iconAlignment: Alignment.centerLeft,
          ),
          _buildListItem(
            oddsWidth,
            model.oddsText,
            Alignment.centerRight,
          ),
        ],
      ),
    );
  }

  Widget _buildLuckyWinnerHeader(double rowWidth) {
    final rankWidth = 80.0 / 311.0 * rowWidth;
    final gamerWidth = 120.0 / 311.0 * rowWidth;
    final oddsWidth = 80.0 / 311.0 * rowWidth;
    return SizedBox(
      height: 50.dp,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.only(left: 8.dp, right: 8.dp),
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          _buildListItem(
            rankWidth,
            localized('rank_a'),
            Alignment.centerLeft,
            isTitle: true,
          ),
          _buildListItem(
            gamerWidth,
            localized('gamer'),
            Alignment.center,
            isTitle: true,
          ),
          _buildListItem(
            oddsWidth,
            localized('odds'),
            Alignment.centerRight,
            isTitle: true,
          ),
        ],
      ),
    );
  }

  Widget _buildBigWinner(List<RealTimeBetInfoModel>? state) {
    return SizedBox(
      height: 210.dp,
      width: double.infinity,
      child: LayoutBuilder(builder: (context, constraints) {
        final rowWidth = constraints.maxWidth;

        final totalWidth = (90.0 + 50 + 150) / 311.0 * rowWidth + 16.dp;
        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: SizedBox(
            width: totalWidth,
            child: ListView(
              scrollDirection: Axis.vertical,
              // padding: EdgeInsets.only(left: 8.dp, right: 8.dp),
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildBigWinnerHeader(rowWidth),
                ...state!.asMap().entries.map(
                      (e) => _buildBigWinnerRow(
                        rowWidth,
                        rankNumber: e.key + 1,
                        isDark: e.key % 2 == 1,
                        model: state[e.key],
                      ),
                    ),
              ],
            ),
          ),
        );
      }),
    );
  }

  Widget _buildCurrencyIcon(String currency) {
    final currencyIconUrl = CurrencyService().getIconUrl(currency);
    return GamingImage.network(
      url: currencyIconUrl,
      width: 16.dp,
      height: 16.dp,
    );
  }

  Widget _buildBigWinnerRow(
    double rowWidth, {
    required num rankNumber,
    bool isDark = false,
    RealTimeBetInfoModel? model,
  }) {
    if (model == null) return Container();

    final rankWidth = 50.0 / 311.0 * rowWidth;
    final gamerWidth = 120.0 / 311.0 * rowWidth;
    final payWidth = 120.0 / 311.0 * rowWidth;
    // final icon = _buildCurrencyIcon(model.currency ?? 'USDT');
    final rankNumberWidget = SizedBox(
      width: rankWidth,
      child: Align(
        alignment: Alignment.centerLeft,
        child: Image.asset(
          'assets/images/home/${rankNumber}th.png',
          width: 20.dp,
          height: 20.dp,
        ),
      ),
    );
    return Container(
      height: 50.dp,
      color: isDark ? GGColors.border.color : null,
      padding: EdgeInsets.only(left: 8.dp, right: 8.dp),
      child: ListView(
        scrollDirection: Axis.horizontal,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          rankNumberWidget,
          _buildListItem(
            gamerWidth,
            _showUserName(model.playerName ?? ''),
            icon: _buildAvatar(14.dp, 14.dp, model.avatar),
            Alignment.center,
            iconAlignment: Alignment.centerLeft,
          ),
          _buildListItem(
            payWidth,
            model.payAmountText(),
            icon: _buildCurrencyIcon(model.currency ?? 'USDT'),
            Alignment.centerRight,
          ),
        ],
      ),
    );
  }

  Widget _buildBigWinnerHeader(double rowWidth) {
    // final dateWidth = 90.0 / 311.0 * rowWidth;
    final rankWidth = 50.0 / 311.0 * rowWidth;

    // final betWidth = 100.0 / 311.0 * rowWidth;
    final gamerWidth = 120.0 / 311.0 * rowWidth;
    final payWidth = 120.0 / 311.0 * rowWidth;
    return SizedBox(
      height: 50.dp,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.only(left: 8.dp, right: 8.dp),
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        children: [
          _buildListItem(
            rankWidth,
            localized('rank_a'),
            Alignment.centerLeft,
            isTitle: true,
          ),
          _buildListItem(
            gamerWidth,
            localized('gamer'),
            Alignment.center,
            isTitle: true,
          ),
          _buildListItem(
            payWidth,
            localized('pay_amount'),
            Alignment.centerRight,
            isTitle: true,
          ),
        ],
      ),
    );
  }

  String _showUserName(String userName) {
    if (userName.isEmpty) {
      return localized("invisible");
    }
    return userName;
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

  Widget _buildListItem(
    double width,
    String title,
    Alignment align, {
    Widget? icon,
    bool isTitle = false,
    Alignment iconAlignment = Alignment.centerRight,
  }) {
    MainAxisAlignment mainAxisAlignment =
        align.x == -1 ? MainAxisAlignment.start : MainAxisAlignment.end;
    if (align.x == 0) {
      mainAxisAlignment = MainAxisAlignment.center;
    }
    return SizedBox(
      width: width,
      child: Row(
        mainAxisAlignment: mainAxisAlignment,
        children: [
          if (iconAlignment.x == -1 && icon != null) ...[
            icon,
            const SizedBox(width: 5)
          ],
          Flexible(
            fit: icon == null ? FlexFit.tight : FlexFit.loose,
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: align,
              child: Text(
                title,
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: isTitle ? GGFontSize.content : GGFontSize.label,
                  fontWeight: isTitle ? GGFontWeigh.bold : GGFontWeigh.regular,
                ),
              ),
            ),
          ),
          if (iconAlignment.x != -1 && icon != null) ...[
            const SizedBox(width: 5),
            icon
          ],
        ],
      ),
    );
  }

  Widget _buildDescContent(GamingGameModel currentGame) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          currentGame.gameDesc ?? '',
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.bold,
          ),
        ),
        Gaps.vGap16,
        Row(
          children: [
            _buildTag(
                '${localized('bank_adv')} ${currentGame.bankerAdvantage}%'),
          ],
        ),
        Gaps.vGap8,
        _buildGameLabels(currentGame.gameLabels ?? []),
      ],
    );
  }

  Widget _buildTabbar() {
    return Row(
      children: [
        Flexible(
          child: Container(
            padding: const EdgeInsetsDirectional.only(
              start: 2,
              end: 2,
            ),
            height: 52.dp,
            decoration: ShapeDecoration(
              color: GGColors.border.color,
              shape: StadiumBorder(
                side: BorderSide(
                  // color: GGColors.popBackground.color.withOpacity(0.3),
                  color: Colors.transparent,
                  width: 5.dp,
                ),
              ),
            ),
            child: TabBar(
              controller: logic.tabController,
              isScrollable: true,
              tabs: [
                Tab(
                  text: localized('des'),
                ),
                Tab(
                  text: localized('big_w'),
                ),
                Tab(
                  text: localized('lucky_w'),
                ),
              ],
              labelColor: GGColors.buttonTextWhite.color,
              unselectedLabelColor: GGColors.textSecond.color,
              indicator: RectangularIndicator(
                color: ThemeManager.shareInstacne.isDarkMode
                    ? GGColors.background.night
                    : GGColors.menuAppBarIconColor.day,
                bottomLeftRadius: 100,
                bottomRightRadius: 100,
                topLeftRadius: 100,
                topRightRadius: 100,
                paintingStyle: PaintingStyle.fill,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGameLabels(List<GamingGameTagModel> gameLabels) {
    return SizedBox(
      width: double.infinity,
      child: Wrap(
        spacing: 8.dp, // gap between adjacent chips
        runSpacing: 8.dp, // gap between lines
        children: gameLabels
            .map(
              (e) => GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => onPressTag(e),
                  child: _buildTag(e.description)),
            )
            .toList(),
      ),
    );
  }

  Widget _buildTag(String? title) {
    return Container(
      padding:
          EdgeInsets.only(left: 8.dp, top: 2.dp, right: 8.dp, bottom: 2.dp),
      decoration: BoxDecoration(
        color: GGColors.border.color,
        borderRadius: BorderRadius.circular(11),
      ),
      child: Text(
        title ?? '',
        style: GGTextStyle(
          color: GGColors.textSecond.color,
          fontSize: GGFontSize.hint,
          fontWeight: GGFontWeigh.bold,
          height: 1.44,
        ),
      ),
    );
  }

  Widget _buildDetailRow1(GamingGameModel currentGame) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Flexible(
                child: Text(
                  currentGame.gameName ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ),
              SizedBox(width: 8.dp),
              Flexible(
                child: Text(
                  currentGame.providerName ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(width: 8.dp),
        SvgPicture.asset(
          state.detailExpand.value ? R.iconArrowDown : R.iconArrowLeft,
          width: 18.dp,
          height: 18.dp,
          color: GGColors.textSecond.color,
        ),
      ],
    );
  }
}
