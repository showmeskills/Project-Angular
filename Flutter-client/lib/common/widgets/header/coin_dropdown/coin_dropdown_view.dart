import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/api/wallet/models/gg_user_balance.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gaming_wallet_setting.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../components/number_precision/number_precision.dart';
import '../../gg_dialog/dialog_util.dart';
import 'coin_dropdown_logic.dart';

class CoinDropdownView extends StatelessWidget {
  const CoinDropdownView({Key? key}) : super(key: key);

  CoinDropdownLogic get controller => Get.find<CoinDropdownLogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(CoinDropdownLogic(), permanent: true);
    controller.context = context;
    return FocusDetector(
      onFocusGained: () => controller.loadData(),
      child: GetBuilder(
        init: controller,
        builder: (GetxController controller) {
          return _buildBody();
        },
      ),
    );
  }

  Widget _buildBody() {
    return Container(
      width: 201.dp,
      margin: EdgeInsets.all(4.dp),
      clipBehavior: Clip.none,
      decoration: BoxDecoration(
        color: GGColors.alertBackground.color,
        borderRadius: BorderRadius.circular(4.dp),
        boxShadow: [
          BoxShadow(
            color: GGColors.shadow.color,
            blurRadius: 5.0,
            spreadRadius: 0,
            offset: const Offset(0.0, 1),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildSearch(),
          _inset(_buildTitleRow()),
          _buildLine(),
          _buildList(),
          _buildLine(),
          Gaps.vGap8,
          _buildManagerButton(),
          Gaps.vGap8,
        ],
      ),
    );
  }

  Widget _buildSearch() {
    return Container(
      padding: EdgeInsets.all(12.dp).copyWith(bottom: 0),
      child: GamingTextField(
        controller: controller.searchController,
        hintText: localized('search_currency'),
        contentPadding: EdgeInsets.all(10.dp),
        prefixIconConstraints: BoxConstraints(
          maxWidth: 34.dp,
          minWidth: 34.dp,
        ),
        prefixIcon: Container(
          margin: EdgeInsets.only(left: 10.dp),
          child: SvgPicture.asset(
            R.iconSearch2,
            width: 14.dp,
            height: 14.dp,
            color: GGColors.textSecond.color,
          ),
        ),
      ),
    );
  }

  Widget _inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 8.dp,
        end: end ?? 8.dp,
      ),
      child: child,
    );
  }

  Widget _buildLine() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 10.dp),
      height: 1,
      width: double.infinity,
      color: GGColors.border.color,
    );
  }

  Widget _buildManagerButton() {
    return ScaleTap(
      onPressed: _onPressManager,
      child: SizedBox(
        height: 32.ddp,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              R.iconWalletSetting,
              width: 12.dp,
              height: 12.dp,
              color: GGColors.textSecond.color,
            ),
            Gaps.hGap8,
            Text(
              localized('wallet_settings'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 6.dp),
      height: 36.dp,
      alignment: Alignment.center,
      child: GoGamingLoading(
        size: 16.dp,
      ),
    );
  }

  Widget _buildEmpty() {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 6.dp),
      padding: EdgeInsets.symmetric(horizontal: 12.dp),
      height: 36.dp,
      alignment: Alignment.center,
      child: Text(
        localized('currency_not_available'),
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          fontWeight: GGFontWeigh.bold,
        ),
      ),
    );
  }

  Widget _buildList() {
    if (controller.isLoading.value) {
      return _buildLoading();
    }
    if (controller.selectedBalances.isEmpty) {
      return _buildEmpty();
    }
    return ConstrainedBox(
      constraints: BoxConstraints(
        maxHeight: (30 * 6 + 15).dp,
      ),
      child: ListView.builder(
        physics: const ClampingScrollPhysics(),
        shrinkWrap: true,
        padding: EdgeInsets.only(top: 5.dp, bottom: 10.dp),
        itemCount: controller.selectedBalances.length,
        itemExtent: 30.dp,
        itemBuilder: (context, index) {
          return _buildItem(controller.selectedBalances[index]);
        },
      ),
    );
  }

  Widget _buildItem(GGUserBalance model) {
    return InkWell(
      onTap: () => _onPressCoin(model),
      child: Row(
        children: [
          SizedBox(width: 24.dp),
          Expanded(
            child: _buildBalance(model.blanceTextWithSymbol(
                controller.searchNonstickyCoinBalance(model.currency))),
          ),
          controller.searchNonstickyCoinBalance(model.currency) > 0
              ? _buildNonStickyTip(model)
              : SizedBox(width: 26.dp),
          Expanded(
            child: _buildCurrency(model.currency ?? '', model.iconUrl),
          ),
          SizedBox(width: 16.dp),
        ],
      ),
    );
  }

  Widget _buildNonStickyTip(GGUserBalance model) {
    return ScaleTap(
      onPressed: () {
        _onPressTip(model);
      },
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 8.dp),
        child: GamingImage.asset(
          R.iconTipIcon,
          width: 10.dp,
          color: GGColors.textMain.color,
        ),
      ),
    );
  }

  Widget _buildCurrency(String currency, String iconUrl) {
    return Row(
      children: [
        GamingImage.network(
          url: iconUrl,
          width: 16.dp,
          height: 16.dp,
        ),
        Gaps.hGap4,
        Text(
          currency,
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            // fontFamily: GGFontFamily.dingPro,
            fontWeight: GGFontWeigh.medium,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }

  Widget _buildBalance(String balance) {
    return FittedBox(
      alignment: AlignmentDirectional.centerStart,
      fit: BoxFit.scaleDown,
      child: Text(
        balance,
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
          // fontFamily: GGFontFamily.dingPro,
          fontWeight: GGFontWeigh.medium,
          color: GGColors.textMain.color,
        ),
      ),
    );
  }

  Widget _buildTitleRow() {
    final currentTab = controller.currentTab.value;
    return Row(
      children: [
        Expanded(
          child: _buildTypeTitle(
            0 == currentTab,
            () => onTapTab(0),
            localized('crypto'),
          ),
        ),
        Expanded(
          child: _buildTypeTitle(
            1 == currentTab,
            () => onTapTab(1),
            localized('fiat_cur'),
          ),
        ),
      ],
    );
  }

  Widget _buildTypeTitle(bool isSelected, VoidCallback onTap, String text) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: 44.dp,
        alignment: AlignmentDirectional.centerStart,
        padding: EdgeInsetsDirectional.only(start: 16.dp),
        child: Text(
          text,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: isSelected ? GGColors.brand.color : GGColors.textMain.color,
          ),
        ),
      ),
    );
  }

  Widget _buildTipBalance(String title, String balanceText, String currency) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.hGap8,
        Text(
          balanceText,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.brand.color,
          ),
        ),
        Gaps.hGap8,
        Text(
          currency,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.brand.color,
          ),
        ),
      ],
    );
  }
}

