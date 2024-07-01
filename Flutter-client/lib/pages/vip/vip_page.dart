import 'package:card_swiper/card_swiper.dart';
// ignore: implementation_imports
import 'package:card_swiper/src/transformer_page_view/transformer_page_view.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/history/history_type.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_vip_card/gaming_vip_card.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/delegate/base_refresh_view_delegate.dart';
import '../coupon/coupon_home/coupon_home_view.dart';
import '../coupon/coupon_home/coupon_list/logic.dart';
import 'vip_logic.dart';

class VipPage extends StatelessWidget with BaseRefreshViewDelegate {
  const VipPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const VipPage(),
    );
  }

  CouponListLogic get couponLogic => Get.put(CouponListLogic());

  @override
  RefreshViewController get renderController => couponLogic.controller;

  VipLogic get logic => Get.find<VipLogic>();

  VipState get state => logic.state;

  @override
  Color get footerColor {
    return GGColors.popBackground.color;
  }

  @override
  Widget getNoMoreWidget(BuildContext context) {
    return Obx(() {
      if (couponLogic.state.data.value.total == 0) {
        return Container();
      }
      return super.getNoMoreWidget(context);
    });
  }

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return null;
  }

  @override
  Widget? getLoadingWidget(BuildContext context) {
    return null;
  }

  @override
  Widget build(BuildContext context) {
    Get.put(VipLogic());
    return Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: Colors.transparent,
      appBar: GGAppBar.userAppbar(),
      body: Container(
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            stops: [0.01, 0.5, 1],
            colors: [
              Color(0xff142236),
              Color(0xff1b2935),
              Color(0xff031120),
            ],
          ),
        ),
        child: RefreshView(
          delegate: this,
          controller: couponLogic,
          child: SingleChildScrollView(
            physics: const ClampingScrollPhysics(),
            child: Column(
              children: [
                _buildHeader(),
                Gaps.vGap24,
                _buildLevelLocator(),
                Gaps.vGap16,
                _buildVipCard(),
                Gaps.vGap16,
                _buildVipReturn(),
                Gaps.vGap16,
                Obx(() {
                  if (state.benefits == null) {
                    return Container();
                  }
                  return Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 16.dp,
                    ),
                    decoration: BoxDecoration(
                      color: GGColors.popBackground.color,
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(32.dp),
                      ),
                    ),
                    child: Column(
                      children: [
                        _buildVipBenefits(),
                        Gaps.vGap8,
                        _buildBonus(),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBonus() {
    return Column(
      children: [
        Row(
          children: [
            Container(
              width: 4.dp,
              height: 20.dp,
              decoration: BoxDecoration(
                color: GGColors.highlightButton.color,
                borderRadius: BorderRadius.circular(2.dp),
              ),
            ),
            Gaps.hGap8,
            Text(
              localized('claim_bon'),
              style: GGTextStyle(
                fontSize: GGFontSize.bigTitle20,
                color: GGColors.textMain.color,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
          ],
        ),
        Gaps.vGap16,
        Row(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Flexible(
              child: Text(
                localized('understand_more_tip'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                ),
              ),
            ),
            Gaps.hGap2,
            ScaleTap(
              onPressed: _onPressedBounsFAQ,
              child: Text(
                localized('understand_more'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.highlightButton.color,
                ),
              ),
            ),
          ],
        ),
        Gaps.vGap16,
        _buildSort(),
        Gaps.vGap16,
        const CouponHomeView(),
      ],
    );
  }

  Widget _buildSort() {
    return Row(
      children: [
        GestureDetector(
          onTap: _showExchange,
          child: Container(
            padding: EdgeInsets.symmetric(vertical: 6.dp, horizontal: 10.dp),
            decoration: BoxDecoration(
              color: Colors.transparent,
              border: Border.all(
                color: GGColors.border.color,
                width: 1.dp,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: EdgeInsets.only(bottom: 4.dp),
                  child: Image.asset(
                    R.couponCouponCodeIcon,
                    height: 14.dp,
                  ),
                ),
                Gaps.hGap10,
                Text(
                  localized("coupon_code"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textHint.color,
                  ),
                )
              ],
            ),
          ),
        ),
        const Spacer(),
        GestureDetector(
          onTap: _showFilter,
          child: Container(
            padding: EdgeInsets.symmetric(vertical: 6.dp),
            child: Image.asset(
              R.couponCouponSort,
              height: 16.dp,
            ),
          ),
        )
      ],
    );
  }

  Widget _buildVipBenefits() {
    return Container(
      padding: EdgeInsets.symmetric(
        vertical: 24.dp,
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final width =
              (constraints.maxWidth - 80.dp * 2 - 16.dp * 2).truncateToDouble();
          return Obx(() {
            return Wrap(
              runSpacing: 16.dp,
              spacing: 16.dp,
              children: [
                _buildVipBeneItem(
                  width: 80.dp,
                  title: localized('birthday_gif'),
                  value: state.birthdayBenefit.amount!,
                ),
                SizedBox(
                  width: width,
                  child: _buildVipBeneItem(
                    width: 80.dp,
                    title: localized('pro_bene'),
                    value: state.promotionBenefit.amount!,
                  ),
                ),
                _buildVipBeneItem(
                  width: 80.dp,
                  title: localized('rege_bene'),
                  value: state.keepBenefit.amount!,
                ),
                _buildVipBeneItem(
                  width: 80.dp,
                  title: localized('depo_week'),
                  value: state.depositBenefit.bonusRate!,
                  unit: '%',
                ),
                ..._buildVipRescueBeneItem(width),
                _buildVipBeneItem(
                  width: 80.dp,
                  title: localized('withdrawal'),
                  value: state.returnBouns.dayWithdrawLimitMoney!,
                  unit: 'X',
                ),
              ],
            );
          });
        },
      ),
    );
  }

  List<Widget> _buildVipRescueBeneItem(double width) {
    if (!Config.sharedInstance.environment.hideVipRescue) {
      return [
        SizedBox(
          width: width,
          child: _buildVipBeneItem(
            width: 80.dp,
            title: localized('rescue_money'),
            value: state.rescueMoney.amount!,
            unit: '%',
          ),
        ),
        _buildVipBeneItem(
          width: 80.dp,
          title: localized('login_red'),
          value: state.loginRedPackage.amount!,
        ),
      ];
    } else {
      return [
        SizedBox(
          width: width,
          child: _buildVipBeneItem(
            width: 80.dp,
            title: localized('login_red'),
            value: state.loginRedPackage.amount!,
          ),
        ),
      ];
    }
  }

  Widget _buildVipBeneItem({
    required double width,
    required String title,
    required num value,
    String unit = 'USDT',
  }) {
    return ScaleTap(
      onPressed: _pressRules,
      child: SizedBox(
        width: width,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: width,
              height: width,
              decoration: BoxDecoration(
                color: const Color(0xFFEBCB9C).withOpacity(
                    state.correspondingLevel == state.level ? 0.6 : 0.1),
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    NumberPrecision(value).toString() +
                        (unit != 'USDT' ? unit : ''),
                    style: GGTextStyle(
                      fontSize: GGFontSize.bigTitle,
                      color: GGColors.textMain.color,
                    ),
                  ),
                  if (unit == 'USDT')
                    Container(
                      margin: EdgeInsets.only(top: 2.dp),
                      child: Text(
                        unit,
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: GGColors.textMain.color,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Gaps.vGap10,
            Text(
              title,
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.textMain.color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVipReturn() {
    return Obx(() {
      if (state.benefits == null) {
        return Container();
      }
      return Container(
        margin: EdgeInsets.symmetric(horizontal: 16.dp),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(4.dp),
        ),
        padding: EdgeInsets.symmetric(vertical: 20.dp, horizontal: 10.dp),
        child: Row(
          children: [
            _buildVipReturnItem(
              title: localized('s_re'),
              value: state.returnBouns.sportsReturn!,
              icon: R.vipSRe,
            ),
            const Spacer(),
            _buildVipReturnItem(
              title: localized('real_re'),
              value: state.returnBouns.personReturn!,
              icon: R.vipRealRe,
            ),
            const Spacer(),
            _buildVipReturnItem(
              title: localized('ca_re'),
              value: state.returnBouns.casinoCashback ?? 0,
              icon: R.vipCaRe,
            ),
            const Spacer(),
            _buildVipReturnItem(
              title: localized('chess_re'),
              value: state.returnBouns.cardReturn!,
              icon: R.vipChessRe,
            ),
          ],
        ),
      );
    });
  }

  Widget _buildVipReturnItem({
    required String title,
    required num value,
    required String icon,
  }) {
    return ScaleTap(
      onPressed: _pressRules,
      child: SizedBox(
        width: 75.dp,
        child: Column(
          children: [
            Container(
              width: 45.dp,
              height: 45.dp,
              decoration: BoxDecoration(
                color: const Color(0xFFF7DBB3).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Image.asset(
                icon,
                width: 30.dp,
                height: 30.dp,
              ),
            ),
            Gaps.vGap10,
            Text(
              '$value%',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: const Color(0xFFF7DBB3),
              ),
            ),
            Gaps.vGap6,
            Text(
              breakWord(title),
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: const Color(0xFFF7DBB3),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  String breakWord(String word) {
    if (word.isEmpty) {
      return word;
    }
    String breakWord = ' ';
    for (var element in word.runes) {
      breakWord += String.fromCharCode(element);
      breakWord += '\u200B';
    }
    return breakWord;
  }

  Widget _buildVipCard() {
    return AspectRatio(
      aspectRatio: 375 / 155,
      child: Obx(() {
        if (state.benefits == null) {
          return Gaps.empty;
        }

        return Swiper(
          autoplay: false,
          index: state.initIndex,
          controller: logic.swiperController,
          itemCount: state.isSVip ? 10 : 9,
          transformer: ScaleAndFadeTransformer(
            scale: 0.85,
          ),
          viewportFraction: 0.85,
          itemBuilder: (context, index) {
            return ScaleTap(
              onPressed: () => _onTapPage(index),
              child: GamingVipCard(
                bgImagePath: logic.getVipCard(index + 1),
                index: index + 1,
                isSVip: state.isSVip,
                vipLevel: state.level,
                promotionProcess: state.vipInfo?.process,
                promotionInfo: state.benefits!.promotionLevel(index + 1),
                keepProcess: state.vipInfo?.processKeep,
                keepInfo: state.benefits!.keepLevel(index + 1),
                keepPoints: state.vipInfo?.keepPoints,
                nextLevelPoints: state.vipInfo?.nextLevelPoints,
              ),
            );
          },
          onIndexChanged: logic.setupCurrentIndex,
          // onTap: _onTapPage,
        );
      }),
    );
  }

  Widget _buildLevelLocator() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Obx(() {
        return Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(logic.getVipDotBg()),
              fit: BoxFit.fitWidth,
            ),
          ),
          alignment: AlignmentDirectional.center,
          child: Obx(() {
            return Image.asset(
              logic.getVipDot(),
              fit: BoxFit.fitWidth,
            );
          }),
        );
      }),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        image: DecorationImage(
          image: AssetImage(R.vipHeaderBg),
          opacity: 0.1,
        ),
      ),
      child: Column(
        children: [
          _buildBackArrow(),
          _buildUserVipLevel(),
          Gaps.vGap8,
        ],
      ),
    );
  }

  Widget _buildBackArrow() {
    return Row(
      children: [
        SizedBox(width: 10.dp, height: 65.dp),
        ScaleTap(
          onPressed: _pressBack,
          child: Padding(
            padding: EdgeInsetsDirectional.all(6.dp),
            child: SvgPicture.asset(
              R.vipVipBackArrow,
              width: 27.dp,
              height: 27.dp,
              fit: BoxFit.cover,
            ),
          ),
        ),
        const Spacer(),
        ScaleTap(
          onPressed: _pressRules,
          child: Container(
            height: 30.dp,
            padding: EdgeInsets.symmetric(horizontal: 12.dp),
            decoration: BoxDecoration(
              borderRadius:
                  BorderRadius.horizontal(left: Radius.circular(15.dp)),
              color: const Color(0xFF454339),
            ),
            child: Row(
              children: [
                Text(
                  localized('rules'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: const Color(0xFFE5D2AC),
                  ),
                ),
                Gaps.hGap4,
                RotationTransition(
                  turns: const AlwaysStoppedAnimation(0.75),
                  child: SvgPicture.asset(
                    R.iconDown,
                    width: 5.dp,
                    height: 6.dp,
                    color: const Color(0xFFE5D2AC),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUserVipLevel() {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        if (!state.isLogin) {
          Get.toNamed<void>(Routes.preLogin.route);
        }
      },
      child: Column(
        children: [
          Container(
            width: 64.dp,
            height: 64.dp,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                stops: [0.14, 0.9],
                colors: [
                  Color(0xFFE1BD63),
                  Color(0xFFEB7C66),
                ],
              ),
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Obx(() {
              if (state.isLogin) {
                return AccountService.sharedInstance
                    .buildCustomAvatar(60.dp, 60.dp);
              } else {
                return Container(
                  width: 60.dp,
                  height: 60.dp,
                  alignment: AlignmentDirectional.center,
                  child: Image.asset(
                    R.preferencesAvatar1,
                    width: 60.dp,
                    height: 60.dp,
                  ),
                );
              }
            }),
          ),
          Gaps.vGap4,
          Obx(() {
            return Text(
              !state.isLogin
                  ? localized('not_login')
                  : VipService.sharedInstance.vipLevelName,
              style: GGTextStyle(
                fontSize: GGFontSize.bigTitle20,
                color: const Color(0xFFE5D2AC),
                fontFamily: GGFontFamily.robot,
              ),
            );
          }),
          Gaps.vGap16,
          Container(
            padding: EdgeInsets.symmetric(horizontal: 16.dp),
            child: Obx(() {
              if (state.isLogin) {
                return Wrap(
                  alignment: WrapAlignment.center,
                  // mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      localized('acc_bon'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: const Color(0xFFE5D2AC),
                      ),
                    ),
                    Gaps.hGap8,
                    Obx(() {
                      return Text(
                        '${state.vipInfo?.totalBonusText ?? 0}',
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: const Color(0xFFE5D2AC),
                        ),
                      );
                    }),
                    Gaps.hGap4,
                    GamingImage.network(
                      url: GamingCurrencyModel.usdt().iconUrl,
                      width: 18.dp,
                      height: 18.dp,
                    ),
                    Gaps.hGap16,
                    ScaleTap(
                      onPressed: _onPressedBounsDetail,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            localized('vie_detail'),
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: Colors.white,
                            ),
                          ),
                          Gaps.hGap8,
                          RotationTransition(
                            turns: const AlwaysStoppedAnimation(0.75),
                            child: SvgPicture.asset(
                              R.iconDropDown,
                              width: 10.dp,
                              height: 12.dp,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              }
              return Gaps.empty;
            }),
          ),
        ],
      ),
    );
  }
}

extension _Action on VipPage {
  void _showFilter() {
    couponLogic.onPressFilter();
  }

  void _showExchange() {
    couponLogic.onExchange();
  }

  void _onTapPage(int index) {
    _pressRules();
  }

  void _pressRules() {
    Get.toNamed<void>(Routes.vipRightDes.route);
  }

  void _pressBack() {
    Get.back<dynamic>();
  }

  void _onPressedBounsDetail() {
    Get.toNamed<dynamic>(Routes.walletHistory.route, arguments: {
      'historyTypeValue': HistoryType.bonus.value,
      'isDigital': true,
    });
  }

  void _onPressedBounsFAQ() {
    logic.onPressedBounsFAQ();
  }
}

class ScaleAndFadeTransformer extends PageTransformer {
  final double? _scale;
  final double? _fade;

  ScaleAndFadeTransformer({double? fade = 0.3, double? scale = 0.8})
      : _fade = fade,
        _scale = scale;

  @override
  Widget transform(Widget child, TransformInfo info) {
    final position = info.position;
    var c = child;
    if (_scale != null) {
      final scaleFactor = (1 - position!.abs()) * (1 - _scale!);
      final scale = _scale! + scaleFactor;
      final translate = position * info.width! * (1 - scale) * 2 * -1;
      c = Transform.scale(
        scale: scale,
        origin: Offset(translate, 0),
        child: c,
      );
    }

    if (_fade != null) {
      final fadeFactor = (1 - position!.abs()) * (1 - _fade!);
      final opacity = _fade! + fadeFactor;
      c = Opacity(
        opacity: opacity,
        child: c,
      );
    }

    return c;
  }
}
