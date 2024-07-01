import 'package:card_swiper/card_swiper.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/vip/vip_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import 'views/vip_right_card_view.dart';
import 'views/vip_right_rule_view.dart';
import 'vip_right_des_logic.dart';

class VipRightDesPage extends BaseView<VipRightDesLogic> {
  const VipRightDesPage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const VipRightDesPage(),
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

  Color get vipRightDesBackground => const Color(0xff020035);

  Color get headerTitleColor => const Color(0xffFFE9CD);

  Color get buttonTitleColor => const Color(0xff2E2E2E);

  List<Color> get buttonGradientColors => [
        const Color(0xFFFAE0AA),
        const Color(0xFFE1A0A0),
        const Color(0xFFFE6BB5)
      ];

  @override
  Widget body(BuildContext context) {
    Get.put(VipRightDesLogic());
    return GetBuilder(
        init: controller,
        builder: (logic) {
          return Container(
            color: vipRightDesBackground,
            width: double.infinity,
            height: double.infinity,
            child: Column(
              children: [
                _buildBackArrow(),
                Expanded(
                  child: ListView(
                    children: [
                      _buildHeaderMask(),
                      Transform.translate(
                        offset: Offset(0, -30.dp),
                        child: _buildVipContent(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        });
  }

  Widget _buildVipContent() {
    return Padding(
      padding:
          EdgeInsetsDirectional.only(start: 16.dp, end: 16.dp, bottom: 24.dp),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildIntroduceTitle(),
          Gaps.vGap14,
          _buildRightCard(),
          Gaps.vGap12,
          _buildCheckVip(),
          VipRightRuleView(),
        ],
      ),
    );
  }

  Widget _buildCheckVip() {
    return Row(
      children: [
        SizedBox(width: 44.dp),
        Expanded(
          child: InkWell(
            onTap: _pressCheckVip,
            child: Container(
              height: 46.dp,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: buttonGradientColors,
                  begin: AlignmentDirectional.topCenter,
                  end: AlignmentDirectional.bottomCenter,
                  stops: const [0.1, 0.9, 1.0],
                ),
                borderRadius: BorderRadius.circular(23.dp),
              ),
              alignment: AlignmentDirectional.center,
              child: Text(
                localized('view_vip'),
                style: GGTextStyle(
                  fontSize: GGFontSize.smallTitle,
                  // fontWeight: GGFontWeigh.bold,
                  color: buttonTitleColor,
                ),
              ),
            ),
          ),
        ),
        SizedBox(width: 44.dp),
      ],
    );
  }

  Widget _buildRightCard() {
    final benefitsModel = controller.benefitsModel;
    if (benefitsModel == null) return const SizedBox();

    return SizedBox(
      height: (690 + 134).dp,
      child: Swiper(
        itemCount: 9,
        pagination: SwiperPagination(
          margin: EdgeInsetsDirectional.all(19.dp),
          builder: DotSwiperPaginationBuilder(
            activeColor: GGColors.highlightButton.color,
            color: GGColors.border.color,
            space: 5.dp,
          ),
        ),
        itemBuilder: (context, index) {
          return Container(
            constraints: BoxConstraints(
                minWidth: double.infinity, minHeight: (638 + 134).dp),
            margin: EdgeInsetsDirectional.only(bottom: 50.dp), //pagination 空间
            padding: EdgeInsets.symmetric(horizontal: 8.dp), //item间距16.dp
            alignment: Alignment.center,
            child: VipRightCardView(
              vipLevel: index + 1,
              model: benefitsModel,
            ),
          );
        },
      ),
    );
  }

  Widget _buildIntroduceTitle() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'MEMBERSHIP LEVEL AND BENEFITS INTRODUCTION',
                style: GGTextStyle(
                  fontSize: GGFontSize.bigTitle,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
        Gaps.vGap8,
        Row(
          children: [
            Expanded(
              child: Text(
                localized('member_level'),
                style: GGTextStyle(
                  fontSize: GGFontSize.bigTitle,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildHeaderMask() {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        image: DecorationImage(
          fit: BoxFit.fill,
          image: AssetImage(R.vipVipRightHeader),
        ),
      ),
      child: AspectRatio(
        aspectRatio: 375.0 / 197.0,
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    localized('vip_title'),
                    textAlign: TextAlign.center,
                    style: GGTextStyle(
                      color: headerTitleColor,
                      fontSize: GGFontSize.superBigTitle,
                      fontWeight: GGFontWeigh.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBackArrow() {
    return Row(
      children: [
        SizedBox(width: 10.dp, height: 65.dp),
        InkWell(
          onTap: _pressBack,
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
      ],
    );
  }
}

extension _Action on VipRightDesPage {
  void _pressCheckVip() {
    final vipRoute = Routes.vip.route;
    bool hasPrePage = Get.findOrNull<VipLogic>() != null;
    if (Get.previousRoute == vipRoute || hasPrePage) {
      Get.back<dynamic>();
    } else {
      Get.toNamed<dynamic>(vipRoute);
    }
  }

  void _pressBack() {
    Get.back<dynamic>();
  }
}
