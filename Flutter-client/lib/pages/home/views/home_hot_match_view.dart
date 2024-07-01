import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import '../../../R.dart';
import '../../../common/api/game/models/gaming_hot_match.dart';
import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../config/gaps.dart';
import '../../../helper/time_helper.dart';
import 'home_hot_match_logic.dart';

class HomeHotMatchView extends StatelessWidget {
  HomeHotMatchView({
    super.key,
    required this.hotMatchModel,
    required this.index,
  }) {
    logic = Get.put(
      HomeHotMatchLogic(hotMatchModel: hotMatchModel),
      tag: hotMatchModel.matchId ?? '',
    );
  }

  final GamingGameHotMatchModel hotMatchModel;
  final int index;

  late final HomeHotMatchLogic logic;

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onPressed: () {
        logic.gotoSport();
      },
      child: Stack(
        children: [
          Positioned.fill(
            child: GamingImage.asset(
              _backImageName(),
              fit: BoxFit.cover,
              radius: 4.dp,
            ),
          ),
          Positioned(
            left: 18.dp,
            right: 18.dp,
            top: 10.dp,
            bottom: 10.dp,
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          hotMatchModel.tournament ?? '',
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.buttonTextWhite.color,
          ),
        ),
        Gaps.vGap10,
        _buildMatchContent(),
      ],
    );
  }

  Widget _buildMatchContent() {
    return Row(
      children: [
        Expanded(
          flex: 1,
          child: _buildTeamWidget(
            teamIcon: hotMatchModel.homeLogo ?? '',
            teamName: hotMatchModel.homeName ?? '',
          ),
        ),
        Gaps.hGap10,
        _buildMatchInfoWidget(),
        Gaps.hGap10,
        Expanded(
          flex: 1,
          child: _buildTeamWidget(
            teamIcon: hotMatchModel.awayLogo ?? '',
            teamName: hotMatchModel.awayName ?? '',
          ),
        ),
      ],
    );
  }

  Widget _buildMatchStageName() {
    if (hotMatchModel.matchType == 1) {
      return Text(
        DateFormat('MM/dd HH:mm')
            .formatTimestamp(hotMatchModel.matchTime?.toInt() ?? 0),
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
          color: GGColors.buttonTextWhite.color,
        ),
      );
    }
    return Column(
      children: [
        Text(
          hotMatchModel.sportId == 2
              ? localized('ob_handicap_name_2')
              : localized('ob_handicap_name_1'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: const Color(0xff22f500),
          ),
        ),
        Gaps.vGap6,
        Obx(() {
          return Text(
            '${hotMatchModel.matchStageName ?? ''} ${logic.matchTimeContent.value}',
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.buttonTextWhite.color,
            ),
          );
        }),
      ],
    );
  }

  Widget _buildMatchInfoWidget() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        _buildMatchStageName(),
        Gaps.vGap6,
        _buildOdds(),
      ],
    );
  }

  Widget _buildOdds() {
    return Row(
      children: [
        _buildOddsItem(hotMatchModel.homeOdds),
        Gaps.hGap4,
        _buildOddsItem(
          hotMatchModel.drawOdds,
          hidden: hotMatchModel.sportId == 2,
        ),
        Gaps.hGap4,
        _buildOddsItem(hotMatchModel.awayOdds),
      ],
    );
  }

  Widget _buildOddsItem(num? odds, {bool hidden = false}) {
    if (hidden) {
      return Gaps.hGap8;
    }
    return ConstrainedBox(
      constraints: BoxConstraints(
        minWidth: 30.dp,
      ),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 4.dp, vertical: 3.dp),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.black.withAlpha(10),
          borderRadius: BorderRadius.all(Radius.circular(4.dp)),
        ),
        child: Text(
          (odds == null || odds == 0) ? '-' : odds.toStringAsFixed(2),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.buttonTextWhite.color,
          ),
        ),
      ),
    );
  }

  Widget _buildTeamWidget(
      {required String teamIcon, required String teamName}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        GamingImage.network(
          url: teamIcon,
          height: (Get.width - 24.dp) * 0.4 * 0.42,
          errorBuilder: (context, error, stack) {
            return Image.asset(
              R.homeHotMatchErrorImg,
              fit: BoxFit.cover,
              height: (Get.width - 24.dp) * 0.4 * 0.42,
            );
          },
        ),
        Gaps.vGap10,
        Text(
          teamName,
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.buttonTextWhite.color,
          ),
        ),
      ],
    );
  }

  String _backImageName() {
    if (index % 3 == 0) {
      return R.homeHotMatch1;
    } else if (index % 3 == 1) {
      return R.homeHotMatch2;
    }
    return R.homeHotMatch3;
  }
}
