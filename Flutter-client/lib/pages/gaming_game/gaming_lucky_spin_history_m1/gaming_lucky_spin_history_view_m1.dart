import 'package:flutter/material.dart';
import 'package:gogaming_app/pages/gaming_game/gaming_lucky_spin_m1/views/luck_spin_bg_view.dart';
import 'package:intl/intl.dart';
import '../../../R.dart';
import '../../../common/api/account/models/gaming_user_model.dart';
import '../../../common/api/lucky_spin/models/game_lucky_spin_history_model.dart';
import '../../../common/widgets/gaming_image/gaming_image.dart';
import 'gaming_lucky_spin_history_logic_m1.dart';
import 'package:gogaming_app/widget_header.dart';
import 'gaming_lucky_spin_history_state_m1.dart';

class GamingLuckySpinHistoryViewM1
    extends GetView<GamingLuckySpinHistoryLogicM1> {
  final BuildContext context;
  final double height;
  final String title;
  GamingLuckySpinHistoryStateM1 get state =>
      Get.find<GamingLuckySpinHistoryLogicM1>().state;
  GamingLuckySpinHistoryLogicM1 get logic =>
      Get.find<GamingLuckySpinHistoryLogicM1>();

  const GamingLuckySpinHistoryViewM1({
    super.key,
    required this.context,
    required this.height,
    required this.title,
  });

  Color get darkColor => Colors.black.withOpacity(0.2);
  Color get lightColor => Colors.black.withOpacity(0.05);

  @override
  Widget build(BuildContext context) {
    Get.put(GamingLuckySpinHistoryLogicM1());
    return LuckSpinBgView(
      width: 349.dp,
      height: height,
      title: title,
      child: Column(
        children: [
          Gaps.vGap10,
          _buildTitle(context),
          Gaps.vGap20,
          _buildHeader(),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Obx(() {
                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      children: _buildItems(),
                    );
                  }),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildAvatar(double width, double height, String avatar) {
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

  Widget _buildCell(GameLuckySpinHistoryModel model, Color backColor) {
    String format = "HH:mm:ss";
    DateTime aTime = DateTime.fromMillisecondsSinceEpoch(model.drawTime ?? 0);
    String timeStr = DateFormat(format).format(aTime).toString();
    return Container(
      color: backColor,
      height: 50.dp,
      child: Row(
        children: [
          Gaps.hGap10,
          _buildShowArea(
            Text(
              timeStr,
              style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.buttonTextWhite.color),
            ),
          ),
          _buildShowArea(
            Row(
              children: [
                _buildAvatar(
                  20.dp,
                  20.dp,
                  model.userAvatar ?? '',
                ),
                Gaps.hGap4,
                Expanded(
                    child: Text(
                        _showUserName(
                          model.userName ?? '',
                          model.userId ?? '',
                        ),
                        maxLines: 1,
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: GGColors.buttonTextWhite.color,
                        ))),
              ],
            ),
          ),
          _buildShowArea(
            Row(
              children: [
                GamingImage.network(
                  url: model.iconUrl,
                  width: 20.dp,
                  height: 20.dp,
                ),
                Gaps.hGap4,
                Expanded(
                    child: Text(model.prizeText,
                        maxLines: 1,
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: GGColors.buttonTextWhite.color,
                        ))),
              ],
            ),
          ),
          Gaps.hGap8,
        ],
      ),
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

  Widget _buildShowArea(Widget child) {
    return SizedBox(
      width: 100.dp,
      child: child,
    );
  }

  List<Widget> _buildItems() {
    List<Widget> result = <Widget>[];
    for (int i = 0; i < state.dataList.length; i++) {
      result.add(_buildCell(
        state.dataList[i],
        i % 2 == 0 ? lightColor : darkColor,
      ));
    }
    return result;
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      height: 35.dp,
      decoration: BoxDecoration(
        color: darkColor,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Gaps.hGap10,
          Expanded(
            child: Text(
              localized("date"),
              style: GGTextStyle(
                fontSize: GGFontSize.content, //GGFontSize.smallTitle,
                color: GGColors.buttonTextWhite.color,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
          ),
          Expanded(
            child: Text(
              localized("gamer"),
              style: GGTextStyle(
                fontSize: GGFontSize.content, //GGFontSize.smallTitle,
                color: GGColors.buttonTextWhite.color,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
          ),
          Expanded(
            child: Text(
              localized("prizes"),
              style: GGTextStyle(
                fontSize: GGFontSize.content, //GGFontSize.smallTitle,
                color: GGColors.buttonTextWhite.color,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
          ),
          Gaps.hGap10,
        ],
      ),
    );
  }

  Widget _buildTitle(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.dp),
      width: double.infinity,
      child: Row(
        children: [
          Gaps.hGap10,
          Expanded(
            child: Text(
              localized("whe_prize_h"),
              textAlign: TextAlign.center,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.buttonTextWhite.color,
              ),
            ),
          ),
          InkWell(
            onTap: () {
              Get.delete<GamingLuckySpinHistoryLogicM1>();
              Navigator.of(context).pop();
            },
            child: SvgPicture.asset(
              R.iconClose,
              height: 18.dp,
              color: GGColors.buttonTextWhite.color,
            ),
          ),
          Gaps.hGap10,
        ],
      ),
    );
  }
}
