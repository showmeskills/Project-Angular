import 'package:flutter/widgets.dart';
import 'package:gogaming_app/common/api/currency/models/ewallet_payment_list_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_selector_with_all.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_e_wallet_payment_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:gogaming_app/pages/crypto_address/crypto_address_list/crypto_address_list_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import 'crypto_address_filter_enum.dart';

part 'crypto_address_filter_state.dart';

class CryptoAddressFilterLogic extends BaseController {
  final state = CryptoAddressFilterState();

  void setEWalletPaymentList(List<EWalletPaymentListModel> value) {
    state._ewalletPaymentList = value;
  }

  void onPaymentSelect() {
    GamingSelector.simple<CryptoAddressPayMethod>(
      title: localized('pay_method'),
      original: CryptoAddressPayMethod.values,
      fixedHeight: false,
      itemBuilder: (context, value, index) {
        return Container(
          alignment: Alignment.centerLeft,
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
          height: 48.dp,
          child: Text(
            value.text,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: state.type == value
                  ? GGColors.highlightButton.color
                  : GGColors.textMain.color,
            ),
          ),
        );
      },
    ).then((value) {
      if (value != null) {
        state._type.value = value;
      }
    });
  }

  void onTypeSelect() {
    GamingSelector.simple<CryptoAddressIsUniversal>(
      title: localized('type'),
      original: CryptoAddressIsUniversal.values,
      fixedHeight: false,
      itemBuilder: (context, value, index) {
        return Container(
          alignment: Alignment.centerLeft,
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
          height: 48.dp,
          child: Text(
            value.text,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: state.isUniversalAddress == value
                  ? GGColors.highlightButton.color
                  : GGColors.textMain.color,
            ),
          ),
        );
      },
    ).then((value) {
      if (value != null) {
        state._isUniversalAddress.value = value;
      }
    });
  }

  void onEWalletPaymentSelect() {
    GamingEWalletPaymentSelector.show(
        original: state._ewalletPaymentList,
        onLoadComplate: (value) {
          state._ewalletPaymentList = value;
        }).then((value) {
      if (value != null) {
        if (value.code == null) {
          state._ewalletPayment.value = null;
        } else {
          state._ewalletPayment.value = value;
        }
      }
    });
  }

  void onCurrencySelect() {
    if (state.type == CryptoAddressPayMethod.electronic) {
      GamingEWalletCurrencySelector.show(
        original: state._ewalletPaymentList,
        payment: state.ewalletPayment,
        onLoadComplate: (p0) {
          state._ewalletPaymentList = p0;
        },
      ).then((value) {
        if (value != null) {
          if (value.currency == localized('all')) {
            state._currency.value = null;
          } else {
            state._currency.value = value;
          }
        }
      });
      return;
    }

    GamingCurrencySelectorWithAll.show(
      isDigital: true,
    ).then((value) {
      if (value != null) {
        if (value.currency == localized('all')) {
          state._currency.value = null;
        } else {
          state._currency.value = value;
        }
      }
    });
  }

  void onIsWhitelistSelect() {
    GamingSelector.simple<CryptoAddressIsWhitelist>(
      title: localized('whitelist'),
      original: CryptoAddressIsWhitelist.values,
      fixedHeight: false,
      itemBuilder: (context, value, index) {
        return Container(
          alignment: Alignment.centerLeft,
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
          height: 48.dp,
          child: Text(
            value.text,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: state.isWhiteList == value
                  ? GGColors.highlightButton.color
                  : GGColors.textMain.color,
            ),
          ),
        );
      },
    ).then((value) {
      if (value != null) {
        state._isWhiteList.value = value;
      }
    });
  }

  void reset() {
    state._currency.value = null;
    state._type.value = CryptoAddressPayMethod.all;
    state._isUniversalAddress.value = CryptoAddressIsUniversal.all;
    state._isWhiteList.value = CryptoAddressIsWhitelist.all;
    state._ewalletPayment.value = null;
  }

  void submit() {
    Get.findOrNull<CryptoAddressListLogic>()?.setFilter(
      currency: state.currency?.currency,
      walletAddressType: state.type.value,
      isUniversalAddress: state.isUniversalAddress.value,
      isWhiteList: state.isWhiteList.value,
      paymentMethod: state.ewalletPayment?.code,
    );
    Get.back<void>();
  }
}
