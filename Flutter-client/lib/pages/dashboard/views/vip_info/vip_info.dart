import 'package:flutter/material.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/common/widgets/gaming_vip_card/gaming_vip_card.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/pages/dashboard/logics/vip_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../module_title.dart';

class DashboardVipInfo extends StatelessWidget
    with BaseSingleRenderViewDelegate {
  const DashboardVipInfo({super.key});
  @override
  SingleRenderViewController get renderController => logic.controller;
  DashboardVipLogic get logic => Get.find<DashboardVipLogic>();
  DashboardVipState get state => logic.state;

  @override
  Widget getLoadingWidget(BuildContext context) {
    return Gaps.empty;
  }

  @override
  Widget getFailedWidget(BuildContext context,
      [void Function()? onErrorPressed]) {
    return Gaps.empty;
  }

  @override
  Widget build(BuildContext context) {
    return SingleRenderView(
      controller: logic,
      delegate: this,
      child: DashboardModuleContainer(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildVipCard(),
            _buildVipBenefits(),
          ],
        ),
      ),
    );
  }

  Widget _buildVipBenefits() {
    return Obx(() {
      if (state.setting == null) {
        return Container();
      }
      return Container(
        padding: EdgeInsets.symmetric(
          horizontal: 16.dp,
          vertical: 24.dp,
        ),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final width = (constraints.maxWidth - 72.dp * 2 - 16.dp * 2)
                .truncateToDouble();
            return Obx(() {
              return Wrap(
                runSpacing: 16.dp,
                spacing: 16.dp,
                children: [
                  _buildVipBeneItem(
                    width: 72.dp,
                    title: localized('birthday_gif'),
                    value: state.setting!.birthdayBonus,
                  ),
                  SizedBox(
                    width: width,
                    child: _buildVipBeneItem(
                      width: 72.dp,
                      title: localized('pro_bene'),
                      value: state.setting!.promotionBonus,
                    ),
                  ),
                  _buildVipBeneItem(
                    width: 72.dp,
                    title: localized('rege_bene'),
                    value: state.setting!.keepBonus,
                  ),
                  _buildVipBeneItem(
                    width: 72.dp,
                    title: localized('depo_week'),
                    value: state.setting!.firstDepositBonus,
                    unit: '%',
                  ),
                  if (!Config.sharedInstance.environment.hideVipRescue)
                    SizedBox(
                      width: width,
                      child: _buildVipBeneItem(
                        width: 72.dp,
                        title: localized('rescue_money'),
                        value: state.setting!.rescueMoney,
                        unit: '%',
                      ),
                    ),
                  SizedBox(
                    width: Config.sharedInstance.environment.hideVipRescue
                        ? width
                        : 72.dp,
                    child: _buildVipBeneItem(
                      width: 72.dp,
                      title: localized('login_red'),
                      value: state.setting!.loginRedPackage,
                    ),
                  ),
                  _buildVipBeneItem(
                    width: 72.dp,
                    title: localized('withdrawal'),
                    value: state.setting!.dayWithdrawLimitMoney,
                    unit: 'X',
                  ),
                ],
              );
            });
          },
        ),
      );
    });
  }

  Widget _buildVipBeneItem({
    required double width,
    required String title,
    required int value,
    String unit = 'USDT',
  }) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: _pressVip,
      child: SizedBox(
        width: width,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ScaleTap(
              opacityMinValue: 0.8,
              scaleMinValue: 0.98,
              onPressed: _pressVip,
              child: Container(
                width: width,
                height: width,
                decoration: BoxDecoration(
                  color: const Color(0xFFEBCB9C).withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      value.toString() + (unit != 'USDT' ? unit : ''),
                      style: GGTextStyle(
                        fontSize: GGFontSize.smallTitle,
                        color: GGColors.textMain.color,
                        fontWeight: GGFontWeigh.medium,
                      ),
                    ),
                    if (unit == 'USDT')
                      Container(
                        margin: EdgeInsets.only(top: 2.dp),
                        child: Text(
                          unit,
                          style: GGTextStyle(
                            fontSize: GGFontSize.smallHint,
                            color: GGColors.textMain.color,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            Gaps.vGap8,
            Text(
              title,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVipCard() {
    return Container(
      margin: EdgeInsets.all(16.dp).copyWith(bottom: 0),
      child: Obx(() {
        return ScaleTap(
          opacityMinValue: 0.8,
          scaleMinValue: 0.98,
          onPressed: _pressVip,
          child: AspectRatio(
            aspectRatio: 325 / 155,
            child: GamingVipCard(
              bgImagePath: VipService.sharedInstance.getVipCard(),
              vipLevel: state.vipInfo?.currentVipLevel ?? 0,
              isSVip: VipService.sharedInstance.isSVip,
              promotionProcess: state.vipInfo?.process,
              keepProcess: state.vipInfo?.processKeep,
            ),
          ),
        );
      }),
    );
    // return Container(
    //   width: double.infinity,
    //   margin: EdgeInsets.all(16.dp).copyWith(bottom: 0),
    //   padding: EdgeInsets.symmetric(horizontal: 16.dp),
    //   decoration: BoxDecoration(
    //     image: const DecorationImage(
    //       image: AssetImage(R.commonVipBg),
    //       fit: BoxFit.cover,
    //     ),
    //     borderRadius: BorderRadius.circular(4.dp),
    //   ),
    //   child: Column(
    //     crossAxisAlignment: CrossAxisAlignment.start,
    //     children: [
    //       Gaps.vGap14,
    //       Obx(
    //         () {
    //           if (state.vipInfo == null) {
    //             return Gaps.empty;
    //           }
    //           return Text(
    //             'VIP${state.vipInfo!.currentVipLevel}',
    //             style: GGTextStyle(
    //               fontSize: GGFontSize.superBigTitle28,
    //               fontWeight: GGFontWeigh.bold,
    //               color: GGColors.textMain.color,
    //             ),
    //           );
    //         },
    //       ),
    //       Gaps.vGap20,
    //       Obx(
    //         () {
    //           if (state.vipInfo == null) {
    //             return Gaps.empty;
    //           }
    //           return _buildVipProgress(
    //             title: localized('promo_p'),
    //             progress: state.vipInfo!.process?.toInt() ?? 0,
    //             type: VipProgressType.promotion,
    //           );
    //         },
    //       ),

    //       // Gaps.vGap14,
    //       // _buildVipProgress(
    //       //   title: localized('rele_pro'),
    //       //   progress: 41,
    //       // ),
    //       Gaps.vGap20,
    //       Row(
    //         children: [
    //           Text(
    //             localized('curr_value'),
    //             style: GGTextStyle(
    //               fontSize: GGFontSize.content,
    //               color: GGColors.textMain.color,
    //               height: 1.4,
    //             ),
    //           ),
    //           Expanded(
    //             child: Align(
    //               alignment: Alignment.centerRight,
    //               child: Obx(
    //                 () {
    //                   if (state.vipInfo == null) {
    //                     return Gaps.empty;
    //                   }
    //                   return Text(
    //                     '${state.vipInfo!.currentPoints}/${state.vipInfo!.nextLevelPoints}',
    //                     style: GGTextStyle(
    //                       fontSize: GGFontSize.content,
    //                       color: GGColors.textMain.color,
    //                       height: 1.4,
    //                     ),
    //                   );
    //                 },
    //               ),
    //             ),
    //           )
    //         ],
    //       ),
    //       Gaps.vGap16,
    //     ],
    //   ),
    // );
  }
}

extension _Action on DashboardVipInfo {
  void _pressVip() {
    Get.toNamed<void>(Routes.vip.route);
  }
}
