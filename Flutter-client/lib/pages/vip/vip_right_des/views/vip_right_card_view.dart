import 'package:flutter/material.dart';
import 'package:flutter_layout_grid/flutter_layout_grid.dart';
import 'package:gogaming_app/common/api/vip/models/gaming_vip_benefits_model.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/widget_header.dart';

class VipRightCardView extends StatelessWidget {
  const VipRightCardView({
    Key? key,
    required this.vipLevel,
    required this.model,
  }) : super(key: key);

  final int vipLevel;

  /// 升级数据
  String get upgradeValue =>
      model.promotionLevel(vipLevel)?.points?.getFormatPoint() ?? '';

  String get upgradeTime =>
      '${model.promotionLevel(vipLevel)?.period.toString() ?? '0'} ${localized('day')}';

  /// 保级数据
  String get keepValue =>
      model.keepLevel(vipLevel)?.points?.getFormatPoint() ?? '';

  String get keepTime =>
      '${model.keepLevel(vipLevel)?.period.toString() ?? '0'} ${localized('day')}';
  final GamingVipBenefitsModel model;

  Color get textColor => const Color(0xFFF6CC9F);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: Image.asset(
            'assets/images/vip/vip_right_v$vipLevel.png',
            fit: BoxFit.fill,
          ),
        ),
        ConstrainedBox(
          constraints: BoxConstraints(
            minWidth: 343.dp,
            maxWidth: 343.dp,
            // minHeight: 606.dp,
            minHeight: 740.dp,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(height: 154.dp),
              _buildLevel(),
              SizedBox(height: 10.dp),
              _buildRequire(),
              SizedBox(height: 15.dp),
              Row(
                children: [
                  Gaps.hGap16,
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: _buildGridView(),
                    ),
                  ),
                  Gaps.hGap16,
                ],
              ),
              SizedBox(height: 16.dp),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildGridView() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        benefitRow(),
        SizedBox(height: 2.dp),
        _buildLoginWithdraw(),
        if (!Config.sharedInstance.environment.hideVipRescue)
          Container(
            margin: EdgeInsets.only(top: 2.dp),
            child: _buildRescue(),
          ),
        SizedBox(height: 2.dp),
        _buildDepo(),
        SizedBox(height: 2.dp),
        _buildRebate1(),
        SizedBox(height: 2.dp),
        _buildRebate2(),
      ],
    );
  }

  Widget _buildRebate2() {
    return LayoutGrid(
      rowGap: 3,
      columnGap: 2,
      areas: '''
            agent_return_lottery    chess_re
            agent_return_lottery_v  chess_re_v
            daily_return_limit      daily_return_limit_v

          ''',
      // A number of extension methods are provided for concise track sizing
      columnSizes: [1.fr, 1.fr],
      rowSizes: const [auto, auto, auto],
      children: [
        _buildLightTitle(localized('agent_return_lottery'))
            .inGridArea('agent_return_lottery'),
        _buildLightTitle(localized('chess_re')).inGridArea('chess_re'),
        _buildValueText('${model.returnBonusLevel(vipLevel)?.lotteryReturn} %')
            .inGridArea('agent_return_lottery_v'),
        _buildValueText('${model.returnBonusLevel(vipLevel)?.cardReturn} %')
            .inGridArea('chess_re_v'),
        _buildYellowTitle(
          localized('daily_return_limit'),
          titleColor: Colors.white,
        ).inGridArea('daily_return_limit'),
        _buildValueText(
                '${model.returnBonusLevel(vipLevel)?.limitMoney?.getFormatPoint()} USDT*')
            .inGridArea('daily_return_limit_v'),
      ],
    );
  }

  Widget _buildRebate1() {
    return LayoutGrid(
      rowGap: 3,
      columnGap: 3,
      areas: '''
            trade_return    trade_return    trade_return
            s_re            real_re         ca_re
            s_re_v          real_re_v       ca_re_v       
          ''',
      // A number of extension methods are provided for concise track sizing
      columnSizes: [1.fr, 1.fr, 1.fr],
      rowSizes: const [auto, auto, auto],
      children: [
        _buildLightTitle(localized('trade_return')).inGridArea('trade_return'),
        _buildLightTitle(localized('s_re')).inGridArea('s_re'),
        _buildValueText('${model.returnBonusLevel(vipLevel)?.sportsReturn} %')
            .inGridArea('s_re_v'),
        _buildLightTitle(localized('real_re')).inGridArea('real_re'),
        _buildValueText('${model.returnBonusLevel(vipLevel)?.personReturn} %')
            .inGridArea('real_re_v'),
        _buildLightTitle(localized('ca_re')).inGridArea('ca_re'),
        _buildValueText('${model.returnBonusLevel(vipLevel)?.casinoCashback} %')
            .inGridArea('ca_re_v'),
      ],
    );
  }

  Widget _buildDepo() {
    return LayoutGrid(
      rowGap: 2,
      columnGap: 2,
      areas: '''
            depo_week     depo_week
            depo_week_t   depo_week_t_v
            depo_week_c   depo_week_c_v
          ''',
      // A number of extension methods are provided for concise track sizing
      columnSizes: [1.fr, 1.fr],
      rowSizes: const [auto, auto, auto],
      children: [
        _buildLightTitle(localized('depo_week')).inGridArea('depo_week'),
        _buildYellowTitle(localized('depo_week_t')).inGridArea('depo_week_t'),
        _buildValueText('${model.depositBenefitLevel(vipLevel)?.bonusRate} %')
            .inGridArea('depo_week_t_v'),
        _buildYellowTitle(localized('depo_week_c')).inGridArea('depo_week_c'),
        _buildValueText(
                '${model.depositBenefitLevel(vipLevel)?.bonusMax?.getFormatPoint()} USDT*')
            .inGridArea('depo_week_c_v'),
      ],
    );
  }

  Widget _buildRescue() {
    return LayoutGrid(
      rowGap: 2,
      columnGap: 2,
      areas: '''
            rescue_money  rescue_money
            rescue_limit  rescue_limit_v
            rescue_cap    rescue_cap_v
          ''',
      // A number of extension methods are provided for concise track sizing
      columnSizes: [1.fr, 1.fr],
      rowSizes: const [auto, auto, auto],
      children: [
        _buildLightTitle(localized('rescue_money')).inGridArea('rescue_money'),
        _buildYellowTitle(localized('rescue_limit')).inGridArea('rescue_limit'),
        _buildValueText('${model.rescueMoneyLevel(vipLevel)?.amount} %')
            .inGridArea('rescue_limit_v'),
        _buildYellowTitle(localized('rescue_cap')).inGridArea('rescue_cap'),
        _buildValueText(
                '${model.rescueMoneyLevel(vipLevel)?.amountMax?.getFormatPoint()} USDT*')
            .inGridArea('rescue_cap_v'),
      ],
    );
  }

  Widget _buildLoginWithdraw() {
    return LayoutGrid(
      rowGap: 2,
      columnGap: 2,
      areas: '''
            login_red     withdrawal
            login_red_v   withdrawal_v
          ''',
      // A number of extension methods are provided for concise track sizing
      columnSizes: [1.fr, 1.fr],
      rowSizes: const [auto, auto],
      children: [
        _buildLightTitle(localized('login_red')).inGridArea('login_red'),
        _buildLightTitle(localized('withdrawal')).inGridArea('withdrawal'),
        _buildValueText(
                '${model.loginRedPackageLevel(vipLevel)?.amount?.getFormatPoint()} USDT')
            .inGridArea('login_red_v'),
        _buildValueText(
                '${model.returnBonusLevel(vipLevel)?.dayWithdrawLimitMoney} X')
            .inGridArea('withdrawal_v'),
      ],
    );
  }

  Widget benefitRow() {
    return LayoutGrid(
      rowGap: 2,
      columnGap: 2,
      areas: '''
            pro_bene    rege_bene      birthday_gif
            pro_bene_v  rege_bene_v    birthday_gif_v
          ''',
      // A number of extension methods are provided for concise track sizing
      columnSizes: [1.fr, 1.fr, 1.fr],
      rowSizes: const [auto, auto],
      children: [
        _buildLightTitle(localized('birthday_gif')).inGridArea('birthday_gif'),
        _buildLightTitle(localized('pro_bene')).inGridArea('pro_bene'),
        _buildLightTitle(localized('rege_bene')).inGridArea('rege_bene'),
        _buildValueText(
                '${model.birthdayBenefitLevel(vipLevel)?.amount?.getFormatPoint()} USDT')
            .inGridArea('birthday_gif_v'),
        _buildValueText(
                '${model.promotionBenefitLevel(vipLevel)?.amount?.getFormatPoint()} USDT')
            .inGridArea('pro_bene_v'),
        _buildValueText(
                '${model.keepBenefitLevel(vipLevel)?.amount?.getFormatPoint()} USDT')
            .inGridArea('rege_bene_v'),
      ],
    );
  }

  Widget _buildYellowTitle(String value, {Color? titleColor}) {
    return _buildGridValue(
      Colors.white.withOpacity(0.1),
      value,
      GGTextStyle(
        color: (titleColor ?? textColor).withOpacity(0.6),
        fontSize: GGFontSize.hint,
      ),
    );
  }

  Widget _buildLightTitle(String value) {
    return _buildGridValue(
      Colors.white.withOpacity(0.05),
      value,
      GGTextStyle(
        color: Colors.white.withOpacity(0.6),
        fontSize: GGFontSize.hint,
      ),
    );
  }

  Widget _buildValueText(String value) {
    return _buildGridValue(
      Colors.white.withOpacity(0.1),
      value,
      GGTextStyle(
        color: textColor,
        fontSize: GGFontSize.hint,
        // fontWeight: GGFontWeigh.bold,
      ),
    );
  }

  Widget _buildGridValue(Color background, String value, TextStyle style) {
    return Container(
      color: background,
      alignment: AlignmentDirectional.center,
      constraints: BoxConstraints(minHeight: 24.dp),
      child: Row(
        children: [
          Gaps.hGap8,
          Expanded(
            child: Padding(
              padding: EdgeInsetsDirectional.only(
                top: 3.dp,
                bottom: 3.dp,
              ),
              child: Text(
                value,
                textAlign: TextAlign.center,
                style: style,
              ),
            ),
          ),
          Gaps.hGap8,
        ],
      ),
    );
  }

  Widget _buildRequire() {
    return Row(
      children: [
        Gaps.hGap16,
        SizedBox(width: 26.dp),
        Expanded(
          child: _buildRequireItem(
            localized('up_con'),
            localized('grow_val'),
            upgradeValue,
            upgradeTime,
          ),
        ),
        SizedBox(width: 26.dp),
        Expanded(
          child: _buildRequireItem(
            localized('rele_con'),
            localized('grow_val'),
            keepValue,
            keepTime,
          ),
        ),
        SizedBox(width: 26.dp),
        Gaps.hGap16,
      ],
    );
  }

  Widget _buildRequireItem(
      String require, String title, String value, String time) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          require,
          style: GGTextStyle(
            color: Colors.white.withOpacity(0.5),
            fontSize: GGFontSize.content,
          ),
        ),
        Gaps.vGap4,
        ...[title, value, time]
            .map(
              (e) => Padding(
                padding: EdgeInsetsDirectional.only(bottom: 4.dp),
                child: Text(
                  e,
                  style: GGTextStyle(
                    color: Colors.white,
                    fontSize: GGFontSize.content,
                  ),
                ),
              ),
            )
            .toList(),
      ],
    );
  }

  Widget _buildLevel() {
    return Row(
      children: [
        const Spacer(),
        Text(
          'VIP$vipLevel',
          style: GGTextStyle(
            color: textColor,
            fontSize: GGFontSize.superBigTitle28,
            fontFamily: GGFontFamily.robot,
            fontWeight: GGFontWeigh.bold,
          ),
        ),
        SizedBox(width: 40.dp),
      ],
    );
  }
}
