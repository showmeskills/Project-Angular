import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/game_provider_view.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/gg_game_list/views/gaming_game_list.dart';
import 'package:gogaming_app/pages/gg_game_list/views/gaming_game_list_footer.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/api/game/game_api.dart';
import '../../common/api/game/models/gaming_game_sort_model.dart';
import '../../common/service/game_service.dart';
import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gaming_bottom_sheet.dart';
import '../../common/widgets/gaming_game_image.dart';
import '../../common/widgets/gaming_image/gaming_image.dart';
import '../../common/widgets/go_gaming_empty.dart';
import '../../generated/r.dart';
import '../home/views/home_footer.dart';
import 'views/gaming_provider_selector_view.dart';
import 'gg_game_list_logic.dart';
import 'gg_game_list_state.dart';

class GGGameListPage extends BaseView<GGGameListLogic> {
  const GGGameListPage(
    this.labelId, {
    required this.type,
    super.key,
  });

  final String labelId;
  final GameSortType type;

  GGGameListState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () {
        Map<String, dynamic> arguments = Get.arguments as Map<String, dynamic>;
        String labelId = arguments['labelId'].toString();
        GameSortType? type;
        if (arguments.containsKey('type')) {
          type = arguments['type'] as GameSortType?;
        }
        return GGGameListPage(
          labelId,
          type: type ?? GameSortType.label,
        );
      },
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      title: GameService.sharedInstance.getLabelModelByLabelId(labelId)?.name ??
          '',
      bottomHeight: 80.dp,
      bottomBackgroundColor: GGColors.gameListHeaderBackground.color,
      leadingIcon: GamingBackButton(
        color: GGColors.textSecond.color,
        padding: EdgeInsets.symmetric(
          horizontal: 12.dp,
          vertical: 16.dp,
        ).copyWith(right: 8.dp),
      ),
      titleStyle: GGTextStyle(
        fontSize: GGFontSize.superBigTitle26,
        fontWeight: GGFontWeigh.bold,
      ),
      trailingWidgets: [
        if (GameService.sharedInstance
                .getLabelModelByLabelId(labelId)
                ?.image
                ?.isNotEmpty ??
            false)
          Expanded(
            child: GamingImage.network(
              url: GameService.sharedInstance
                  .getLabelModelByLabelId(labelId)
                  ?.image,
              fit: BoxFit.fitHeight,
              height: 80.dp,
              alignment: Alignment.centerRight,
            ),
          )
      ],
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  Widget body(BuildContext context) {
    Get.put(GGGameListLogic(type: type));
    controller.labelId = labelId;
    return Scaffold(
      backgroundColor: GGColors.background.color,
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildGameSort(),
            _buildGameList(),
            Gaps.vGap20,
            _buildFooter(),
            Gaps.vGap10,
            const GameProviderView(),
            Gaps.vGap20,
            const HomeFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildFooter() {
    return Obx(() {
      int currentPageShow = (controller.currentPageIndex - 1) * 24;
      return Visibility(
        visible: !state.isLoading.value && state.games.isNotEmpty,
        child: GamingGameListFooter(
          progressName: "${localized("is_s")}"
              " ${state.gamesTotal.value.toString()} "
              "${localized('o')}"
              " ${(currentPageShow > state.gamesTotal.value ? state.gamesTotal.value : currentPageShow).toString()} "
              "${localized("g")}",
          progressValue: state.games.length / state.gamesTotal.value,
          hiddenMoreButton: (currentPageShow < state.gamesTotal.value),
          onPressedMore: () => controller.loadMoreGame(),
        ),
      );
    });
  }

  Widget _buildGameList() {
    return Obx(() {
      if (state.isLoading.value) {
        return SizedBox(
          height: 200.dp,
          child: const Center(
            child: GoGamingLoading(),
          ),
        );
      } else {
        if (state.games.isEmpty) {
          return SizedBox(
            height: 200.dp,
            child: const Center(
              child: GoGamingEmpty(),
            ),
          );
        } else {
          return GamingGameList(
            total: state.games.length,
            builder: (context, index) {
              return GamingGameImage(
                radius: 4.dp,
                data: state.games[index],
              );
            },
          );
        }
      }
    });
  }

  Widget _buildGameSort() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 12.dp, vertical: 20.dp),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Obx(() {
            return _buildSortContent(
              localized("game_pro"),
              selectNum: state.selectProviderIds.length,
              onTap: () => _pressSelectProvider(),
            );
          }),
          const Spacer(),
          Obx(() {
            return _buildSortContent(
              state.selectSortDescription.value.isEmpty
                  ? localized("popular")
                  : state.selectSortDescription.value,
              onTap: () => _pressSelectSort(),
            );
          })
        ],
      ),
    );
  }

  Widget _buildSortContent(String content,
      {int selectNum = 0, void Function()? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: GGColors.border.color,
            width: 1.dp,
          ),
          borderRadius: BorderRadius.circular(4),
          color: GGColors.alertBackground.color,
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(
            vertical: 10.dp,
            horizontal: 16.dp,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                content,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
              Gaps.hGap8,
              if (selectNum > 0) ...[
                Container(
                  height: 20.dp,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(14.dp),
                    color: GGColors.highlightButton.color,
                  ),
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 8.dp),
                      child: Text(
                        selectNum.toString(),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.buttonTextWhite.color,
                        ),
                      ),
                    ),
                  ),
                ),
                Gaps.hGap8
              ],
              SvgPicture.asset(
                R.iconDropDown,
                width: 10.dp,
                color: GGColors.textSecond.color,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

extension _Action on GGGameListPage {
  void _pressSelectProvider() {
    GamingBottomSheet.show<dynamic>(
      title: '${localized("sen_de")}${localized("game_pro")}',
      builder: (context) {
        return GamingSelectProviderSelector(
          providers: state.optionalProvider,
          selectProviderIds: state.selectProviderIds,
          complete: (List<String> result) {
            controller.selectProvider();
          },
        );
      },
    );
  }

  void _pressSelectSort() {
    GamingBottomSheet.show<dynamic>(
      title: '${localized("sen_de")}${localized("sort")}',
      builder: (context) {
        return MediaQuery.removePadding(
          context: context,
          removeTop: true,
          child: ListView.builder(
            itemCount: state.sortSelects.length,
            itemBuilder: (context, index) {
              GamingSortSelectModel model = state.sortSelects[index];
              bool isSelect =
                  model.description! == state.selectSortDescription.value;
              if (state.selectSortDescription.value.isEmpty && index == 0) {
                isSelect = true;
              }
              return InkWell(
                onTap: () {
                  if (isSelect) {
                    return;
                  }
                  controller.changeSort(model.description);
                  Get.back<dynamic>();
                },
                child: SizedBox(
                  height: 50.dp,
                  child: Row(
                    children: [
                      Gaps.hGap16,
                      SvgPicture.asset(
                        'assets/images/game/sort_${model.code}.svg',
                        width: 18.dp,
                        height: 18.dp,
                        color: isSelect
                            ? GGColors.link.color
                            : GGColors.textMain.color,
                      ),
                      Gaps.hGap8,
                      Text(
                        model.description ?? '',
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: isSelect
                              ? GGColors.link.color
                              : GGColors.textMain.color,
                        ),
                      ),
                      const Spacer(),
                      Visibility(
                        visible: isSelect,
                        child: SvgPicture.asset(
                          R.iconVerifySuccessful,
                          width: 10.dp,
                          height: 10.dp,
                          color: GGColors.link.color,
                        ),
                      ),
                      Gaps.hGap16,
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}
