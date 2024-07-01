// ignore_for_file: dead_code

import 'package:base_framework/base_controller.dart';
import 'package:base_framework/src.widget/scale_tap.dart';
import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/pages/gaming_game/gaming_lucky_spin_dialog.dart';
import 'package:gogaming_app/pages/main_menu/main_menu_cell/main_menu_cell_view.dart';
import 'package:gogaming_app/pages/main_menu/main_menu_section/main_menu_section_view.dart';
import 'package:gogaming_app/pages/main_menu/main_menu_state.dart';

import '../../common/api/game/models/gaming_game_scenes_model.dart';
import '../../common/api/language/models/gaming_language.dart';
import '../../common/lang/locale_lang.dart';
import '../../common/service/web_url_service/web_url_model.dart';
import '../../common/service/web_url_service/web_url_service.dart';
import '../../common/theme/text_styles/gg_text_styles.dart';
import '../../common/widgets/gaming_image/gaming_image.dart';
import '../../common/widgets/gaming_selector/gaming_selector.dart';
import '../../config/gaps.dart';
import '../../generated/r.dart';
import '../../router/app_pages.dart';
import '../base/base_view.dart';
import 'main_menu_cell/main_menu_day_night_cell.dart';
import 'main_menu_logic.dart';

class _MainMenuAnimationWidget extends StatefulWidget {
  final double width;
  final void Function()? onPressed;

  const _MainMenuAnimationWidget(
      {required this.width, required this.onPressed});

  @override
  _MainMenuAnimationState createState() => _MainMenuAnimationState();
}

