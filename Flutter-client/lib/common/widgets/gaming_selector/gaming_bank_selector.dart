import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/bank_card/bank_card_api.dart';
import 'package:gogaming_app/common/api/bank_card/models/gaming_bank_model.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_selector.dart';

class GamingBankSelector {
  static Future<GamingBankModel?> show({
    required String currency,
    void Function(List<GamingBankModel>)? onLoadComplate,
    List<GamingBankModel>? original,
  }) {
    return GamingSelector.simple(
      title: localized('sel_bank'),
      itemBuilder: (context, e, index) {
        return _GamingBankSelectorItem(
          data: e,
        );
      },
      original: original ?? [],
      onLoadDataStream: original != null
          ? null
          : () {
              return _loadDataStream(_systemApi(currency)).doOnData((event) {
                onLoadComplate?.call(event);
              });
            },
      onSearchDataStream: (keyword, l) {
        List<GamingBankModel> list = l;
        if (keyword.isNotEmpty) {
          list = l.where((element) {
            return element.search(keyword);
          }).toList();
        }
        return Stream.value(list);
      },
    );
  }

  static Future<GamingBankModel?> showDepositBank({
    required String currency,
    required String paymentCode,
    void Function(List<GamingBankModel>)? onLoadComplate,
    List<GamingBankModel>? original,
  }) {
    return GamingSelector.simple(
      title: localized('sel_bank'),
      itemBuilder: (context, e, index) {
        return _GamingBankSelectorItem(
          data: e,
        );
      },
      original: original ?? [],
      onLoadDataStream: original != null
          ? null
          : () {
              return _loadDataStream(_depositApi(currency, paymentCode))
                  .doOnData((event) {
                onLoadComplate?.call(event);
              });
            },
      onSearchDataStream: (keyword, l) {
        List<GamingBankModel> list = l;
        if (keyword.isNotEmpty) {
          list = l.where((element) {
            return element.search(keyword);
          }).toList();
        }
        return Stream.value(list);
      },
    );
  }

  static PGSpi<GoGamingTarget<GoGamingApi>> _systemApi(String currency) {
    return PGSpi(BankCard.getSystemBank.toTarget(
      input: {
        'currency': currency,
      },
    ));
  }

  static PGSpi<GoGamingTarget<GoGamingApi>> _depositApi(
      String currency, String paymentCode) {
    return PGSpi(BankCard.getDepositBankCard.toTarget(
      input: {
        'currency': currency,
        'paymentCode': paymentCode,
      },
    ));
  }

  static Stream<List<GamingBankModel>> _loadDataStream(
      PGSpi<GoGamingTarget<GoGamingApi>> api) {
    return api.rxRequest<List<GamingBankModel>>((value) {
      return (value['data'] as List)
          .map((e) => GamingBankModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }
}

class _GamingBankSelectorItem extends StatelessWidget {
  const _GamingBankSelectorItem({
    required this.data,
  });

  final GamingBankModel data;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 8.dp),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Image.asset(
            data.bankIcon,
            width: 20.dp,
            height: 20.dp,
            errorBuilder: (context, error, stackTrace) {
              debugPrint('${data.bankCode} ${data.bankNameLocal}');
              return Text(data.bankCode);
            },
          ),
          Gaps.hGap10,
          Expanded(
            child: Text(
              data.bankNameLocal,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
