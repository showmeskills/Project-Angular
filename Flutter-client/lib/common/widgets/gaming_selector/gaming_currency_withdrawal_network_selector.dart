import 'package:flutter/material.dart';
// import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
// import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_list_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_model.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_selector.dart';

class GamingCurrencyWithdrawalNetworkSelector {
  static Future<GamingCurrencyNetworkModel?> show({
    required String currency,
    required CurrencyCategory category,
    String? address,
    Widget? tipWidget,
    void Function(Map<String, List<GamingCurrencyNetworkModel>>)?
        onLoadComplate,
    List<GamingCurrencyNetworkModel>? original,
  }) {
    return GamingSelector.simple(
      title: localized('sel_net'),
      headerBuilder: GamingSelectorHeaderContentView(
        builder: (context) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (tipWidget != null) tipWidget,
              Text(
                localized('net_note'),
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          );
        },
      ),
      itemBuilder: (context, e, index) {
        return _GamingCurrencyWithdrawalNetworkSelectorItem(
          data: e,
          currency: currency,
          showNoMatch: address != null &&
              address.isNotEmpty &&
              !e.isPassAddress(address),
        );
      },
      original: sortOrigin(original ?? [], address),
      onLoadDataStream: original != null
          ? null
          : () {
              return _loadDataStream(category: category, currency: currency)
                  .doOnData((event) {
                onLoadComplate?.call(event);
              }).flatMap((value) {
                return Stream.value(value[currency] ?? []);
              });
            },
    );
  }

  // 根据传过来的address 和origin 来排序。符合正则的在前面
  static List<GamingCurrencyNetworkModel> sortOrigin(
      List<GamingCurrencyNetworkModel> origin, String? address) {
    if (origin.isEmpty) return origin;
    if (address == null || address.isEmpty) return origin;
    origin.sort((a, b) {
      if (a.isPassAddress(address) && !b.isPassAddress(address)) {
        return -1; // a排在b前面
      } else if (!a.isPassAddress(address) && b.isPassAddress(address)) {
        return 1; // b排在a前面
      } else {
        return 0; // 不需要交换a和b的顺序
      }
    });
    return origin;
  }

  static Stream<Map<String, List<GamingCurrencyNetworkModel>>> _loadDataStream({
    required String currency,
    required CurrencyCategory category,
  }) {
    return CurrencyService().getNetworks(category);
  }
}

class _GamingCurrencyWithdrawalNetworkSelectorItem extends StatelessWidget {
  const _GamingCurrencyWithdrawalNetworkSelectorItem({
    required this.data,
    required this.currency,
    this.showNoMatch = false,
  });

  final GamingCurrencyNetworkModel data;
  final String currency;
  final bool showNoMatch;
  @override
  Widget build(BuildContext context) {
    if (showNoMatch) {
      return InkWell(
        onTap: () {},
        child: Opacity(opacity: 0.5, child: _buildContent()),
      );
    } else {
      return _buildContent();
    }
  }

  Widget _buildContent() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp).copyWith(top: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                currency,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontFamily: GGFontFamily.dingPro,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
              SizedBox(width: 12.dp),
              Visibility(
                visible: showNoMatch,
                child: Container(
                  padding:
                      EdgeInsets.symmetric(vertical: 2.dp, horizontal: 5.dp),
                  decoration: BoxDecoration(
                    color: GGColors.border.color,
                    borderRadius: BorderRadius.circular(4.0),
                  ),
                  child: Text(
                    localized("mismatch00"),
                    style: GGTextStyle(
                      color: GGColors.textSecond.color,
                      fontSize: GGFontSize.hint,
                    ),
                  ),
                ),
              ),
              const Spacer(),
              Text(
                '${localized('est_arr')}≈${data.depositExpectedBlock}${localized('minu')}',
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          ),
          Gaps.vGap4,
          Row(
            children: [
              Text(
                data.desc ?? '',
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textMain.color,
                  fontFamily: GGFontFamily.dingPro,
                ),
              ),
              const Spacer(),
              Text(
                '${localized('network__fee')}${NumberPrecision(data.withdrawFee).balanceText(true)}',
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          ),
          Gaps.vGap4,
          Row(
            children: [
              const Spacer(),
              Text(
                '${data.feeUnit}(≈ \$${data.withdrawFee}${data.feeUnit})',
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          ),
          Gaps.vGap16,
          Divider(
            color: GGColors.border.color,
            thickness: 1.dp,
            height: 1.dp,
          ),
        ],
      ),
    );
  }
}
