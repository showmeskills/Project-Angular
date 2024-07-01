import 'dart:math';

import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/config/global_setting.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/common/api/bank_card/bank_card_api.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';

import '../../../R.dart';
import '../../../common/api/auth/models/verify_action.dart';
import '../../../common/api/bank_card/models/gaming_bank_card_model.dart';
import '../../../common/api/currency/models/gaming_currency_quota_model.dart';
import '../../../common/api/currency/models/gaming_currency_withdraw_model.dart';
import '../../../common/api/currency/models/payment/gaming_currency_payment_model.dart';
import '../../../common/components/number_precision/number_precision.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/secure_service.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../../common/widgets/gg_dialog/dialog_util.dart';
import '../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../withdraw_result/fiat/fiat_withdraw_result_page.dart';
import 'fiat_withdraw_confirm_order_view.dart';
import 'fiat_withdraw_info_state.dart';

class FiatWithdrawInfoLogic extends BaseController {
  final FiatWithdrawInfoState state = FiatWithdrawInfoState();
  String? currentCurrency;
  GamingCurrencyPaymentModel? paymentModel;
  GamingCurrencyQuotaModel? currencyQuotaModel;

  FiatWithdrawInfoLogic({
    String? currency,
    required GamingCurrencyPaymentModel currentPayment,
    required GamingCurrencyQuotaModel? quotaModel,
  }) {
    paymentModel = currentPayment;
    currentCurrency = currency;
    currencyQuotaModel = quotaModel;
  }

  late GamingTextFieldController amountTextFieldController =
      GamingTextFieldController(
    onChanged: (text) => _onChanged(),
  );

  @override
  void onInit() {
    ever<GamingBankCardModel?>(state.selectBankCard, (v) {
      _checkSubmitEnable();
    });

    _onLoadBankCardList().listen((event) {});
    super.onInit();
  }

  void selectBankCard(GamingBankCardModel bankCard) {
    state.selectBankCard(bankCard);
  }

  void pressAddBankCard() {
    Get.toNamed<dynamic>(Routes.addBankCard.route)?.then((value) {
      if (value is bool && value) {
        _onLoadBankCardList().listen((event) {});
      }
    });
  }

  void selectFullAmount() {
    /// 可用余额不足最小可提现额度
    final minAmount = (paymentModel?.minAmount ?? 0.0);
    if ((currencyQuotaModel?.availQuota ?? 0.0) <
        FeeService().minAmountFee(currencyQuotaModel, minAmount)) {
      return;
    }

    num availQuota = min<num>(
        currencyQuotaModel?.availQuota ?? 0.0, paymentModel?.maxAmount ?? 0.0);
    amountTextFieldController.textController.text =
        availQuota.toInt().toString();
  }

  void _onChanged() {
    state.amountValue.value =
        double.tryParse(amountTextFieldController.textController.text) ?? 0.0;
    final minAmount = (paymentModel?.minAmount ?? 0.0);
    if (state.amountValue.value <
            FeeService().minAmountFee(currencyQuotaModel, minAmount) ||
        state.amountValue.value > (paymentModel?.maxAmount ?? 0.0) ||
        state.amountValue.value > (currencyQuotaModel?.availQuota ?? 0.0)) {
      amountTextFieldController.addFieldError(hint: localized("valid_amount"));
    }
    _checkSubmitEnable();
  }

  void _checkSubmitEnable() {
    if (amountTextFieldController.isNotEmpty &&
        !amountTextFieldController.showErrorHint &&
        state.selectBankCard.value != null) {
      state.submitEnable.value = true;
    } else {
      state.submitEnable.value = false;
    }
  }

