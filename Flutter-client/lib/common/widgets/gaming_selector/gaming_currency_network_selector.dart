import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';

// import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';

// import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_list_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_model.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/go_gaming_empty.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_selector.dart';

class GamingCurrencyNetworkSelectorController<T>
    extends GamingSelectorController<T> {
  GamingCurrencyNetworkSelectorController({
    GamingSelectorOnLoad<T>? onLoadDataStream,
    GamingSelectorOnSearch<T>? onSearchDataStream,
    List<T> original = const [],
  }) : super(
          original: original,
          onLoadDataStream: onLoadDataStream,
          onSearchDataStream: onSearchDataStream,
        );

  @override
  Widget getEmptyWidget(BuildContext context) {
    return const GoGamingEmpty(maint: true);
  }
}

class GamingCurrencyNetworkSelector {
  static Future<GamingCurrencyNetworkModel?> show({
    required String currency,
    required CurrencyCategory category,
    void Function(Map<String, List<GamingCurrencyNetworkModel>>)?
        onLoadComplate,
    List<GamingCurrencyNetworkModel>? original,
    String? address,
  }) {
    final controller =
        GamingCurrencyNetworkSelectorController<GamingCurrencyNetworkModel>(
      original: original ?? [],
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
    final isMatchNetwork = original?.firstWhereOrNull(
            (element) => element.isPassAddress(address ?? '')) !=
        null;
    return GamingSelector.custom(
      controller: controller,
      title: localized('sel_net'),
      headerBuilder: GamingSelectorHeaderContentView(
        text: localized('net_note'),
        builder: isMatchNetwork
            ? (context) {
                return Container(
                  decoration: BoxDecoration(
                    color: GGColors.success.color.withOpacity(0.2),
                  ),
                  child: Row(
                    children: [
                      SizedBox(height: 48.dp, width: 18.dp),
                      SvgPicture.asset(
                        R.kycCircleCheckedGreen,
                        width: 20.dp,
                        height: 20.dp,
                      ),
                      SizedBox(width: 10.dp),
                      Expanded(
                        child: Text(
                          localized('auto_fil'),
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.successText.color,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }
            : null,
      ),
      itemBuilder: (context, e, index) {
        return _GamingCurrencyNetworkSelectorItem(
          data: e,
          address: address,
          showMatch: isMatchNetwork,
        );
      },
    );
  }

  static Stream<Map<String, List<GamingCurrencyNetworkModel>>> _loadDataStream({
    required String currency,
    required CurrencyCategory category,
  }) {
    return CurrencyService().getNetworks(category);
  }
}

class _GamingCurrencyNetworkSelectorItem extends StatelessWidget {
  const _GamingCurrencyNetworkSelectorItem({
    required this.data,
    this.address,
    this.showMatch = false,
  });

  final GamingCurrencyNetworkModel data;
  final String? address;
  final bool showMatch;

  @override
  Widget build(BuildContext context) {
    final row = Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp).copyWith(top: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                data.network ?? '',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontFamily: GGFontFamily.dingPro,
                  fontWeight: GGFontWeigh.medium,
                ),
              ),
              SizedBox(width: 12.dp),
              Visibility(
                visible: showMisMatch(),
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
            ],
          ),
          Gaps.vGap8,
          Text(
            data.desc ?? '',
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textHint.color,
              fontFamily: GGFontFamily.dingPro,
            ),
          ),
          Gaps.vGap8,
          Divider(
            color: GGColors.border.color,
            thickness: 1.dp,
            height: 1.dp,
          ),
        ],
      ),
    );
    if (showMisMatch()) {
      return InkWell(
        onTap: () {},
        child: row,
      );
    }
    return row;
  }

  bool showMisMatch() => showMatch && !data.isPassAddress(address ?? '');
}
