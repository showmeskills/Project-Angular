import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_bonus_adjust_account.dart';
import 'package:gogaming_app/common/api/history/models/gaming_bonus_grant_type_model.dart';
import 'package:gogaming_app/common/api/history/models/gaming_commission_type.dart';
import 'package:gogaming_app/common/api/history/models/gaming_transfer_wallet_select_model.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/common/widgets/gaming_date_picker.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_logic.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'models/wallet_history_status.dart';
import 'views/gaming_wallet_history_adjust/gaming_wallet_history_adjust_logic.dart';
import 'views/gaming_wallet_history_adjust/gaming_wallet_history_adjust_view_item.dart';
import 'views/gaming_wallet_history_bonus/gaming_wallet_history_bonus_logic.dart';
import 'views/gaming_wallet_history_bonus/gaming_wallet_history_bonus_view_item.dart';
import 'views/gaming_wallet_history_commission/gaming_wallet_history_commission_logic.dart';
import 'views/gaming_wallet_history_commission/gaming_wallet_history_commission_view_item.dart';
import 'views/gaming_wallet_history_deposit/gaming_wallet_history_deposit_currency_view_item.dart';
import 'views/gaming_wallet_history_deposit/gaming_wallet_history_deposit_logic.dart';
import 'views/gaming_wallet_history_deposit/gaming_wallet_history_deposit_crypto_view_item.dart';
import 'views/gaming_wallet_history_lucky_draw/gaming_wallet_history_lucky_draw_logic.dart';
import 'views/gaming_wallet_history_lucky_draw/gaming_wallet_history_lucky_draw_view_item.dart';
import 'views/gaming_wallet_history_sift/gaming_wallet_history_sift_logic.dart';
import 'views/gaming_wallet_history_transfer/gaming_wallet_history_transfer_crypto_view_item.dart';
import 'views/gaming_wallet_history_transfer/gaming_wallet_history_transfer_logic.dart';
import 'views/gaming_wallet_history_withdraw/gaming_wallet_history_withdraw_crypto_view_item.dart';
import 'views/gaming_wallet_history_withdraw/gaming_wallet_history_withdraw_currency_view_item.dart';
import 'views/gaming_wallet_history_withdraw/gaming_wallet_history_withdraw_logic.dart';

part 'views/gaming_wallet_history_deposit/gaming_wallet_history_deposit_view.dart';
part 'views/gaming_wallet_history_sift/gaming_wallet_history_sift_view.dart';
part 'views/gaming_wallet_history_withdraw/gaming_wallet_history_withdraw_view.dart';
part 'views/gaming_wallet_history_transfer/gaming_wallet_history_transfer_view.dart';
part 'views/gaming_wallet_history_bonus/gaming_wallet_history_bonus_view.dart';
part 'views/gaming_wallet_history_adjust/gaming_wallet_history_adjust_view.dart';
part 'views/gaming_wallet_history_commission/gaming_wallet_history_commission_view.dart';
part 'views/gaming_wallet_history_lucky_draw/gaming_wallet_history_lucky_draw_view.dart';

