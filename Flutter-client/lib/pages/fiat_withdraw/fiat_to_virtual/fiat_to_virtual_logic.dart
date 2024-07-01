import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/config/global_setting.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/withdraw/withdraw_api.dart';
import '../../../R.dart';
import '../../../common/api/auth/models/verify_action.dart';
import '../../../common/api/crypto_address/models/crypto_address_model.dart';
import '../../../common/api/currency/models/gaming_currency_network_list_model.dart';
import '../../../common/api/currency/models/gaming_currency_network_model.dart';
import '../../../common/api/currency/models/gaming_currency_quota_model.dart';
import '../../../common/api/currency/models/gaming_currency_virtual_rate_model.dart';
import '../../../common/api/currency/models/gaming_currency_withdraw_model.dart';
import '../../../common/api/currency/models/payment/gaming_currency_payment_model.dart';
import '../../../common/components/number_precision/number_precision.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/currency/currency_service.dart';
import '../../../common/service/secure_service.dart';
import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../common/utils/util.dart';
import '../../../common/widgets/gaming_selector/gaming_currency_withdrawal_network_selector.dart';
import '../../../common/widgets/gaming_selector/gaming_withdrawal_address_book_selector.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../../config/gaps.dart';
import '../../../helper/perimission_util.dart';
import '../../qr_code_scanner/qr_code_scanner_view.dart';
import '../withdraw_result/fiat_to_virtual/fiat_withdraw_to_virtual_result_view.dart';
import 'fiat_to_virtual_confirm_order_view.dart';
import 'fiat_to_virtual_state.dart';

class FiatToVirtualLogic extends GetxController {
  final FiatToVirtualState state = FiatToVirtualState();

  GamingCurrencyPaymentModel? paymentModel;
  GamingCurrencyQuotaModel? currencyQuotaModel;
  String? currentCurrency;
  RxBool isLoadAllNetWorks = false.obs;
  RxBool showNetworkWidgetTip = false.obs;
  List<GamingCurrencyNetworkListModel> tokenNetworks = [];
  GamingCurrencyNetworkListModel? selectedNetWorkToken;
  RegExp? reg;

  FiatToVirtualLogic({
    String? currency,
    required GamingCurrencyPaymentModel currentPayment,
    required GamingCurrencyQuotaModel? quotaModel,
  }) {
    paymentModel = currentPayment;
    currencyQuotaModel = quotaModel;
    currentCurrency = currency;
  }

  late GamingTextFieldController amountTextFieldController =
      GamingTextFieldController(
    onChanged: (text) => _onChanged(),
  );

  void _onChanged() {
    double printAmount = _printAmount();
    state.amountValue(printAmount);
    final minAmount = (paymentModel?.minAmount ?? 0.0);
    if (printAmount <
            FeeService().minAmountFee(currencyQuotaModel, minAmount) ||
        printAmount > (paymentModel?.maxAmount ?? 0.0) ||
        printAmount > (currencyQuotaModel?.availQuota ?? 0.0)) {
      amountTextFieldController.addFieldError(hint: localized("valid_amount"));
    }
    validateWithdrawNext();
  }

  double _printAmount() {
    if (amountTextFieldController.textController.text.isEmpty) {
      return 0.0;
    }
    return double.parse(amountTextFieldController.textController.text);
  }

  @override
  void onInit() {
    _onLoadRateData().listen((event) {});
    _loadAllNetworks();
    _loadSupportCurrency();
    state.addressController = GamingTextFieldController(
      onChanged: _addressOnChanged,
    );
    super.onInit();
  }

  void _addressOnChanged(String v) {
    if (v.isEmpty) {
      state.addressError.value = localized('enter_wd_curr_ad');
      showNetworkWidgetTip.value = false;
    } else if (reg != null && !reg!.hasMatch(v)) {
      state.addressError.value = localized('add_format_error');
      showNetworkWidgetTip.value = false;
    } else {
      state.addressError.value = '';
      showNetworkWidgetTip.value = true;
    }
    validateWithdrawNext();
  }

  void addressBookSelect() {
    if (state.networks.isEmpty) {
      _loadAllNetworks();
    }

    if (state.curNetworks.isEmpty) {
      state.curNetworks.value = state.networks[state.currency.value] ?? [];
    }

    GamingWithdrawalAddressBookSelector.show(
      category: CurrencyCategory.withdraw,
      currency: state.currency.value,
      networks: state.networks[state.currency.value] ?? [],
      isLoadAllNetWorks: isLoadAllNetWorks,
    ).then((value) {
      _setAddress(value);
    });
  }

