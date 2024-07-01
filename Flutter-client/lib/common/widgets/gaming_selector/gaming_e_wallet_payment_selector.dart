import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/ewallet_payment_list_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_currency_selector.dart';
import 'gaming_currency_selector_with_all.dart';
import 'gaming_selector.dart';

class GamingEWalletCurrencySelector {
  static Future<GamingCurrencyModel?> show({
    void Function(List<EWalletPaymentListModel>)? onLoadComplate,
    List<EWalletPaymentListModel>? original,
    EWalletPaymentListModel? payment,
  }) {
    return GamingSelector.simple(
      title: localized('select_cur'),
      itemBuilder: (context, e, index) {
        return GamingCurrencySelectorItem(
          data: e,
        );
      },
      original: getCurrencyList(original, payment),
      onLoadDataStream: original != null
          ? null
          : () {
              return GamingEWalletPaymentSelector.loadDataStream()
                  .flatMap((event) {
                onLoadComplate?.call(event);
                return Stream.value(getCurrencyList(event, payment));
              });
            },
      onSearchDataStream: (keyword, l) {
        List<GamingCurrencyModel> list = l;
        if (keyword.isNotEmpty) {
          list = l.where((element) {
            return element.currency!
                    .toLowerCase()
                    .contains(keyword.toLowerCase()) ||
                element.name!.toLowerCase().contains(keyword.toLowerCase());
          }).toList();
        }
        return Stream.value(list);
      },
    );
  }

  static List<GamingCurrencyModel> getCurrencyList(
      List<EWalletPaymentListModel>? event, EWalletPaymentListModel? payment) {
    if (event?.isEmpty ?? true) {
      return [];
    }
    final currency = event!
            .firstWhereOrNull((element) => element.code == payment?.code)
            ?.supportCurrency ??
        [];
    return GamingCurrencySelectorWithAll.getAllList().where((element) {
      return currency.contains(element.currency) ||
          element.currency == localized('all');
    }).toList();
  }
}

class GamingEWalletPaymentSelector {
  static Future<EWalletPaymentListModel?> show({
    void Function(List<EWalletPaymentListModel>)? onLoadComplate,
    List<EWalletPaymentListModel>? original,
  }) {
    return GamingSelector.simple(
      title: localized('type'),
      itemBuilder: (context, e, index) {
        return _GamingEWalletPaymentSelectorItem(
          data: e,
        );
      },
      original: original ?? [],
      onLoadDataStream: original != null
          ? null
          : () {
              return loadDataStream().doOnData((event) {
                onLoadComplate?.call(event);
              });
            },
    );
  }

  static Stream<List<EWalletPaymentListModel>> loadDataStream() {
    return PGSpi(Currency.geteWalletPaymentList.toTarget())
        .rxRequest<List<EWalletPaymentListModel>>((value) {
      return (value['data'] as List)
          .map((e) =>
              EWalletPaymentListModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(
        value.data
          ..insert(
            0,
            EWalletPaymentListModel(
              code: null,
              name: localized('all'),
              supportCurrency: value.data.fold([], (previousValue, element) {
                return (previousValue?..addAll(element.supportCurrency ?? []))
                    ?.toSet()
                    .toList();
              }),
            ),
          ),
      );
    });
  }
}

class _GamingEWalletPaymentSelectorItem extends StatelessWidget {
  const _GamingEWalletPaymentSelectorItem({
    required this.data,
  });

  final EWalletPaymentListModel data;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      height: 48.dp,
      alignment: Alignment.centerLeft,
      child: Text(
        data.name ?? '',
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textMain.color,
        ),
      ),
    );
  }
}
