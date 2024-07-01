import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/common/widgets/go_gaming_empty.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/game_provider_view.dart';
import '../../common/widgets/gaming_game_image.dart';
import '../../generated/r.dart';
import '../gg_game_list/views/gaming_game_list.dart';
import '../gg_game_list/views/gaming_game_list_footer.dart';
import '../home/views/home_footer.dart';
import 'recent_game_list_logic.dart';
import 'recent_game_list_state.dart';

class RecentGameListPage extends BaseView<RecentGameListLogic> {
  const RecentGameListPage({super.key});

  RecentGameListState get state => controller.state;

  @override
  bool ignoreBottomSafeSpacing() => true;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const RecentGameListPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      title: localized('all_rec'),
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
        Expanded(
          child: Image.asset(
            R.gameGameRecBack,
            height: 80.dp,
            fit: BoxFit.fitHeight,
            alignment: Alignment.centerRight,
          ),
        )
      ],
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(RecentGameListLogic());
    return Scaffold(
      backgroundColor: GGColors.background.color,
      body: SingleChildScrollView(
        child: Column(
          children: [
            Gaps.vGap20,
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
}
