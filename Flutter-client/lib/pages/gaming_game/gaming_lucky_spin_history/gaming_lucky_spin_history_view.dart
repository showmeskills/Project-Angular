import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../R.dart';
import '../../../common/api/account/models/gaming_user_model.dart';
import '../../../common/api/lucky_spin/models/game_lucky_spin_history_model.dart';
import '../../../common/widgets/gaming_image/gaming_image.dart';
import 'gaming_lucky_spin_history_logic.dart';
import 'package:gogaming_app/widget_header.dart';
import 'gaming_lucky_spin_history_state.dart';

class GamingLuckySpinHistoryView extends GetView<GamingLuckySpinHistoryLogic> {
  final BuildContext context;
  final double height;
  GamingLuckySpinHistoryState get state =>
      Get.find<GamingLuckySpinHistoryLogic>().state;
  GamingLuckySpinHistoryLogic get logic =>
      Get.find<GamingLuckySpinHistoryLogic>();

  const GamingLuckySpinHistoryView({
    super.key,
    required this.context,
    required this.height,
  });

  @override
  Widget build(BuildContext context) {
    Get.put(GamingLuckySpinHistoryLogic());
    return Container(
      width: 349.dp,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20.dp),
        gradient: const LinearGradient(
          colors: [
            Color(0xFF0F1E29),
            Color(0xFF1D5F8C),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Column(
        children: [
          Gaps.vGap10,
          _buildTitle(context),
          Gaps.vGap20,
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 8.dp),
            child: _buildHeader(),
          ),
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 8.dp),
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
      height: 60.dp,
      child: Row(
        children: [
          Gaps.hGap8,
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
                  24.dp,
                  24.dp,
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
                  width: 24.dp,
                  height: 24.dp,
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
      width: 103.dp,
      child: child,
    );
  }

  List<Widget> _buildItems() {
    List<Widget> result = <Widget>[];
    for (int i = 0; i < state.dataList.length; i++) {
      result.add(_buildCell(
          state.dataList[i],
          i % 2 == 0
              ? const Color(0xFF1D5F8C).withOpacity(0.1)
              : const Color(0xFF0F1E29).withOpacity(0.1)));
    }
    return result;
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      height: 35.dp,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Color(0xFF1D5F8C),
            Color(0xFF0F1E29),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Gaps.hGap8,
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
          Gaps.hGap8,
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
              Get.delete<GamingLuckySpinHistoryLogic>();
              Navigator.of(context).pop();
            },
            child: SvgPicture.asset(
              R.iconClose,
              height: 18.dp,
              color: GGColors.buttonTextWhite.color.withOpacity(0.2),
            ),
          ),
          Gaps.hGap10,
        ],
      ),
    );
  }
}