extension _Action on CoinDropdownView {
  void _onPressCoin(GGUserBalance model) {
    SmartDialog.dismiss(result: null);
    controller.onSelectBalance(model);
  }

  void _onPressTip(GGUserBalance model) {
    final stickys = controller.searchNonstickyCoinMoldes(model.currency);
    final dialog = DialogUtil(
      context: Get.context!,
      title: localized('bal_det'),
      moreWidget: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildTipBalance(
            localized('wallet_balance'),
            model.balanceText,
            model.currency ?? '',
          ),
          Gaps.vGap16,
          Column(
            mainAxisSize: MainAxisSize.min,
            children: stickys.map((e) {
              return Padding(
                padding: EdgeInsets.only(bottom: 16.dp),
                child: _buildTipBalance(
                  e.walletCategory == 'NSLiveCasino'
                      ? localized('live_casino_bonus')
                      : localized('casino_bonus'),
                  NumberPrecision(e.balance).balanceText(model.isDigital),
                  model.currency ?? '',
                ),
              );
            }).toList(),
          ),
          Gaps.vGap20,
        ],
      ),
      rightBtnName: localized('sure'),
      leftBtnName: '',
      onRightBtnPressed: () {
        Get.back<void>();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  void _onPressManager() {
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.clickManageCurrency);
    SmartDialog.dismiss(result: null);
    GamingWalletSettings.show();
    // Get.toNamed<dynamic>(Routes.managerCurrency.route);
  }

  void onTapTab(int index) {
    controller.setCurrentTab(index);
  }
}
