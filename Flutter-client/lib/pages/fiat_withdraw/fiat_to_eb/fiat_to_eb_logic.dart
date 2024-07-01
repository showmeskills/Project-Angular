import 'dart:async';
import 'dart:math';

import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/crypto_address/models/crypto_address_model.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_withdrawal_address_book_selector.dart';
import 'package:gogaming_app/controller_header.dart';

import 'package:gogaming_app/common/api/currency/currency_api.dart';
import '../../../common/api/auth/auth_api.dart';
import '../../../common/api/auth/models/verify_action.dart';
import '../../../common/api/currency/models/gaming_currency_quota_model.dart';
import '../../../common/api/currency/models/gaming_currency_withdraw_model.dart';
import '../../../common/api/currency/models/payment/gaming_currency_payment_model.dart';
import '../../../common/components/number_precision/number_precision.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/account_service.dart';
import '../../../common/tools/geetest.dart';
import '../../../common/utils/util.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../gg_kyc_middle/id/gg_kyc_middle_state.dart';
import '../../login/mobile_fill/mobile_fill_full_view.dart';
import '../withdraw_result/fiat_to_eb/fiat_withdraw_to_eb_result_view.dart';
import 'fiat_to_eb_confirm_order_view.dart';
import 'fiat_to_eb_state.dart';

class FiatToEBLogic extends BaseController {
  final FiatToEBState state = FiatToEBState();

  var phoneCodeState = PhoneCodeState.unSend.obs;
  RxInt secondLeft = 90.obs;
  Timer? timer;
  String? fullMobileNumber;
  bool? isVoice;

  String? currentCurrency;
  GamingCurrencyPaymentModel? paymentModel;
  GamingCurrencyQuotaModel? currencyQuotaModel;

  FiatToEBLogic({
    String? currency,
    required GamingCurrencyPaymentModel currentPayment,
    required GamingCurrencyQuotaModel? quotaModel,
  }) {
    paymentModel = currentPayment;
    currentCurrency = currency;
    currencyQuotaModel = quotaModel;
  }

  String get _addressReg => paymentModel?.walletAddressValid ?? '';

  late GamingTextFieldController amountTextFieldController =
      GamingTextFieldController(
    onChanged: (text) => _onChanged(),
  );

  late GamingTextFieldController addressTextFieldController =
      GamingTextFieldController(
    onChanged: (text) => _addressOnChanged(text),
  );

  /// 手机验证码
  late GamingTextFieldController codeTextFieldController =
      GamingTextFieldController(
    onChanged: (text) => _onChanged(),
  );

  void _addressOnChanged(String v) {
    if (v.isEmpty) {
      state.addressError.value = localized('enter_wd_curr_ad');
    } else if (!RegExp(_addressReg).hasMatch(v)) {
      state.addressError.value = localized('add_format_error');
    } else {
      state.addressError.value = '';
    }
    _onChanged();
  }

