import 'package:extended_text/extended_text.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/crypto_address/models/crypto_address_model.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

class CryptoAddressItemView extends StatelessWidget {
  const CryptoAddressItemView({
    Key? key,
    required this.model,
    required this.onPressMore,
    required this.isEditing,
    required this.selected,
    required this.onPressSelected,
  }) : super(key: key);

  final CryptoAddressModel model;
  final void Function(CryptoAddressModel model) onPressMore;
  final bool isEditing;
  final bool selected;
  final void Function(CryptoAddressModel model, bool selected) onPressSelected;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        if (isEditing) {
          onPressSelected(model, !selected);
        }
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Gaps.vGap8,
          isEditing
              ? _buildEditRow()
              : _buildItemRow(
                  model.remark ?? '',
                  IconButton(
                    onPressed: () => onPressMore(model),
                    constraints:
                        BoxConstraints(maxHeight: 36.dp, minHeight: 36.dp),
                    icon: const Icon(Icons.more_horiz),
                    padding: EdgeInsetsDirectional.zero,
                    color: GGColors.textSecond.color,
                  ),
                  null,
                  isRemark: true,
                ),
          _buildItemRow(
            localized('whitelist'),
            null,
            model.isWhiteList == true
                ? localized('whitelist')
                : localized('no_whitelist'),
          ),
          _buildItemRow(
            localized('type'),
            null,
            model.paymentMethod.isNotEmpty
                ? model.paymentMethod
                : (model.isUniversalAddress
                    ? localized('common_add')
                    : localized('general_add')),
          ),
          _buildItemRow(
            localized('curr'),
            _buildCoinRightView(model),
            null,
          ),
          _buildItemRow(
            localized('address'),
            null,
            model.address,
          ),
          _buildItemRow(
            localized('trans_network'),
            null,
            model.network ?? '-',
          ),
          const Spacer(),
          Gaps.line,
        ],
      ),
    );
  }

  Widget _buildEditRow() {
    return Row(
      children: [
        GamingCheckBox(
          value: selected,
          padding: EdgeInsets.symmetric(
            vertical: 4.dp,
            // horizontal: 6.dp,
          ),
          size: 20.dp,
          onChanged: (v) {
            onPressSelected(model, v);
          },
        ),
        const Spacer(),
        Text(
          model.remark ?? '',
          style: GGTextStyle(
            fontSize: GGFontSize.smallTitle,
            color: GGColors.textMain.color,
            fontWeight: GGFontWeigh.bold,
            fontFamily: GGFontFamily.dingPro,
          ),
        ),
      ],
    );
  }

  Widget _buildCoinRightView(CryptoAddressModel model) {
    return !model.isUniversalAddress
        ? Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              imageIcon(model.currency ?? ''),
              Gaps.hGap6,
              _buildSubTitle(model.currency ?? ''),
            ],
          )
        // : _buildCommonCoin(model.network ?? '');
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildSubTitle('-'),
            ],
          );
  }

  // Widget _buildCommonCoin(String title) {
  //   return Row(
  //     mainAxisSize: MainAxisSize.min,
  //     children: [
  //       _buildSubTitle(title),
  //       Gaps.hGap10,
  //       Container(
  //         padding: EdgeInsets.symmetric(vertical: 2.dp, horizontal: 5.dp),
  //         decoration: BoxDecoration(
  //           color: GGColors.border.color,
  //           borderRadius: BorderRadius.circular(4.0),
  //         ),
  //         child: Text(
  //           localized("general"),
  //           style: GGTextStyle(
  //             color: GGColors.textSecond.color,
  //             fontSize: GGFontSize.hint,
  //           ),
  //         ),
  //       )
  //     ],
  //   );
  // }

  Widget imageIcon(String token) {
    return GamingImage.network(
      url: CurrencyService.sharedInstance[token]?.iconUrl,
      width: 16,
      height: 16,
    );
  }

  Widget _buildItemRow(String title, Widget? icon, String? subTitle,
      {bool isRemark = false}) {
    return Row(
      children: [
        SizedBox(height: 36.dp),
        Text(
          title,
          style: GGTextStyle(
            fontSize: isRemark ? GGFontSize.smallTitle : GGFontSize.content,
            color: GGColors.textMain.color,
            fontWeight: isRemark ? GGFontWeigh.bold : null,
            fontFamily: isRemark ? GGFontFamily.dingPro : null,
          ),
        ),
        const Spacer(),
        if (icon != null) icon,
        if (subTitle != null) _buildSubTitle(subTitle),
      ],
    );
  }

  Widget _buildSubTitle(String subTitle) {
    final subTitleStyle = GGTextStyle(
      fontSize: GGFontSize.content,
      color: GGColors.textMain.color,
    );
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: 210.dp),
      child: ExtendedText(
        subTitle,
        maxLines: 1,
        style: subTitleStyle,
        overflowWidget: TextOverflowWidget(
          position: TextOverflowPosition.middle,
          // align: TextOverflowAlign.left,
          child: Text('...', style: subTitleStyle),
        ),
      ),
    );
  }
}
