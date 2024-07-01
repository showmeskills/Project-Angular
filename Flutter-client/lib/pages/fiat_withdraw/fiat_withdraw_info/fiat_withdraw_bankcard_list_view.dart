import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';

import '../../../R.dart';
import '../../../common/api/bank_card/models/gaming_bank_card_model.dart';
import '../../../common/api/base/base_api.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../common/widgets/gaming_overlay.dart';
import '../../../common/widgets/gaming_popup.dart';
import '../../../config/gaps.dart';
import 'fiat_withdraw_info_logic.dart';
import 'fiat_withdraw_info_state.dart';

class FiatWithdrawBankCardListView extends StatelessWidget {
  const FiatWithdrawBankCardListView({super.key});

  FiatWithdrawInfoLogic get controller => Get.find<FiatWithdrawInfoLogic>();
  FiatWithdrawInfoState get state => Get.find<FiatWithdrawInfoLogic>().state;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap16,
        _buildBanCardList(),
        Gaps.vGap10,
      ],
    );
  }

  Widget _buildBanCardList() {
    return Obx(() {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            localized("payee_info"),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
            ),
          ),
          Gaps.vGap6,
          Text(
            localized("wd_to"),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.hint,
            ),
          ),
          Gaps.vGap10,
          _buildAddBankCard(),
          Gaps.vGap6,
          ..._buildBankCardList(),
        ],
      );
    });
  }

  List<Widget> _buildBankCardList() {
    return state.bankCardData.map((element) {
      bool isSelect = (element == state.selectBankCard.value);
      final overlay = GamingOverlay();
      state.bankTipOverlay.add(overlay);
      return Column(
        children: [
          _buildBorderContainer(
            child: Row(
              children: [
                GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => controller.selectBankCard(element),
                  child: SizedBox(
                    height: 48.dp,
                    width: Get.width - 80.dp,
                    child: Row(
                      children: [
                        Gaps.hGap14,
                        SvgPicture.asset(
                          isSelect ? R.iconRadioChecked : R.iconRadioUnChecked,
                          width: 16.dp,
                          height: 16.dp,
                        ),
                        Gaps.hGap6,
                        SizedBox(
                          width: 20.dp,
                          height: 20.dp,
                          child: Image.asset(
                            element.bankIcon,
                            width: 20.dp,
                            height: 20.dp,
                          ),
                        ),
                        Gaps.hGap6,
                        Text(
                          '${element.bankName} ${element.cardNum}',
                          style: GGTextStyle(
                            color: GGColors.textSecond.color,
                            fontSize: GGFontSize.content,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
                GamingPopupLinkWidget(
                  overlay: overlay,
                  followerAnchor: Alignment.topRight,
                  targetAnchor: Alignment.topCenter,
                  triangleSize: Size.zero,
                  popup: _buildBankCardManager(element),
                  offset: Offset(15.dp, 15.dp),
                  triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
                  child: Container(
                    padding: EdgeInsets.all(10.dp),
                    child: SvgPicture.asset(
                      R.iconMore,
                      color: GGColors.highlightButton.color,
                      width: 14.dp,
                      height: 14.dp,
                    ),
                  ),
                ),
                Gaps.hGap2,
              ],
            ),
          ),
          Gaps.vGap6,
        ],
      );
    }).toList();
  }

  Widget _buildAddBankCard() {
    return InkWell(
      onTap: controller.pressAddBankCard,
      child: _buildBorderContainer(
        child: Center(
          child: Text(
            '+ ${localized("add_new_card")}',
            style: GGTextStyle(
              color: GGColors.highlightButton.color,
              fontSize: GGFontSize.content,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBankCardManager(GamingBankCardModel bankCardModel) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 10.dp),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!bankCardModel.isDefault)
            InkWell(
              onTap: () {
                for (var element in controller.state.bankTipOverlay) {
                  element.hide();
                }
                controller.setBankCardDefault(bankCardModel);
              },
              child: Padding(
                padding:
                    EdgeInsets.only(left: 10.dp, right: 10.dp, bottom: 10.dp),
                child: Text(
                  localized('default'),
                  style: GGTextStyle(
                    color: GGColors.textBlackOpposite.color,
                    fontSize: GGFontSize.content,
                  ),
                ),
              ),
            ),
          InkWell(
            onTap: () {
              for (var element in controller.state.bankTipOverlay) {
                element.hide();
              }
              controller.deleteBankCard(bankCardModel);
            },
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 10.dp),
              child: Text(
                localized('delete'),
                style: GGTextStyle(
                  color: GGColors.textSecondDay.color,
                  fontSize: GGFontSize.content,
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildBorderContainer({required Widget child}) {
    return Container(
      height: 48.dp,
      width: double.infinity,
      decoration: BoxDecoration(
        border: Border.all(
          color: GGColors.border.color,
          width: 1.dp,
        ),
        borderRadius: BorderRadius.circular(4.dp),
      ),
      child: child,
    );
  }
}