class GamingWalletHistoryPage extends BaseView<GamingWalletHistoryLogic> {
  const GamingWalletHistoryPage(
      {this.historyTypeValue = 'deposit', this.isDigital = true, super.key});
  final String historyTypeValue;
  final bool isDigital;
  GamingWalletHistoryState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () {
        String historyTypeValue = '';
        bool isDigital = true;
        if (Get.arguments != null) {
          Map<String, dynamic> arguments =
              Get.arguments as Map<String, dynamic>;
          if (arguments.containsKey('historyTypeValue')) {
            historyTypeValue = GGUtil.parseStr(arguments[
                'historyTypeValue']); //arguments['historyTypeValue'].toString();
          }
          if (arguments.containsKey('isDigital')) {
            isDigital = GGUtil.parseBool(arguments['isDigital']);
          }
        }
        return GamingWalletHistoryPage(
          historyTypeValue: historyTypeValue,
          isDigital: isDigital,
        );
      },
    );
  }

  @override
  Widget body(BuildContext context) {
    return _buildBody(context);
  }

  Widget _buildBody(BuildContext context) {
    Get.put(GamingWalletHistoryLogic(
        historyTypeValue: historyTypeValue, isDigital: isDigital));
    return Obx(() {
      return Container(
        decoration: BoxDecoration(
            color: GGColors.moduleBackground.color,
            borderRadius: BorderRadius.vertical(
              top: Radius.circular(16.dp),
            )),
        width: double.infinity,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
                padding: EdgeInsets.only(left: 16.dp, right: 16.dp, top: 16.dp),
                child: _buildTabBar()),
            Gaps.vGap24,
            _buildSelectTitle(),
            Visibility(
              visible: (state.index == 0 || state.index == 1),
              child: GestureDetector(
                onTap: () {
                  if (state.index == 0) {
                    Get.toNamed<void>(Routes.appeal.route);
                  }
                },
                child: Container(
                  padding:
                      EdgeInsets.only(left: 16.dp, right: 16.dp, top: 16.dp),
                  child: Text(
                    state.index == 0
                        ? localized('receive_dep')
                        : state.index == 1
                            ? localized('wd_no_arr')
                            : '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.brand.color,
                      fontFamily: GGFontFamily.dingPro,
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: _buildTabBarView(),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildTabItem(String title) {
    return Container(
      margin: EdgeInsets.only(bottom: 3.dp, top: 7.dp),
      child: Text(title),
    );
  }

  Widget _buildTabBar() {
    return TabBar(
      controller: controller.tabController,
      isScrollable: true,
      indicatorWeight: 4.dp,
      indicatorColor: GGColors.highlightButton.color,
      indicatorSize: TabBarIndicatorSize.label,
      indicatorPadding: EdgeInsets.zero,
      unselectedLabelStyle: TextStyle(
        fontSize: GGFontSize.content.fontSize,
      ),
      unselectedLabelColor: GGColors.textSecond.color,
      labelStyle: TextStyle(
        fontSize: GGFontSize.content.fontSize,
      ),
      labelColor: GGColors.textMain.color,
      tabs: [
        _buildTabItem(localized('deposit')),
        _buildTabItem(localized('withdrawl')),
        _buildTabItem(localized('trans')),
        _buildTabItem(localized('bonus')),
        _buildTabItem(localized('trans_acc')),
        _buildTabItem(localized('commission')),
        _buildTabItem(localized('lucky_draw')),
      ],
    );
  }

  Widget _buildTabBarView() {
    return Container(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      child: TabBarView(
        controller: controller.tabController,
        children: const [
          KeepAliveWrapper(
            child: GamingWalletHistoryDepositView(),
          ),
          KeepAliveWrapper(
            child: GamingWalletHistoryWithdrawView(),
          ),
          KeepAliveWrapper(
            child: GamingWalletHistoryTransferView(),
          ),
          KeepAliveWrapper(
            child: GamingWalletHistoryBonusView(),
          ),
          KeepAliveWrapper(
            child: GamingWalletHistoryAdjustView(),
          ),
          KeepAliveWrapper(
            child: GamingWalletHistoryCommissionView(),
          ),
          KeepAliveWrapper(
            child: GamingWalletHistoryLuckyDrawView(),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectTitle() {
    return Container(
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      child: Row(
        children: [
          Visibility(
            visible: (state.index == 0 || state.index == 1),
            child: GestureDetector(
              onTap: () {
                controller.changeDigital(true);
              },
              child: Container(
                padding: EdgeInsets.only(
                    left: 8.dp, right: 8.dp, top: 6.dp, bottom: 6.dp),
                decoration: BoxDecoration(
                  color: state.isDigital.value ? GGColors.border.color : null,
                  borderRadius: BorderRadius.circular(4.dp),
                ),
                child: Text(
                  localized('crypto'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: state.isDigital.value
                        ? GGColors.textMain.color
                        : GGColors.textSecond.color,
                    fontFamily: GGFontFamily.dingPro,
                  ),
                ),
              ),
            ),
          ),
          Visibility(
            visible: (state.index == 0 || state.index == 1),
            child: Container(
              margin: EdgeInsets.only(left: 24.dp),
              child: GestureDetector(
                onTap: () {
                  controller.changeDigital(false);
                },
                child: Container(
                  padding: EdgeInsets.only(
                      left: 8.dp, right: 8.dp, top: 6.dp, bottom: 6.dp),
                  decoration: BoxDecoration(
                    color: state.isDigital.value ? null : GGColors.border.color,
                    borderRadius: BorderRadius.circular(4.dp),
                  ),
                  child: Text(
                    localized('fiat'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: state.isDigital.value
                          ? GGColors.textSecond.color
                          : GGColors.textMain.color,
                      fontFamily: GGFontFamily.dingPro,
                    ),
                  ),
                ),
              ),
            ),
          ),
          const Spacer(),
          GestureDetector(
            onTap: () {
              // 筛选
              Get.to<dynamic>(() => const GamingWalletHistorySift());
            },
            child: SizedBox(
              height: 32.dp,
              child: SvgPicture.asset(
                R.iconHistorySift,
                width: 17.dp,
                height: 17.dp,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) => GGAppBar.normal(
        title: localized('trans_history'),
        centerTitle: false,
      );
}
