import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/bank_card/models/gaming_bank_card_model.dart';
import 'package:gogaming_app/common/painting/selected_rounded_rectangle_border.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/bank_card/list/bank_card_list_logic.dart';
import 'package:gogaming_app/widget_header.dart';

class BankCardListItem extends StatelessWidget with GamingOverlayMixin {
  BankCardListItem({super.key, required this.data});

  final GamingBankCardModel data;

  BankCardListLogic get logic => Get.find<BankCardListLogic>();
  bool get selected => logic.selected.contains(data.id);
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        if (logic.batch) {
          logic.select(data.id, !selected);
        }
      },
      child: Stack(
        children: [
          Column(
            children: [
              Obx(() {
                if (logic.batch) {
                  return _buildCheckBox();
                }
                return _buildMoreIcon();
              }),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: 16.dp,
                ),
                child: Column(
                  children: [
                    _buildCardInfo(
                      title: localized('curr'),
                      value: data.currencyType,
                    ),
                    Gaps.vGap10,
                    _buildCardInfo(
                      title: localized('acc_name'),
                      value: data.name,
                    ),
                    Gaps.vGap10,
                    _buildBank(),
                    Gaps.vGap10,
                    _buildCardInfo(
                      title: localized('bc_num'),
                      value: data.cardNum,
                    ),
                    Gaps.vGap20,
                  ],
                ),
              ),
              Divider(
                thickness: 1.dp,
                height: 1.dp,
                color: GGColors.border.color,
              ),
            ],
          ),
          Obx(() {
            if (logic.batch) {
              return Gaps.empty;
            }
            return Container(
              decoration: ShapeDecoration(
                shape: SelectedRoundedRectangleBorder(
                  color: GGColors.highlightButton.color,
                  iconColor: GGColors.textMain.color,
                  size: data.isDefault ? Size(32.dp, 32.dp) : Size.zero,
                  borderRadius: BorderRadius.circular(4.dp),
                ),
              ),
              width: 32.dp,
              height: 32.dp,
            );
          }),
        ],
      ),
    );
  }

  Widget _buildMoreMenu({
    required String title,
    required VoidCallback onPressed,
  }) {
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: onPressed,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: 12.dp,
          vertical: 10.dp,
        ),
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textBlackOpposite.color,
          ),
        ),
      ),
    );
  }

  Widget _buildCheckBox() {
    return Container(
      padding: EdgeInsets.symmetric(
        vertical: 10.dp,
        horizontal: 10.dp,
      ),
      alignment: Alignment.centerLeft,
      child: GamingCheckBox(
        value: selected,
        padding: EdgeInsets.symmetric(
          vertical: 4.dp,
          horizontal: 6.dp,
        ),
        onChanged: (v) {
          logic.select(data.id, v);
        },
      ),
    );
  }

  Widget _buildMoreIcon() {
    return Container(
      padding: EdgeInsets.only(left: 16.dp, right: 10.dp),
      margin: EdgeInsets.symmetric(vertical: 8.dp),
      alignment: Alignment.centerRight,
      child: GamingPopupLinkWidget(
        overlay: overlay,
        contentPadding: EdgeInsets.zero,
        targetAnchor: Alignment.bottomRight,
        followerAnchor: Alignment.topRight,
        offset: Offset(0, -6.dp),
        popup: Container(
          constraints: BoxConstraints(
            minWidth: 150.dp,
          ),
          child: Column(
            children: [
              if (!data.isDefault)
                _buildMoreMenu(
                  title: localized('set_bc'),
                  onPressed: setDefault,
                ),
              _buildMoreMenu(
                title: localized('delete'),
                onPressed: delete,
              ),
            ],
          ),
        ),
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 6.dp, horizontal: 6.dp),
          child: SvgPicture.asset(
            R.iconMore,
            width: 15.dp,
            height: 15.dp,
            color: GGColors.textSecond.color,
          ),
        ),
      ),
    );
  }

  Widget _buildBank() {
    return Row(
      children: [
        Text(
          localized('bank'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.hGap16,
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Image.asset(
                data.bankIcon,
                width: 16.dp,
                height: 16.dp,
              ),
              Gaps.hGap10,
              Flexible(
                child: Text(
                  data.bankName,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                  textAlign: TextAlign.end,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCardInfo({
    required String title,
    String value = '',
  }) {
    return Row(
      children: [
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.hGap16,
        Expanded(
          child: Text(
            value,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }
}

extension _Action on BankCardListItem {
  void delete() {
    hidePopup();
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('del_bank_ca01'),
      content: localized('oper_can_be00'),
      leftBtnName: localized('cancels'),
      rightBtnName: localized('confirm_button'),
      onRightBtnPressed: () {
        Get.back<void>();
        logic.delete(data.id);
      },
    ).showNoticeDialogWithTwoButtons();
  }

  void setDefault() {
    hidePopup();
    logic.setDefault(data.id);
  }
}
