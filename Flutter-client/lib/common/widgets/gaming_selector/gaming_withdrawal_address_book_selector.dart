import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/crypto_address/crypto_address_api.dart';
import 'package:gogaming_app/common/api/crypto_address/models/crypto_address_model.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_model.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_selector.dart';

class GamingWithdrawalAddressBookSelector {
  static Future<CryptoAddressModel?> showEWallet({
    required String currency,
    String? paymentName,
    String? code,
    required CurrencyCategory category,
  }) {
    return GamingBottomSheet.show(
      title: localized('select_add_book'),
      footerExpandBuilder: (context) {
        return const _GamingBottomSheetFooter();
      },
      builder: (context) {
        return GamingSelectorView<CryptoAddressModel>(
          itemBuilder: (context, e, index) {
            bool isCanSelected = true;
            GamingOverlay limitOverlay = GamingOverlay();
            if (isCanSelected) {
              return _GamingWithdrawalAddressBookSelectorItem(
                data: e,
                limitOverlay: limitOverlay,
                canSelected: isCanSelected,
                paymentName: paymentName,
              );
            }
          },
          safeAreaBottom: false,
          controller: GamingSelectorController(
            onLoadDataStream: () {
              return _loadDataStream(_systemApi(true), false.obs).map(
                (event) => event
                    .where((e) =>
                        e.currency == currency && e.paymentMethod == code)
                    .toList(),
              );
            },
          ),
        );
      },
    );
  }

  static Future<CryptoAddressModel?> show({
    required String currency,
    required List<GamingCurrencyNetworkModel>? networks,
    required CurrencyCategory category,
    required RxBool isLoadAllNetWorks,
    List<CryptoAddressModel>? original,
    // void Function(List<CryptoAddressModel>)? onLoadComplete,
  }) {
    return GamingBottomSheet.show(
      title: localized('select_add_book'),
      footerExpandBuilder: (context) {
        return const _GamingBottomSheetFooter();
      },
      builder: (context) {
        return GamingSelectorView<CryptoAddressModel>(
          itemBuilder: (context, e, index) {
            bool isCanSelected = false;
            for (int i = 0; i < networks!.length; i++) {
              GamingCurrencyNetworkModel model = networks[i];

              if (model.network == e.network) {
                isCanSelected = true;
              }
            }
            GamingOverlay limitOverlay = GamingOverlay();
            if (isCanSelected) {
              return _GamingWithdrawalAddressBookSelectorItem(
                data: e,
                limitOverlay: limitOverlay,
                canSelected: isCanSelected,
              );
            } else {
              return GestureDetector(
                onTap: () {},
                child: _GamingWithdrawalAddressBookSelectorItem(
                  data: e,
                  limitOverlay: limitOverlay,
                  canSelected: isCanSelected,
                ),
              );
            }
          },
          safeAreaBottom: false,
          controller: GamingSelectorController(
            original: original ?? [],
            onLoadDataStream: original != null
                ? null
                : () {
                    return _loadDataStream(_systemApi(true), isLoadAllNetWorks)
                        .map(
                      (event) => event.where((e) => e.network != null).toList(),
                    );
                  },
          ),
        );
      },
    );
  }

  static Stream<List<CryptoAddressModel>> _loadDataStream(
    PGSpi<GoGamingTarget<GoGamingApi>> api,
    RxBool isLoadAllNetWorks,
  ) {
    return api.rxRequest<List<CryptoAddressModel>>((value) {
      return (value['data'] as List)
          .map((e) => CryptoAddressModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  static PGSpi<GoGamingTarget<GoGamingApi>> _systemApi(bool isWithdraw) {
    return PGSpi(CryptoAddress.getTokenAddress.toTarget(
      input: {
        'isWithdraw': isWithdraw,
      },
    ));
  }
}

class _GamingBottomSheetFooter extends StatelessWidget {
  const _GamingBottomSheetFooter();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48.dp,
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: GGButton(
        backgroundColor: GGColors.highlightButton.color,
        onPressed: () {
          Get.toNamed<void>(Routes.cryptoAddressList.route);
        },
        text: localized('add_new_address'),
      ),
    );
  }
}

class _GamingWithdrawalAddressBookSelectorItem extends StatelessWidget {
  const _GamingWithdrawalAddressBookSelectorItem({
    required this.data,
    required this.limitOverlay,
    required this.canSelected,
    this.paymentName,
  });

  final CryptoAddressModel data;
  final GamingOverlay limitOverlay;
  final bool canSelected;
  final String? paymentName;

  String get name {
    if (paymentName is String) {
      return paymentName!;
    }
    return data.paymentMethod.isEmpty
        ? (data.isUniversalAddress
            ? localized('general_add')
            : localized('common_add'))
        : data.paymentMethod;
  }

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: canSelected ? 1.0 : 0.5,
      child: Container(
        padding: EdgeInsets.only(bottom: 16.dp, left: 16.dp, right: 16.dp),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 12.dp).copyWith(top: 16.dp),
          decoration: BoxDecoration(
            color: GGColors.popBackground.color,
            borderRadius: BorderRadius.all(Radius.circular(8.0.dp)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildName(),
              Gaps.vGap16,
              _buildRowDetail(localized('wd_curr_add'), data.address ?? ''),
              Gaps.vGap16,
              if (data.network != null) ...[
                _buildRowDetail(localized('trans_network'), data.network ?? ''),
                Gaps.vGap16,
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildName() {
    return Row(
      children: [
        Text(
          name,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color.withOpacity(canSelected ? 1 : 0.5),
          ),
        ),
        Gaps.hGap4,
        Visibility(
          visible: data.isUniversalAddress,
          child: GamingPopupLinkWidget(
            overlay: limitOverlay,
            followerAnchor: Alignment.bottomLeft,
            targetAnchor: Alignment.topRight,
            popup: _buildTip(),
            offset: Offset(-20.dp, -10.dp),
            triangleInset: EdgeInsetsDirectional.only(start: 8.dp),
            child: SvgPicture.asset(
              R.iconTipIcon,
              width: 14.dp,
              height: 14.dp,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
        const Spacer(),
        Text(
          data.remark ?? '',
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }

  Widget _buildTip() {
    return SizedBox(
      width: 226.dp,
      height: 60.dp,
      child: Text(
        localized('steps'),
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textBlackOpposite.color,
        ),
        maxLines: 2,
      ),
    );
  }

  Widget _buildRowDetail(String title, String value) {
    return Row(
      children: [
        Text(title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            )),
        const Spacer(),
        Container(
          constraints: BoxConstraints(maxWidth: 200.dp),
          child: RichText(
            text: TextSpan(children: [
              TextSpan(
                text: value,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
                // textAlign
              ),
              WidgetSpan(
                child: Gaps.hGap4,
              ),
            ]),
            textAlign: TextAlign.end,
            maxLines: 2,
          ),
        )
      ],
    );
  }
}