  void _startTimer() {
    timer?.cancel();
    timer = Timer.periodic(const Duration(seconds: 1), (object) {
      if (secondLeft.value > 0) {
        secondLeft.value -= 1;
      } else {
        timer?.cancel();
        secondLeft.value = 90;
        phoneCodeState.value = PhoneCodeState.reSend;
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
    final minAmount = (paymentModel?.minAmount ?? 0.0);

    if (amountTextFieldController.isNotEmpty) {
      state.amountValue.value =
          double.parse(amountTextFieldController.textController.text);
      if (state.amountValue.value <
              FeeService().minAmountFee(currencyQuotaModel, minAmount) ||
          state.amountValue.value > (paymentModel?.maxAmount ?? 0.0) ||
          state.amountValue.value > (currencyQuotaModel?.availQuota ?? 0.0)) {
        amountTextFieldController.addFieldError(
            hint: localized("valid_amount"));
      }
    }
    _checkSubmitEnable();
  }

  void _checkSubmitEnable() {
    if (state.addressType.value == 0) {
      if (amountTextFieldController.isNotEmpty &&
          !amountTextFieldController.showErrorHint &&
          addressTextFieldController.text.value.isNotEmpty &&
          (codeTextFieldController.text.isNotEmpty &&
              codeTextFieldController.isPass)) {
        state.submitEnable.value = true;
      } else {
        state.submitEnable.value = false;
      }
    } else if (state.addressType.value == 1) {
      if (amountTextFieldController.isNotEmpty &&
          !amountTextFieldController.showErrorHint &&
          state.selectAddress.value?.id is int) {
        state.submitEnable.value = true;
      } else {
        state.submitEnable.value = false;
      }
    }
  }

  void _reqOtpCodeFinal(Map<String, dynamic> geetestData) async {
    Map<String, dynamic> reqParams = {
      "areaCode":
          GGUtil.parseStr(AccountService.sharedInstance.gamingUser?.areaCode),
      "mobile": fullMobileNumber,
      "smsVoice": isVoice,
      "otpType": VerifyAction.withdraw.value,
    };
    reqParams.addAll(geetestData);

    PGSpi(Auth.requestOtpCode.toTarget(inputData: reqParams))
        .rxRequest<dynamic>((value) {
      return value;
    }).listen((event) {
      if (event.success == true) {
        phoneCodeState.value = PhoneCodeState.send;
        _startTimer();
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.success,
            title: localized('completed'),
            message: (isVoice ?? false)
                ? localized("voice_send_success")
                : localized("send_sms_success"));
      }
    }).onError((Object error) {
      if (error is GoGamingResponse) {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

  Future<void> _reqOtpCode() async {
    GeeTest.getCaptcha(VerifyAction.withdraw).doOnData((value) {
      if (value != null) {
        _reqOtpCodeFinal(value);
      }
    }).listen((event) {}, onError: (Object err) {
      //获取失败
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('failed'),
        message: err.toString(),
      );
    });
  }

  void sendPhoneCode({bool isVoice = false}) {
    this.isVoice = isVoice;
    MobileFillFullView(
      encryptedMobileNo:
          GGUtil.parseStr(AccountService.sharedInstance.gamingUser?.mobile),
      areaCode:
          GGUtil.parseStr(AccountService.sharedInstance.gamingUser?.areaCode),
      callBack: (mobileNumber) {
        fullMobileNumber = mobileNumber;
        _reqOtpCode();
      },
    ).showFillFullDialog();
  }

  Stream<String?> _verifyOtpCodeMobile() {
    Map<String, dynamic> reqParams = {
      "verifyAction": VerifyAction.withdraw.value,
      "areaCode":
          GGUtil.parseStr(AccountService.sharedInstance.gamingUser?.areaCode),
      "mobile": fullMobileNumber,
      "otpCode": codeTextFieldController.text.value,
      "smsVoice": isVoice,
      "googleCode": '',
    };

    return PGSpi(Auth.general2faVerifyMobile.toTarget(inputData: reqParams))
        .rxRequest<String>((value) {
      return value['data'].toString();
    }).doOnError((p0, p1) {
      Toast.show(
          context: Get.context!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: p0.toString());
    }).map((event) {
      if (event.success == false) {
        Toast.show(
            context: Get.context!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.message.toString());
        return null;
      }
      return event.data;
    });
  }

  void submit() {
    if (state.addressType.value == 0) {
      _verifyOtpCodeMobile().listen((event) {
        if (event?.isNotEmpty ?? false) {
          final fee = FeeService()
              .getFee(currencyQuotaModel, amountTextFieldController.text.value);
          final amount = NumberPrecision(state.amountValue.value)
              .minus(NumberPrecision(fee))
              .toString();
          FiatToEBConfirmOrderView.show<void>(
              amount: amount,
              currency: currentCurrency,
              fee: fee.toString(),
              payMethod: paymentModel?.type.first ?? '',
              address: addressTextFieldController.text.value,
              onSurePressd: () {
                _reqWithdraw(event ?? '', null);
              });
        }
      });
    } else if (state.addressType.value == 1) {
      final addressId = GGUtil.parseStr(state.selectAddress.value?.id);
      final amount = NumberPrecision(state.amountValue.value)
          .minus(NumberPrecision(FeeService().getFee(
              currencyQuotaModel, amountTextFieldController.text.value)))
          .toString();
      FiatToEBConfirmOrderView.show<void>(
          amount: amount,
          currency: currentCurrency,
          fee: FeeService()
              .getFee(currencyQuotaModel, amountTextFieldController.text.value)
              .toString(),
          payMethod: paymentModel?.type.first ?? '',
          address: addressTextFieldController.text.value,
          onSurePressd: () {
            _reqWithdraw(null, addressId);
          });
    }
  }

  Stream<GoGamingResponse<GamingCurrencyWithdrawModel?>> _reqWithdrawFinal(
      String? key, String? addressId) {
    Map<String, dynamic> reqParams = {
      if (key != null) "key": key,
      if (addressId != null) "addressId": addressId,
      "paymentCode": paymentModel?.code,
      "currency": currentCurrency,
      "walletaddress": addressTextFieldController.text.value,
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

  void _reqWithdraw(String? key, String? addressId) {
    SmartDialog.showLoading<void>();
    _reqWithdrawFinal(key, addressId).listen((event) {
      SmartDialog.dismiss<void>();
      if (event.success == true) {
        if (event.data is GamingCurrencyWithdrawModel) {
          GamingCurrencyWithdrawModel model =
              event.data as GamingCurrencyWithdrawModel;
          Get.to<void>(
            () => FiatWithdrawToEBResultPage(
              withdrawModel: model,
              payMethod: paymentModel?.type.first ?? '',
              address: addressTextFieldController.text.value,
            ),
          );
        }
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

  void pressAddressType(int type) {
    state.addressType.value = type;
    addressTextFieldController.textController.clear();
    codeTextFieldController.textController.clear();
    state.selectAddress(null);
  }

  void pressAddressManage() {
    Get.toNamed<void>(Routes.cryptoAddressList.route);
  }

  void addressBookSelect() {
    GamingWithdrawalAddressBookSelector.showEWallet(
      category: CurrencyCategory.withdraw,
      paymentName: paymentModel?.name,
      currency: currentCurrency ?? '',
      code: paymentModel?.code,
    ).then((value) {
      setAddress(value);
    });
  }

  void setAddress(CryptoAddressModel? address) {
    state.selectAddress(address);
    addressTextFieldController.textController.text = address?.address ?? '';

    _onChanged();
  }
}
