import 'package:base_framework/base_controller.dart';
import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';

import '../../../common/delegate/base_refresh_view_delegate.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/widgets/appbar/appbar.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../../common/widgets/gg_button.dart';
import '../../../common/widgets/go_gaming_empty.dart';
import '../../../config/gaps.dart';
import '../../../helper/time_helper.dart';
import 'exchange_coupon_logic.dart';

class ExchangeCouponPage extends BaseView<ExchangeCouponLogic>
    with BaseRefreshViewDelegate {
  const ExchangeCouponPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const ExchangeCouponPage(),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  RefreshViewController get renderController => controller.controller;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('redeem_vou'),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(ExchangeCouponLogic());
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap16,
          Text(
            localized("enter_coupon_code"),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap4,
          _buildCodeTF(),
          Gaps.vGap16,
          Text(
            localized("enter_coupon_code_tip"),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textHint.color,
            ),
          ),
          Gaps.vGap20,
          SizedBox(
            width: double.infinity,
            height: 48.dp,
            child: Obx(() {
              return GGButton(
                enable: controller.state.buttonEnable.value,
                onPressed: _onExchange,
                text: localized("redeem_rewards"),
              );
            }),
          ),
          Gaps.vGap30,
          Text(
            localized("exchange_record"),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap16,
          _buildList(),
        ],
      ),
    );
  }

  Widget _buildCodeTF() {
    return GamingTextField(
      controller: controller.codeController,
      maxLine: 1,
    );
  }

  Widget _buildList() {
    return Expanded(
      child: Obx(() {
        return RefreshView(
          delegate: this,
          controller: controller,
          child: ListView.separated(
            itemCount: controller.state.data.length,
            itemBuilder: (context, index) {
              return Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: GGColors.border.color,
                    width: 1.dp,
                  ),
                  borderRadius: BorderRadius.circular(4.dp),
                ),
                child: Padding(
                  padding:
                      EdgeInsets.symmetric(horizontal: 13.dp, vertical: 14.dp),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ConstrainedBox(
                        constraints:
                            BoxConstraints(maxWidth: Get.width - 220.dp),
                        child: Text(
                          controller.state.data[index].name ?? '',
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.textSecond.color,
                          ),
                        ),
                      ),
                      Text(
                        DateFormat("yyyy-MM-dd HH:mm:ss").format(
                            DateTime.fromMillisecondsSinceEpoch(
                                controller.state.data[index].createTime ?? 0)),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textHint.color,
                        ),
                      )
                    ],
                  ),
                ),
              );
            },
            separatorBuilder: (ctx, index) => Gaps.vGap10,
          ),
        );
      }),
    );
  }

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(top: 50.dp),
      child: const GoGamingEmpty(),
    );
  }
}

extension _Action on ExchangeCouponPage {
  void _onExchange() {
    controller.onExchange();
  }
}