  void selectNetwork() {
    Widget widget = Container(
      height: 48.dp,
      margin: EdgeInsets.only(bottom: 24.dp),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4.dp),
        color: GGColors.success.color.withOpacity(0.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Gaps.hGap16,
          Image.asset(
            R.commonToastSuccess,
            width: 18.dp,
            height: 18.dp,
          ),
          Gaps.hGap8,
          Text(
            localized('choo_main01'),
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.success.color,
            ),
          ),
        ],
      ),
    );
    GamingCurrencyWithdrawalNetworkSelector.show(
      category: CurrencyCategory.withdraw,
      currency: state.currency.value,
      original: state.networks[state.currency.value],
      tipWidget: showNetworkWidgetTip.value ? widget : Container(),
      address: showNetworkWidgetTip.value
          ? state.addressController.textController.text
          : '',
      onLoadComplate: (v) {},
    ).then((value) {
      if (value != null) {
        state.editAddress.value = true;

        /// 输入地址，重新选择网络情况
        _addressOnChanged(state.addressController.text.value);
        onCryptoNetworkSelected(value);
      }
    });
  }

  /// 从地址薄选择地址
  void _setAddress(CryptoAddressModel? address) {
    state.selectAddress.value = address;
    state.addressController.textController.text = address?.address ?? '';
    List<GamingCurrencyNetworkModel> list =
        state.networks[state.currency.value] ?? [];
    for (int i = 0; i < list.length; i++) {
      GamingCurrencyNetworkModel model = list[i];
      if (model.network == address?.network) {
        onCryptoNetworkSelected(model);
      }
    }
  }

  void onCryptoNetworkSelected(GamingCurrencyNetworkModel? network) {
    state.network.value = network;
    updateReg(network?.addressRegex ?? '');
    validateWithdrawNext();
  }

  /// 检查可否点击下一步
  void validateWithdrawNext() {
    state.submitEnable.value = validateWithdrawNextEnable();
  }

  void updateReg(String addressRegex) {
    reg = RegExp(addressRegex);
  }

  bool validateWithdrawNextEnable() {
    if (state.addressError.isNotEmpty && state.useNewAddress.value) {
      return false;
    }

    if (state.useNewAddress.value &&
        (state.addressController.textController.text.isEmpty ||
            !reg!.hasMatch(state.addressController.textController.text))) {
      return false;
    }

    if (!state.useNewAddress.value && (state.selectAddress.value == null)) {
      return false;
    }

    if (GGUtil.parseDouble(amountTextFieldController.textController.text) ==
            0 ||
        amountTextFieldController.showErrorHint) {
      return false;
    }
    return true;
  }

  void onPressScan() {
    GamingPermissionUtil.onlyCamera().then((value) {
      Get.to<String>(const QRCodeScannerPage())?.then((value) {
        if (value is String && value.isNotEmpty) {
          state.addressController.textController.text = value;
        }
      });
    });
  }

  void _loadSupportCurrency() {
    CurrencyService.sharedInstance
        .getVirtualToCurrency('Withdraw')
        .doOnData((event) {
      List<GamingCurrencyModel>? currencyList =
          event?.where((e) => e.isVisible == true).toList();
      currencyList?.sort((a, b) => a.sort.compareTo(b.sort));
      state.currencyList.value = currencyList ?? [];
      _initCurrency();
    }).listen((event) {});
  }

  double getRate(String currency) {
    return state.currentRate.value?.rates
            .firstWhereOrNull(
                (element) => element.currency == state.currency.value)
            ?.rate ??
        0.0;
  }

  void selectFullAmount() {
    /// 可用余额不足最小可提现额度
    final minAmount = (paymentModel?.minAmount ?? 0.0);
    if ((currencyQuotaModel?.availQuota ?? 0.0) <
        (minAmount +
            FeeService().minAmountFee(currencyQuotaModel, minAmount))) {
      return;
    }

    num availQuota = min<num>(
        currencyQuotaModel?.availQuota ?? 0.0, paymentModel?.maxAmount ?? 0.0);
    amountTextFieldController.textController.text =
        availQuota.toInt().toString();
  }

  void submit() {
    FiatToVirtualConfirmOrderView.show<void>(
        amount: amountTextFieldController.textController.text,
        currency: currentCurrency,
        receiptAmount: getExpArrContent(),
        receiptCurrency: state.currency.value,
        fee:
            '${(state.network.value?.withdrawFee ?? 0.0).stripTrailingZerosNum()}',
        address: state.addressController.textController.text,
        onSurePressd: () {
          _reqWithdraw();
        });
  }

  String getExpArrContent() {
    /// 除数为 0 直接返回
    if (getRate(state.currency.value) == 0) {
      return 0.toStringAsFixed(8);
    }

    final result = NumberPrecision(state.amountValue.value)
        .minus(NumberPrecision(FeeService().getFee(
            currencyQuotaModel, amountTextFieldController.textController.text)))
        .divide(NumberPrecision(getRate(state.currency.value)))
        .minus(NumberPrecision(state.network.value?.withdrawFee))
        .toNumber();
    if (result < 0.0) {
      return 0.toStringAsFixed(8);
    } else {
      return result.toStringAsFixed(8);
    }
  }

  String getEstimatedWithdraw() {
    /// 除数为 0 直接返回
    if (getRate(state.currency.value) == 0) {
      return 0.toStringAsFixed(8);
    }

    final result = NumberPrecision(state.amountValue.value)
        .minus(NumberPrecision(FeeService()
            .getFee(currencyQuotaModel, amountTextFieldController.text.value)))
        .divide(NumberPrecision(getRate(state.currency.value)))
        .toNumber();
    if (result < 0) {
      return 0.toStringAsFixed(8);
    } else {
      return result.toStringAsFixed(8);
    }
  }

  Stream<GoGamingResponse<GamingCurrencyWithdrawToVirtualModel?>>
      _reqWithdrawFinal(String code) {
    Map<String, dynamic> reqParams = {
      "key": code,
      "paymentCode": paymentModel?.code,
      "currency": currentCurrency,
      "amount": double.parse(amountTextFieldController.text.value),
      "actionType": paymentModel?.actionType,
      "withdrawCurrency": state.currency.value,
      "rateId": state.currentRate.value?.rateId,
    };
    if (state.useNewAddress.value) {
      reqParams["network"] = state.network.value?.network;
      reqParams["address"] = state.addressController.textController.text;
    } else {
      reqParams["addressId"] = state.selectAddress.value?.id;
      reqParams["network"] = state.selectAddress.value?.network;
      reqParams["address"] = state.selectAddress.value?.address;
    }
    return PGSpi(Withdraw.currcencyToCoin.toTarget(inputData: reqParams))
        .rxRequest<GamingCurrencyWithdrawToVirtualModel?>((value) {
      if (value['data'] == null) return null;
      final data = value['data'] as Map<String, dynamic>;
      return GamingCurrencyWithdrawToVirtualModel.fromJson(data);
    });
  }

  void _reqWithdraw() {
    if (SecureService.sharedInstance.checkSecure()) {
      Get.toNamed<dynamic>(Routes.secure.route, arguments: {
        'otpType': VerifyAction.withdraw,
        'on2FaSuccess': (String code) {
          SmartDialog.showLoading<void>();
          _reqWithdrawFinal(code).listen((event) {
            SmartDialog.dismiss<void>();
            if (event.success == true && event.data != null) {
              Get.to<void>(() => FiatWithdrawToVirtualResultPage(
                    receiptAmount: getExpArrContent(),
                    withdrawModel: event.data!,
                  ));
              GlobalSetting.sharedInstance.queryNormalRiskFormAndDialog();
            }
          }, onError: (Object e) {
            SmartDialog.dismiss<void>();
            Toast.show(
              context: Get.overlayContext!,
              contentMaxLines: 5,
              state: GgToastState.fail,
              title: localized('failed'),
              message: e.toString(),
            );
          });
        },
      });
    }
  }

  void _initCurrency() {
    final currencyService = CurrencyService.sharedInstance;
    final defaultCurrency = GamingCurrencyModel.usdt();
    GamingCurrencyModel selectedCurrency = defaultCurrency;
    final currencyList = state.currencyList;

    if (currencyList
            .map((e) => e.currency)
            .contains(currencyService.selectedCurrency.currency) &&
        currencyService.selectedCurrency.isDigital) {
      selectedCurrency = currencyService.selectedCurrency;
    }

    if (!currencyList
        .map((e) => e.currency)
        .contains(selectedCurrency.currency)) {
      selectedCurrency = currencyList.firstOrNull ?? defaultCurrency;
    }
    state.currency.value = selectedCurrency.currency ?? '';
  }

  void changeToNewAddress() {
    state.useNewAddress.value = true;
    reset();
  }

  void changeToAddressBook() {
    state.useNewAddress.value = false;
    if (state.networks.isEmpty) {
      _loadAllNetworks();
    }
    reset();
  }

  void reset() {
    state.addressError.value = '';
    state.editAddress.value = false;
    state.addressController.addFieldError(showErrorHint: false);
    state.addressController.textController.text = '';
    onCryptoNetworkSelected(null);
    _setAddress(null);
  }

  void _loadAllNetworks() {
    isLoadAllNetWorks.value = true;
    CurrencyService().getNetworks(CurrencyCategory.withdraw).listen((event) {
      state.networks = event;
      isLoadAllNetWorks.value = false;
      tokenNetworks = CurrencyService.sharedInstance.withdrawNetworks;
      updateReg(state.currency.value);
    });
  }

  Stream<void> _onLoadRateData() {
    return PGSpi(Currency.getFiatToVirtualRate.toTarget(
      input: {'category': 'Withdraw', 'currency': currentCurrency},
    )).rxRequest<GamingCurrencyVirtualRateModel>((value) {
      return GamingCurrencyVirtualRateModel.fromJson(
        value['data'] as Map<String, dynamic>,
      );
    }).doOnData((event) {
      state.currentRate.value = event.data;
    });
  }
}
