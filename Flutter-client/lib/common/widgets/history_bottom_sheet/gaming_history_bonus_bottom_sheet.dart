import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/history/models/gaming_bonus_model.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../components/number_precision/number_precision.dart';
import '../../service/currency/currency_service.dart';

class GamingHistoryBonusBottomSheet {
  static Future<void> show({
    required GamingBonusModel data,
  }) {
    return GamingBottomSheet.show<DateTime>(
      title: localized('bonus_details'),
      fixedHeight: false,
      builder: (context) {
        return _GamingHistoryBonusBottomSheetItem(
          data: data,
        );
      },
    );
  }
}

class _GamingHistoryBonusBottomSheetItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const _GamingHistoryBonusBottomSheetItem({
    required this.data,
  });

  final GamingBonusModel data;

  @override
  Widget build(BuildContext context) {
    if (data.isNonsticky) {
      return _buildNonstickyDetail();
    }
    if (data.isFreeSpin) {
      return _buildFreeSpinDetail();
    }
    return _buildDetail();
  }

  Widget _buildDetail() {
    return Container(
      padding: EdgeInsets.only(
          bottom: 20.dp + Util.iphoneXBottom, left: 16.dp, right: 16.dp),
      child: Column(
        children: [
          _buildRow(localized('dates'), data.timeToSS),
          Gaps.vGap18,
          _buildRow(localized('order_number'), data.bonusOrderId),
          Gaps.vGap18,
          _buildRow(localized('curr'), data.currency),
          Gaps.vGap18,
          _buildRow(localized('number'), data.amount),
          Gaps.vGap18,
          _buildRow(localized('act_name'), data.bonusName),
          Gaps.vGap18,
          _buildRow(localized('disb_method'),
              '${data.grantName}(${data.statusName})'),
        ],
      ),
    );
  }

  Widget _buildNonstickyDetail() {
    return Container(
      padding: EdgeInsets.only(
          bottom: 20.dp + Util.iphoneXBottom, left: 16.dp, right: 16.dp),
      child: Column(
        children: [
          _buildRow(localized('act_title'),
              data.prizeName.isEmpty ? '-' : data.prizeName),
          Gaps.vGap18,
          _buildRow(localized('act_type'), data.grantName),
          Gaps.vGap18,
          _buildRow(localized('act_name'), data.bonusName),
          Gaps.vGap18,
          _buildRow(
            localized('init_amount'),
            NumberPrecision(data.amount).balanceText(
                CurrencyService.sharedInstance.isDigital(data.currency)),
            last: _currencyIcon(),
          ),
          Gaps.vGap18,
          _buildRow(
            localized('curr_bonus'),
            NumberPrecision(data.balance).balanceText(
                CurrencyService.sharedInstance.isDigital(data.currency)),
            last: _currencyIcon(),
          ),
          Gaps.vGap18,
          _buildRow(
            localized('bet_flow'),
            NumberPrecision(data.currentBetTurnover).balanceText(
                CurrencyService.sharedInstance.isDigital(data.currency)),
            last: _currencyIcon(),
          ),
          Gaps.vGap18,
          _buildRow(
            localized('receive_amount'),
            NumberPrecision(data.withdrawAmount).balanceText(
                CurrencyService.sharedInstance.isDigital(data.currency)),
            last: _currencyIcon(),
          ),
          Gaps.vGap18,
          _buildRow(localized('bet_process'),
              data.betProgress > 100 ? '100%' : "${data.betProgress}%"),
          Gaps.vGap18,
          _buildRow(localized('requirements'), data.betCount),
          Gaps.vGap18,
          _buildRow(localized('stat'), data.statusName),
          Gaps.vGap18,
          _buildRow(localized('release_date'), data.timeToSS),
          Gaps.vGap18,
          _buildRow(localized('last_renew_date'), data.lastUpdateTimeToSS),
        ],
      ),
    );
  }

  Widget _buildFreeSpinDetail() {
    return Container(
      padding: EdgeInsets.only(
          bottom: 20.dp + Util.iphoneXBottom, left: 16.dp, right: 16.dp),
      child: Column(
        children: [
          _buildRow(localized('act_title'),
              data.prizeName.isEmpty ? '-' : data.prizeName),
          Gaps.vGap18,
          _buildRow(localized('act_type'), data.grantName),
          Gaps.vGap18,
          _buildRow(localized('act_name'), data.bonusName),
          Gaps.vGap18,
          _buildRow(localized('support_game'),
              "${data.providerName}/${data.gameName}"),
          Gaps.vGap18,
          _buildRow(localized('bet_total'), data.maxSpinNum),
          Gaps.vGap18,
          _buildRow(
            localized('bet_price'),
            NumberPrecision(data.amount).balanceText(
                CurrencyService.sharedInstance.isDigital(data.currency)),
            last: _currencyIcon(),
          ),
          Gaps.vGap18,
          _buildRow(
            localized('bet_bonus'),
            NumberPrecision(data.balance).balanceText(
                CurrencyService.sharedInstance.isDigital(data.currency)),
            last: _currencyIcon(),
          ),
          Gaps.vGap18,
          _buildRow(
            localized('issued_bonus'),
            NumberPrecision(data.bonusAmount).balanceText(
                CurrencyService.sharedInstance.isDigital(data.currency)),
            last: _currencyIcon(),
          ),
          Gaps.vGap18,
          _buildRow(localized('release_date'), data.timeToSS),
          Gaps.vGap18,
          _buildRow(
              localized('exchange'),
              data.isNonStickyChange
                  ? localized("price_type_8")
                  : localized("cash_rolls")),
          Gaps.vGap18,
          _buildRow(localized('last_renew_date'), data.lastUpdateTimeToSS),
        ],
      ),
    );
  }

  Widget _currencyIcon() {
    return Row(
      children: [
        Gaps.hGap4,
        GamingImage.network(
          url: CurrencyService.sharedInstance.getIconUrl(data.currency),
          width: 14.dp,
          height: 14.dp,
        )
      ],
    );
  }

  Widget _buildRow(String title, dynamic content, {Widget? last}) {
    return Row(
      children: [
        Text(title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            )),
        const Spacer(),
        Text(
          '$content',
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
        last ?? Gaps.empty,
      ],
    );
  }
}