  Stream<void> _onLoadBankCardList() {
    return PGSpi(BankCard.getBankCard.toTarget())
        .rxRequest<List<GamingBankCardModel>>((value) {
      return (value['data'] as List)
          .map((e) => GamingBankCardModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).doOnData((event) {
      state.bankCardData.assignAll(event.data);
      state.selectBankCard(
          state.bankCardData.firstWhereOrNull((element) => element.isDefault));
    });
  }

  void submit() {
    final amount = NumberPrecision(state.amountValue.value)
        .minus(NumberPrecision(FeeService()
            .getFee(currencyQuotaModel, amountTextFieldController.text.value)))
        .toString();
    FiatWithdrawConfirmOrderView.show<void>(
        amount: amount,
        currency: currentCurrency,
        bankName: state.selectBankCard.value?.bankName,
        bankCardNum: state.selectBankCard.value?.cardNum,
        onSurePressd: () {
          _reqWithdraw();
        });
  }

  Stream<GoGamingResponse<GamingCurrencyWithdrawModel?>> _reqWithdrawFinal() {
    Map<String, dynamic> reqParams = {
      "paymentCode": paymentModel?.code,
      "currency": currentCurrency,
      "bankCardId": state.selectBankCard.value?.id,
      "amount": double.parse(amountTextFieldController.text.value),
      "actionType": paymentModel?.actionType
    };
    return PGSpi(Currency.withdrawCurrceny.toTarget(inputData: reqParams))
        .rxRequest<GamingCurrencyWithdrawModel?>((value) {
      if (value['data'] == null) return null;
      final data = value['data'] as Map<String, dynamic>;
      return GamingCurrencyWithdrawModel.fromJson(data);
    });
  }

  void deleteBankCard(GamingBankCardModel bankCardModel) {
    final content = localized('oper_can_be00');
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized("del_bank_ca01"),
      content: content,
      rightBtnName: localized('confirm_button'),
      leftBtnName: '',
      onRightBtnPressed: () {
        Get.back<dynamic>();
        _verify2fa(action: VerifyAction.delBankCard, id: bankCardModel.id);
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  void _verify2fa({
    required VerifyAction action,
    required int id,
  }) {
    if (SecureService.sharedInstance.checkSecure()) {
      Get.toNamed<dynamic>(Routes.secure.route, arguments: {
        'otpType': action,
        'on2FaSuccess': (String code) =>
            _delete(action: action, id: id, code: code),
      });
    }
  }

  void _delete({
    required VerifyAction action,
    required int id,
    required String code,
  }) {
    SmartDialog.showLoading<void>();
    late PGSpi<GoGamingTarget<GoGamingApi>> api;
    if (action == VerifyAction.batchDelBankCard) {
      api = PGSpi(BankCard.batchDelete.toTarget(
        inputData: {
          'ids': id,
          'key': code,
        },
      ));
    } else {
      api = PGSpi(BankCard.delete.toTarget(
        inputData: {
          'id': id,
          'key': code,
        },
      ));
    }
    api.rxRequest<Object?>((value) {
      return null;
    }).doOnData((event) {
      state.bankCardData.removeWhere((element) => id == element.id);
      Toast.showSuccessful(localized('dele_card_s'));
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showFailed(localized('dele_card_f'));
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }

  void setBankCardDefault(GamingBankCardModel bankCardModel) {
    showLoading();
    PGSpi(BankCard.updateDefault.toTarget(inputData: {'id': bankCardModel.id}))
        .rxRequest<Map<String, dynamic>>((value) {
      return value;
    }).doOnData((event) {
      state.bankCardData.assignAll(state.bankCardData.map((element) {
        if (element.isDefault) {
          return element.copyWith(isDefault: false);
        }
        if (element.id == bankCardModel.id) {
          return element.copyWith(isDefault: true);
        }
        return element;
      }).toList()
        ..sort((a, b) => b.isDefault ? 1 : 0));
      state.selectBankCard.value = state.bankCardData.first;
      state.bankCardData.refresh();
      Toast.showSuccessful(localized("def_card_s"));
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showFailed(localized('def_card_f'));
      }
    }).doOnDone(() {
      hideLoading();
    }).listen(null, onError: (p0, p1) {});
  }

  void _reqWithdraw() {
    SmartDialog.showLoading<void>();
    _reqWithdrawFinal().listen((event) {
      SmartDialog.dismiss<void>();
      if (event.success == true) {
        GamingCurrencyWithdrawModel model =
            event.data as GamingCurrencyWithdrawModel;
        Get.to<void>(() => FiatWithdrawResultPage(
              withdrawModel: model,
            ));
      }
    }, onError: (Object e) {
      SmartDialog.dismiss<void>();
      Toast.show(
          context: Get.overlayContext!,
          contentMaxLines: 5,
          state: GgToastState.fail,
          title: localized('failed'),
          message: e.toString());
    });
  }
}
