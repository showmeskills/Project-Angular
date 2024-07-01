import 'package:flutter/material.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/euro_theme/views/diagonal_path_clipper.dart';
import 'package:gogaming_app/widget_header.dart';
import '../../R.dart';
import '../../common/service/merchant_service/merchant_service.dart';
import '../../common/widgets/appbar/appbar.dart';
import 'euro_theme_logic.dart';

class EuroThemePage extends BaseView<EuroThemeLogic> {
  const EuroThemePage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () {
        return const EuroThemePage();
      },
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userAppbar();
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  bool resizeToAvoidBottomInset() => false;

  @override
  Color? backgroundColor() => GGColors.menuBackground.color;

  @override
  Widget body(BuildContext context) {
    Get.put(EuroThemeLogic());
    return Stack(
      children: [
        Positioned.fill(
          child: _buildBack(),
        ),
        Positioned.fill(
          child: SingleChildScrollView(
            child: Column(
              children: [
                _buildContent(),
                GamingImage.asset(
                  R.themeFooter,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildContent() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 18.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap10,
          _buildBanner(),
          Gaps.vGap16,
          _buildTitle(
            controller.state.isChinese.value ? "小组赛分组" : "Group",
          ),
          Gaps.vGap16,
          SizedBox(
            width: double.infinity,
            child: Wrap(
              spacing: 10.dp,
              runSpacing: 10.dp,
              children: controller.state.groups.asMap().entries.map((entry) {
                final index = entry.key;
                final value = entry.value;
                final title = controller.state.isChinese.value
                    ? value['tt'].toString()
                    : value['entt'].toString();
                final list = value['list'];
                return SizedBox(
                  width: ((Get.width - 46.dp) / 2).floorToDouble(),
                  child: _buildGroupItem(
                    topColor: _itemTopColor(index),
                    title: title,
                    titleColor: _itemTitleColor(index),
                    models: list as List<Map<String, dynamic>>?,
                  ),
                );
              }).toList(),
            ),
          ),
          _buildMatchSchedule(),
          _buildTitle(
            controller.state.isChinese.value ? "淘汰赛战况" : "Knockout Round",
          ),
          Gaps.vGap16,
          GamingImage.network(
            url: ThemeManager.sharedInstance.isDarkMode
                ? controller.state.euro2024TreeDark1
                : controller.state.euro2024Tree1,
            fit: BoxFit.cover,
          ),
          Gaps.vGap16,
          GamingImage.network(
            url: ThemeManager.sharedInstance.isDarkMode
                ? controller.state.euro2024TreeDark2
                : controller.state.euro2024Tree2,
            fit: BoxFit.cover,
          ),
        ],
      ),
    );
  }

  Widget _buildBack() {
    if (MerchantService
            .sharedInstance.merchantConfigModel?.config?.isEuropeanCup ==
        true) {
      return Stack(
        children: [
          Positioned.fill(
            child: GamingImage.asset(
              R.homeEuropeanBg,
              fit: BoxFit.cover,
            ),
          ),
          Positioned.fill(
            child: Container(
              color: GGColors.background.color.withOpacity(0.6),
            ),
          ),
        ],
      );
    }
    return Container();
  }

  Widget _buildMatchSchedule() {
    if (controller.state.euro2024MatchSchedule?.isEmpty ?? false) {
      return Container();
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap16,
        _buildTitle(
          controller.state.isChinese.value ? "小组赛日程" : "Match Schedule",
        ),
        Gaps.vGap16,
        SizedBox(
          width: double.infinity,
          child: Wrap(
            spacing: 10.dp,
            runSpacing: 16.dp,
            children:
                controller.state.euro2024MatchSchedule?.entries.map((entry) {
                      final key = entry.key;
                      return _buildMatchScheduleItem(key);
                    }).toList() ??
                    [],
          ),
        ),
        Gaps.vGap16,
        _buildMatchScheduleInfo(),
      ],
    );
  }

  Widget _buildMatchScheduleInfo() {
    return Obx(() {
      final info = controller.state.euro2024MatchSchedule?[
          controller.state.selectScheduleGroup.value] as List;
      return Column(
        children: info.map((e) {
          return SizedBox(
            width: double.infinity,
            child: Column(
              children: [
                _buildMatchScheduleInfoItem(e),
                Gaps.vGap16,
              ],
            ),
          );
        }).toList(),
      );
    });
  }

  Widget _buildMatchScheduleInfoItem(dynamic info) {
    return ClipRRect(
      borderRadius: BorderRadius.all(Radius.circular(16.dp)),
      child: Stack(
        children: [
          AspectRatio(
            aspectRatio: 2.77,
            child: GamingImage.asset(
              R.themeScheduleBg,
              fit: BoxFit.cover,
            ),
          ),
          Positioned.fill(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMatchScheduleInfoCountryItem(
                  controller.state.isChinese.value
                      ? info['teamA'].toString()
                      : info['enTeamA'].toString(),
                  info['enTeamA'].toString(),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      info['date'].toString(),
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: GGColors.buttonTextWhite.color,
                      ),
                    ),
                    Text(
                      info['time'].toString(),
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: GGColors.buttonTextWhite.color,
                      ),
                    ),
                    Text(
                      info['score'].toString(),
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: GGColors.buttonTextWhite.color,
                      ),
                    )
                  ],
                ),
                _buildMatchScheduleInfoCountryItem(
                  controller.state.isChinese.value
                      ? info['teamB'].toString()
                      : info['enTeamB'].toString(),
                  info['enTeamB'].toString(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMatchScheduleInfoCountryItem(String name, String enName) {
    final icon = 'assets/images/theme/$enName.png';

    /// 处理土耳其国家名称
    if (name == 'Turkiye') {
      name = 'Türkiye';
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Gaps.vGap20,
        GamingImage.asset(
          icon,
          width: 60.dp,
        ),
        Gaps.vGap10,
        Text(
          name,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.buttonTextWhite.color,
          ),
        ),
      ],
    );
  }

  Widget _buildMatchScheduleItem(String key) {
    return Obx(() {
      return ScaleTap(
        onPressed: () {
          controller.state.selectScheduleGroup.value = key;
        },
        child: Container(
          width: ((Get.width - 56.dp) / 3).floorToDouble(),
          height: 40.dp,
          decoration: BoxDecoration(
            color: key == controller.state.selectScheduleGroup.value
                ? GGColors.brand.color
                : GGColors.gameTabBarActiveColor.color,
            borderRadius: BorderRadius.all(Radius.circular(40.dp)),
          ),
          alignment: Alignment.center,
          child: Text(
            controller.state.isChinese.value
                ? "小组 ${key.toUpperCase()}"
                : "GROUP ${key.toUpperCase()}",
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: key == controller.state.selectScheduleGroup.value
                  ? GGColors.buttonTextWhite.color
                  : GGColors.textMain.color,
            ),
          ),
        ),
      );
    });
  }

  Widget _buildTitle(String title) {
    return Text(
      title,
      style: GGTextStyle(
        fontSize: GGFontSize.bigTitle,
        color: GGColors.textMain.color,
        fontWeight: GGFontWeigh.bold,
      ),
    );
  }

  Color _itemTopColor(int index) {
    if (index == 0) {
      return const Color(0xFF002B93);
    } else if (index == 1) {
      return const Color(0xFF02B95E);
    } else if (index == 2) {
      return const Color(0xFFFE0000);
    } else if (index == 3) {
      return const Color(0xFFFFCA00);
    } else if (index == 4) {
      return const Color(0xFFF1F0F0);
    } else if (index == 5) {
      return const Color(0xFF000000);
    }
    return Colors.transparent;
  }

  Color _itemTitleColor(int index) {
    if (index == 4) {
      return const Color(0xFF000000);
    }
    return Colors.white;
  }

  Widget _buildBanner() {
    return ClipRRect(
      borderRadius: BorderRadius.all(Radius.circular(16.dp)),
      child: Stack(
        children: [
          GamingImage.asset(
            R.themeEuroBg,
          ),
          SizedBox(
            width: double.infinity,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Gaps.vGap24,
                GamingImage.asset(
                  R.themeEuroIcon,
                  width: 87.dp,
                ),
                Gaps.vGap10,
                Text(
                  controller.state.isChinese.value
                      ? "2024 欧洲国家杯"
                      : "European Cup Schedule",
                  style: GGTextStyle(
                    fontSize: GGFontSize.bigTitle20,
                    color: GGColors.buttonTextWhite.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
                Gaps.vGap20,
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20.dp),
                  child: Text(
                    controller.state.isChinese.value
                        ? "四年一度的欧洲足球列强盛世，盛大开幕，竞争最高荣耀"
                        : "Exciting events planned in advance",
                    textAlign: TextAlign.center,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.buttonTextWhite.color,
                      fontWeight: GGFontWeigh.bold,
                    ),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildGroupItem({
    required Color topColor,
    required String title,
    required Color titleColor,
    List<Map<String, dynamic>>? models,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.all(Radius.circular(16.dp)),
      child: Container(
        color: const Color(0xFF143DDA),
        child: Column(
          children: [
            ClipPath(
              clipper: DiagonalPathClipper(),
              child: Container(
                height: 50.dp,
                width: double.infinity,
                color: topColor,
                alignment: Alignment.center,
                child: Text(
                  title,
                  style: GGTextStyle(
                    fontSize: GGFontSize.bigTitle20,
                    color: titleColor,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ),
            ),
            Gaps.vGap10,
            Column(
              children: models!.map((e) {
                final icon = 'assets/images/theme/${e['enName']}.png';
                final title = controller.state.isChinese.value
                    ? e['name'].toString()
                    : e['enName'].toString();
                return Column(
                  children: [
                    _buildCountryItem(icon, title),
                    Gaps.vGap10,
                  ],
                );
              }).toList(),
            ),
            Gaps.vGap10,
          ],
        ),
      ),
    );
  }

  Widget _buildCountryItem(String icon, String title) {
    /// 处理土耳其国家名称
    if (title == 'Turkiye') {
      title = 'Türkiye';
    }
    return Row(
      children: [
        Gaps.hGap30,
        GamingImage.asset(
          icon,
          width: 25.dp,
        ),
        Gaps.hGap10,
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: Colors.white,
          ),
        )
      ],
    );
  }
}
