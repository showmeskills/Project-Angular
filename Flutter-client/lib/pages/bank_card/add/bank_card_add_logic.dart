import 'dart:async';

import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/bank_card/bank_card_api.dart';
import 'package:gogaming_app/common/api/bank_card/models/gaming_bank_model.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_error.dart';
import 'package:gogaming_app/common/api/base/go_gaming_response.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/service/secure_service.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_bank_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

class BankCardAddLogic extends GetxController {
  final cardValidator = GamingTextFieldCustomValidator(
    errorHint: localized('num_error'),
  );
  late final GamingTextFieldController cardNumberController =
      GamingTextFieldController(validator: [
    cardValidator,
  ]);

  late final _currency = () {
    GamingCurrencyModel? currencyModel;
    return currencyModel.obs;
  }();
  GamingCurrencyModel? get currency => _currency.value;

  String? get kycName => AccountService().gamingUser?.kycName;

  late final _bank = () {
    GamingBankModel? bankModel;
    return bankModel.obs;
  }();
  GamingBankModel? get bank => _bank.value;

  String? optCode;

  final RxBool _isLoading = false.obs;
  bool get isLoading => _isLoading.value;

  final _isEnable = false.obs;
  bool get isEnable => _isEnable.value;

  Worker? _worker;
  Worker? _worker2;

  @override
  void onInit() {
    super.onInit();
    _worker = everAll([
      _currency,
      _bank,
      KycService.sharedInstance.info,
      cardValidator.isPass,
    ], (v) {
      _isEnable.value = currency != null &&
          bank != null &&
          kycName != null &&
          cardValidator.isPass.value;
    });

    _worker2 = debounce<String>(cardNumberController.text, (v) {
      if (v.length >= 8 && v.length <= 30) {
        cardValidator.isPass.value = true;
        _verifyInfo();
      } else {
        cardValidator.isPass.value = false;
      }
    });
  }

  @override
  void onClose() {
    super.onClose();
    _worker?.dispose();
    _worker2?.dispose();
  }

  final Map<String, List<GamingBankModel>> _bankMap = {};

  void _verifyInfo() {
    _isLoading.value = true;
    PGSpi(BankCard.verifyInfo.toTarget(
      inputData: {
        'currencyType': currency!.currency!,
        'cardNum': cardNumberController.text.value,
      },
    )).rxRequest<GamingBankModel>((value) {
      final data = value['data'];
      if (data == null) {
        throw GoGamingResponse<GamingBankModel?>(
          success: false,
          data: null,
          code: GoGamingError.fail.code,
          message: localized('num_error'),
        );
      }
      return GamingBankModel.fromJson(data as Map<String, dynamic>);
    }).doOnData((event) {
      _bank.value = event.data;
      // cardValidator.isPass.value = true;
    }).doOnDone(() {
      _isLoading.value = false;
    }).doOnError((err, p1) {
      _bank.value = null;
      // cardValidator.isPass.value = false;
    }).listen(null, onError: (p0, p1) {});
  }

  Future<GamingCurrencyModel?> selectCurrency() {
    return GamingCurrencySelector.show().then((value) {
      if (value != null) {
        if (currency?.currency != null &&
            currency?.currency != value.currency) {
          _bank.value = null;
        }
        _currency(value);
      }
      return value;
    });
  }

  void selectBank() {
    if (currency?.currency == null) {
      Toast.showFailed('please_select');
      return;
    }
    GamingBankSelector.show(
      currency: currency!.currency!,
      onLoadComplate: (list) {
        _bankMap.addAll({currency!.currency!: list});
      },
      original: _bankMap[currency!.currency!],
    ).then((value) {
      if (value != null) {
        _bank(value);
      }
    });
  }

  void submit() {
    if (SecureService.sharedInstance.checkSecure()) {
      Get.toNamed<dynamic>(Routes.secure.route, arguments: {
        'otpType': VerifyAction.addBankCard,
        'on2FaSuccess': _add,
      });
    }
  }

  void _add(String code) {
    _isLoading.value = true;
    PGSpi(BankCard.add.toTarget(
      inputData: {
        'currencyType': currency!.currency!,
        'name': kycName!,
        'bankCode': bank!.bankCode,
        'cardNum': cardNumberController.text.value,
        'key': code,
      },
    )).rxRequest<bool?>((value) {
      return value['data'] as bool?;
    }).doOnData((event) {
      Get.back<bool?>(result: event.data);
      Toast.showSuccessful(localized('add_card_s'));
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        if (err.error == GoGamingError.paramsError) {
          Toast.showFailed(localized('card_exist'));
        } else {
          Toast.showFailed(err.message);
        }
      } else {
        Toast.showFailed(localized('addbank_f'));
      }
    }).doOnDone(() {
      _isLoading.value = false;
    }).listen(null, onError: (p0, p1) {});
  }
}