class _MainMenuAnimationState extends State<_MainMenuAnimationWidget>
    with TickerProviderStateMixin {
  late final AnimationController repeatController;
  late final Animation<double> animation;

  @override
  void initState() {
    super.initState();

    repeatController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat();

    animation = Tween<double>(begin: 0, end: 1).animate(repeatController);
  }

  @override
  void dispose() {
    repeatController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.width,
      height: 60.dp,
      child: ScaleTap(
        onPressed: () {
          widget.onPressed?.call();
        },
        opacityMinValue: 0.8,
        scaleMinValue: 0.98,
        child: Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(4),
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF1D3647),
                    Color(0xFF7900D8),
                  ],
                  stops: [
                    0.06,
                    1.3,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.topRight,
                ),
              ),
            ),
            Container(
              constraints: BoxConstraints(
                maxWidth: widget.width * 0.6,
              ),
              padding: EdgeInsets.symmetric(horizontal: 8.dp),
              alignment: Alignment.centerLeft,
              child: Text(
                localized('luck_spin'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.buttonTextWhite.color,
                  fontWeight: GGFontWeigh.bold,
                  height: 1.6,
                ),
              ),
            ),
            Positioned(
              right: -50.dp,
              top: -5.dp,
              child: RotationTransition(
                turns: repeatController,
                child: Image.asset(
                  R.mainMenuLuckSpinWheel,
                  height: 100.dp,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MainMenuPage extends BaseView<MainMenuLogic> {
  const MainMenuPage({super.key});

  MainMenuState get state => controller.state;

  @override
  Color? backgroundColor() {
    return Config.isM1
        ? GGColors.menuBackground.color
        : GGColors.menuBackground.night;
  }

  @override
  bool? showTopTips() {
    return false;
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return PreferredSize(
      preferredSize:
          Size.fromHeight(MediaQuery.of(context).padding.top + 58.dp),
      child: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              offset: Offset(0, 4.dp),
              blurRadius: 6.dp,
              color:
                  Config.isM1 ? GGColors.shadow.color : GGColors.shadow.night,
            ),
          ],
          color: Config.isM1
              ? GGColors.menuBackground.color
              : GGColors.menuBackground.night,
        ),
        child: Padding(
          padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top, left: 14.dp),
          child: Row(
            children: [
              Expanded(
                child: _buildHeaderMenu(),
              ),
              GestureDetectorHitTestWithoutSizeLimit(
                onTap: () => Get.back<dynamic>(),
                extraHitTestArea: EdgeInsets.all(10.dp),
                child: Container(
                  padding: EdgeInsets.only(
                    left: 14.dp,
                    right: 24.dp,
                    top: 19.dp,
                    bottom: 19.dp,
                  ),
                  child: SvgPicture.asset(
                    R.iconClose,
                    color: Config.isM1
                        ? GGColors.textMain.color
                        : GGColors.textMain.night,
                    width: 14.dp,
                    height: 14.dp,
                  ),
                ),
              ),
              Gaps.vGap24,
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderMenu() {
    return Obx(() {
      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: state.headerMenus.map((element) {
            return _appItem(
              element.icon ?? '',
              element.name ?? '',
              onPressed: () => controller.pressHeaderMenu(element),
            );
          }).toList(),
        ),
      );
    });
  }

  Widget _appItem(String icon, String title, {VoidCallback? onPressed}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(25),
        child: Container(
          padding: EdgeInsets.all(10.dp),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              GamingImage.network(
                url: icon,
                width: 14.dp,
                height: 14.dp,
                color: Config.isM1
                    ? GGColors.menuAppBarIconColor.color
                    : GGColors.menuAppBarIconColor.night,
              ),
              Gaps.hGap4,
              Text(
                title,
                style: _titleStyle().copyWith(
                  color: Config.isM1
                      ? GGColors.menuAppBarIconColor.color
                      : GGColors.menuAppBarIconColor.night,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(MainMenuLogic());
    return GetBuilder(
      init: controller,
      global: false,
      builder: (GetxController controller) {
        return Stack(
          children: [
            _buildChristmasTree(),
            Positioned.fill(
              child: ListView(
                children: [
                  _buildActivitySection(),
                  Gaps.vGap14,
                  _buildSections(),
                  _buildFootView(),
                  Gaps.safeArea(),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildChristmasTree() {
    if (MerchantService
            .sharedInstance.merchantConfigModel?.config?.isChristmas ==
        true) {
      return Positioned(
        bottom: 0,
        right: 0,
        child: GamingImage.asset(R.homeChristmasTree),
      );
    } else if (MerchantService
            .sharedInstance.merchantConfigModel?.config?.isNewYear ==
        true) {
      return Positioned(
        bottom: 0,
        right: 0,
        child: GamingImage.asset(
            Config.isM1 ? R.homeNewYearGif1 : R.homeNewYearGif2),
      );
    }
    return Container();
  }

  Widget inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 16.dp,
        end: end ?? 16.dp,
      ),
      child: child,
    );
  }

  Widget _buildSections() {
    return Obx(() {
      if (state.leftMenus.isEmpty) {
        return Gaps.empty;
      }
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: state.leftMenus.map((element) {
          final cells = <MainMenuCell>[];
          if (element.enableFavorites ?? false) {
            cells.add(
              MainMenuCell(
                title: localized("my_coll"),
                iconPath: R.mainMenuMyCollect,
                onPressed: controller.pressFavoriteGame,
                badgeNumber: state.favoriteGameCount.value,
              ),
            );
          }
          if (element.enableRecentlyPlayed ?? false) {
            cells.add(
              MainMenuCell(
                title: localized("all_rec"),
                iconPath: R.mainMenuRecentPlayed,
                onPressed: controller.pressRecentGame,
                badgeNumber: state.recentGameCount.value,
              ),
            );
          }

          /// 添加分割线
          if (cells.isNotEmpty) {
            final lastCell = cells.removeLast();
            cells.add(lastCell.copyWith(showBottomLine: true));
          }

          for (GameScenseHeaderMenuItem item in element.infoExpandList ?? []) {
            cells.add(
              MainMenuCell(
                title: item.labelName ?? '',
                iconPath: item.menuIcon ?? '',
                fontWeight: GGFontWeigh.bold,
                onPressed: () => controller.pressScenseItem(item),
                textColor: element == state.leftMenus.first
                    ? GGColors.link.color
                    : null,
              ),
            );
          }

          /// 添加分割线
          if (cells.isNotEmpty) {
            final lastCell = cells.removeLast();
            cells.add(lastCell.copyWith(showBottomLine: true));
          }
          return MainMenuSection(
            title: element.name ?? '',
            initiallyExpanded: element == state.leftMenus.first,
            enableExpand: element.redirectMethod == "DropDownList",
            children: cells,
            onTap: () {
              controller.pressScenseLeftMenu(element);
            },
          );
        }).toList(),
      );
    });
  }

  Widget _buildActivitySectionItem({
    required double width,
    required List<Color> colors,
    required String title,
    required String icon,
    required void Function() onPressed,
    Widget? frontWidget,
  }) {
    return SizedBox(
      width: width,
      height: 60.dp,
      child: ScaleTap(
        onPressed: onPressed,
        opacityMinValue: 0.8,
        scaleMinValue: 0.98,
        child: Stack(
          children: [
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(4),
                gradient: LinearGradient(
                  colors: colors,
                  stops: const [
                    0.06,
                    1.3,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.topRight,
                ),
              ),
            ),
            Container(
              constraints: BoxConstraints(
                maxWidth: width * 0.6,
              ),
              padding: EdgeInsets.symmetric(horizontal: 8.dp),
              alignment: Alignment.centerLeft,
              child: Text(
                title,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.buttonTextWhite.color,
                  fontWeight: GGFontWeigh.bold,
                  height: 1.6,
                ),
              ),
            ),
            Positioned(
              right: 0.dp,
              top: 0.dp,
              child: Image.asset(
                icon,
                height: 60.dp,
              ),
            ),
            frontWidget ?? Container(),
          ],
        ),
      ),
    );
  }

  Widget _buildActivitySection() {
    return Padding(
      padding: EdgeInsets.only(left: 24.dp, right: 24.dp, top: 10.dp),
      child: LayoutBuilder(builder: (context, constraints) {
        return Obx(() {
          List<Widget> children = [
            if (state.showTodayRace.value)
              _buildActivitySectionItem(
                width: double.infinity,
                colors: [
                  const Color(0xFF1D3647),
                  const Color(0xFF1EAB13),
                ],
                title: localized('daily_races'),
                icon: R.mainMenuDailyContestIcon,
                onPressed: _pressDailyContest,
              ),
            if (state.showRecentActivity.value)
              _buildActivitySectionItem(
                width: double.infinity,
                colors: [
                  const Color(0xFF471D1D),
                  const Color(0xFFD8004E),
                ],
                title: localized('free_guess'),
                icon: R.mainMenuFreeGuessIcon,
                onPressed: _pressFreeGuess,
              ),
            if (state.showLuckySpin.value)
              _MainMenuAnimationWidget(
                width: double.infinity,
                onPressed: _pressLuckySpin,
              ),
            if (state.showTournament.value)
              _buildActivitySectionItem(
                width: double.infinity,
                colors: [
                  const Color(0xFF351D47),
                  const Color(0xFFBB09A6),
                ],
                title: localized('tournament'),
                icon: R.mainMenuTournamentIcon,
                onPressed: _pressTournament,
              ),
          ];
          final width = ((constraints.maxWidth - 10.dp) ~/ 2).toDouble();

          /// 只有两个的时候需要特殊处理样式
          children = List.generate(children.length, (index) {
            return SizedBox(
              width: children.length == 2
                  ? width
                  : (index % 3 == 0 ? double.infinity : width),
              child: children[index],
            );
          });
          return Wrap(
            spacing: 10.dp,
            runSpacing: 10.dp,
            children: children,
          );
        });
      }),
    );
  }

  Widget _buildFootView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => controller.pressNewCoupon(),
          child: Container(
            padding: EdgeInsets.symmetric(vertical: 10.dp, horizontal: 24.dp),
            child: Text(
              localized("new_coupon"),
              style: _titleStyle(),
            ),
          ),
        ),
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => controller.pressH5CS(),
          child: Container(
            padding: EdgeInsets.symmetric(vertical: 10.dp, horizontal: 24.dp),
            child: Text(
              localized("online_cs"),
              style: _titleStyle(),
            ),
          ),
        ),
        Container(
          padding: EdgeInsets.symmetric(vertical: 10.dp, horizontal: 24.dp),
          child: Row(
            children: [
              Text(
                "${localized("lang")}:",
                style: _titleStyle(),
              ),
              Gaps.hGap8,
              Obx(() {
                return _arrowContentWidget(
                    controller.currentLanguage.value.name ?? '',
                    onClickBlock: () => _pressChangeLanguage(),
                    frontWidget: controller.currentLanguage.value.icon.isEmpty
                        ? Container()
                        : Image.asset(
                            controller.currentLanguage.value.icon,
                            width: 19.dp,
                            height: 19.dp,
                          ));
              })
            ],
          ),
        ),
        const MainMenuDayNightCell(),
      ],
    );
  }

  TextStyle _titleStyle() {
    return GGTextStyle(
      fontSize: GGFontSize.content,
      color: Config.isM1
          ? GGColors.textMain.color
          : GGColors.menuAppBarIconColor.night,
      fontWeight: GGFontWeigh.bold,
    );
  }

  Widget _arrowContentWidget(String content,
      {Color? textColor,
      Widget? frontWidget,
      required void Function() onClickBlock}) {
    return GestureDetectorHitTestWithoutSizeLimit(
      extraHitTestArea: EdgeInsets.all(15.dp),
      onTap: () {
        onClickBlock.call();
      },
      child: Row(
        children: [
          frontWidget ?? Container(),
          if (frontWidget != null) Gaps.hGap8,
          Text(
            content,
            style: _titleStyle().copyWith(
              color: (textColor ??
                  (Config.isM1
                      ? GGColors.textMain.color
                      : GGColors.menuAppBarIconColor.night)),
            ),
          ),
          Gaps.hGap6,
          SvgPicture.asset(
            R.appbarAppbarArrowDown,
            width: 12.dp,
            fit: BoxFit.cover,
            color: Config.isM1
                ? GGColors.textMain.color
                : GGColors.menuAppBarIconColor.night,
          )
        ],
      ),
    );
  }
}

extension _Action on MainMenuPage {
  void _pressDailyContest() {
    Get.offAndToNamed<void>(Routes.dailyContestRank.route);
  }

  void _pressFreeGuess() {
    H5WebViewManager.sharedInstance.openWebView(
      url: WebUrlService.url(WebUrl.freeGuessActivity.toTarget()),
      title: localized('free_guess'),
      replace: true,
    );
  }

  void _pressLuckySpin() {
    /// 跳转到幸运转盘
    Get.back<void>();
    GamingLuckySpinDialog().showGamingLuckySpin();
  }

  void _pressTournament() {
    Get.offAndToNamed<void>(Routes.tournament.route);
  }

  void _pressChangeLanguage() {
    controller.pressSetLanguage(onSucessCallBack: () {
      final controller = this.controller;
      _showSheet(
        localized("language_select"),
        controller.optionalLanguages,
        controller.currentLanguage.value,
        (content) {
          controller.changeLanguage(content);
        },
      );
    });
  }

  void _showSheet(
    String title,
    List<GamingLanguage> contentList,
    GamingLanguage currentSelect,
    void Function(GamingLanguage content) selectContent,
  ) {
    final highlightButton = Config.isM1
        ? GGColors.highlightButton.color
        : GGColors.highlightButton.night;
    final textMain = Config.isM1
        ? GGColors.textMain.color
        : GGColors.menuAppBarIconColor.night;

    GamingSelector.simple<GamingLanguage>(
      title: title,
      useCloseButton: false,
      centerTitle: true,
      fixedHeight: false,
      original: contentList,
      itemBuilder: (context, e, index) {
        return InkWell(
          onTap: () {
            Get.back<void>();
            if (e.code == currentSelect.code) {
              return;
            }
            selectContent(e);
          },
          child: SizedBox(
            height: 50.dp,
            child: Center(
              child: Text(
                localized(e.name ?? ''),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: e.code?.split("-").first.toLowerCase() ==
                          currentSelect.code
                      ? highlightButton
                      : textMain,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
