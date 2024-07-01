import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_search_result_model.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/widgets/gaming_game_image.dart';
import 'package:gogaming_app/common/widgets/gaming_game_label_icon.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/home/views/home_swiper.dart';

import '../../widget_header.dart';
import 'game_search_logic.dart';

class GameSearchPage extends BaseView<GameSearchLogic> {
  const GameSearchPage({Key? key}) : super(key: key);

  @override
  bool resizeToAvoidBottomInset() => false;

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  Color backgroundColor() {
    return GGColors.alertBackground.color;
  }

  @override
  bool? showTopTips() {
    return false;
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return PreferredSize(
      preferredSize: Size.fromHeight(58.dp),
      child: Material(
        color: GGColors.homeFootBackground.color,
        child: Column(
          children: [
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Gaps.hGap12,
                  SvgPicture.asset(
                    R.iconSearch,
                    width: 20.dp,
                    height: 20.dp,
                    color: GGColors.textHint.color,
                  ),
                  Gaps.hGap8,
                  Text(
                    localized("search"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                      fontWeight: GGFontWeigh.bold,
                    ),
                  )
                ],
              ),
            ),
            // Container(
            //   color: GGColors.border.color,
            //   width: double.infinity,
            //   height: 1.dp,
            // )
          ],
        ),
      ),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GameSearchLogic());
    return Column(
      children: [
        Gaps.vGap16,
        _buildSearchBar(),
        _buildSearchHint(),
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildRecentSearch(),
                _buildSearchResult(),
                _buildRecommend(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // 搜索的游戏结果
  Widget _buildSearchResult() {
    return Obx(
      () {
        final searchResults = controller.searchResultsGames;
        return Visibility(
          visible: controller.isSearching.value == true &&
              (searchResults.isNotEmpty ||
                  controller.searchResultsLabels.isNotEmpty),
          child: HomeSwiper(
            iconBuilder: () {
              return GamingGameLabelIcon(
                iconName: R.iconSearch,
                size: 18.dp,
                color: GGColors.textHint.color,
              );
            },
            title: localized('sear_res'),
            total: searchResults.length,
            mainAxisCount: 3,
            extraWidget: _buildSearchLabelResult(),
            builder: (context, index) {
              final gameItem = searchResults[index];
              return GamingGameImage(
                radius: 4.dp,
                data: gameItem,
              );
            },
          ),
        );
      },
    );
  }

  // 搜索的标签结果
  Widget _buildSearchLabelResult() {
    // 返回一个Container
    return Obx(
      () {
        final searchResults = controller.searchResultsLabels;
        return Visibility(
          visible:
              controller.isSearching.value == true && searchResults.isNotEmpty,
          child: Container(
            alignment: Alignment.centerLeft,
            padding: EdgeInsets.only(left: 12.dp, top: 10.dp, bottom: 14.dp),
            child: Wrap(
              runSpacing: 10.dp,
              spacing: 10.dp,
              children: searchResults
                  .map(
                    (e) => GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onTap: () => _onClickLabel(e),
                        child: _buildLabel(e)),
                  )
                  .toList(),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLabel(LabelInfo info) {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.border.color,
        borderRadius: BorderRadius.circular(10.dp),
      ),
      padding:
          EdgeInsets.only(left: 8.dp, top: 2.dp, right: 8.dp, bottom: 2.dp),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            '${info.labelName}',
            textAlign: TextAlign.center,
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textSecond.color,
              height: 1.44,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentSearch() {
    return Obx(() {
      return Visibility(
        visible: controller.history.isNotEmpty == true &&
            controller.isSearching.value == false,
        child: Padding(
          padding:
              EdgeInsetsDirectional.only(top: 35.dp, start: 15.dp, end: 20.dp),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                localized('rec_sear'),
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content,
                ),
              ),
              SizedBox(height: 10.dp),
              ...controller.history
                  .map(
                    (element) => InkWell(
                      onTap: () => _onSearch(element),
                      child: Row(
                        children: [
                          SizedBox(height: 42.dp),
                          SvgPicture.asset(
                            R.mainMenuRecentPlayed,
                            width: 14.dp,
                            height: 14.dp,
                          ),
                          SizedBox(width: 4.dp),
                          Text(
                            element,
                            style: GGTextStyle(
                              fontSize: GGFontSize.hint,
                              color: GGColors.textMain.color,
                            ),
                          ),
                          const Spacer(),
                          InkWell(
                            onTap: () => _onDeleteHistory(element),
                            child: Padding(
                              padding: EdgeInsetsDirectional.only(
                                top: 10.dp,
                                bottom: 10.dp,
                                start: 20.dp,
                              ),
                              child: SvgPicture.asset(
                                R.iconClose,
                                width: 11,
                                height: 11,
                                color: GGColors.textSecond.color,
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                  .toList(),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildSearchHint() {
    return Obx(() {
      return Visibility(
        visible: controller.searchResultsGames.isEmpty &&
            controller.searchResultsLabels.isEmpty,
        child: Padding(
          padding: EdgeInsets.only(top: 35.dp, bottom: 25.dp),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  controller.isSearching.value
                      ? localized('search_unfind')
                      : localized('least_three'),
                  textAlign: TextAlign.center,
                  style: GGTextStyle(
                    color: GGColors.textSecond.color,
                    fontSize: GGFontSize.content,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildRecommend() {
    return Obx(
      () {
        final recommendGame = controller.recommendGame.value;
        final count = recommendGame.gameLists.length;
        if (recommendGame.labelName == null || count == 0) {
          return Gaps.empty;
        }
        return HomeSwiper(
          iconName: recommendGame.icon,
          title: recommendGame.labelName ?? '',
          total: count,
          mainAxisCount: 3,
          builder: (context, index) {
            final gameItem = recommendGame.gameLists[index];
            return GamingGameImage(
              radius: 4.dp,
              data: gameItem,
            );
          },
        );
      },
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: GamingTextField(
        controller: controller.searchController,
        hintText: localized('sear_g'),
        onSubmitted: _onSearch,
        prefixIcon: GamingTextFieldIcon(
          icon: R.iconSearch,
          iconSize: 20.dp,
          iconColor: GGColors.textSecond.color,
          padding: EdgeInsets.only(right: 8.dp, left: 18.dp),
        ),
        prefixIconConstraints: BoxConstraints.tightFor(
          height: 20.dp,
          width: 46.dp,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(26.dp),
          borderSide: ThemeManager.shareInstacne.isDarkMode
              ? BorderSide(
                  color: GGColors.border.color,
                  width: 2.dp,
                )
              : BorderSide.none,
        ),
        fillColor: ThemeManager.shareInstacne.isDarkMode
            ? null
            : GGColors.homeFootBackground,
        // focusedBorderColor: GGColors.border.color,
        contentPadding:
            EdgeInsets.symmetric(vertical: 10.dp, horizontal: 13.dp),
      ),
    );
  }
}

extension _Action on GameSearchPage {
  void _onSearch(String text) {
    controller.enterSearch(text);
  }

  void _onDeleteHistory(String searchHis) {
    controller.deleteHistory(searchHis);
  }

  void _onClickLabel(LabelInfo info) {
    Get.toNamed<void>(Routes.gameList.route, arguments: {
      'labelId': info.labelId,
      'title': info.labelName,
    });
  }
}
