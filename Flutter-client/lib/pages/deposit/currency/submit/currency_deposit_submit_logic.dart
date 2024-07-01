import 'dart:async';
import 'dart:math';

import 'package:base_framework/base_widget.dart';
import 'package:flutter/widgets.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/bank_card/models/gaming_bank_model.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_fiatto_virtual_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/currency/models/payment/gaming_currency_payment_model.dart';
import 'package:gogaming_app/common/api/deposit/deposit_api.dart';
import 'package:gogaming_app/common/api/deposit/models/currency_deposit/gaming_currency_deposit_model.dart';
import 'package:gogaming_app/common/api/deposit/models/currency_deposit/gaming_deposit_virtual_to_currency_model.dart';
import 'package:gogaming_app/common/api/faq/models/gaming_faq_model.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import 'package:gogaming_app/common/widgets/bonus_wrapper.dart';
import 'package:gogaming_app/common/widgets/bottom_sheet/gaming_faq_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_bank_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/deposit/currency/pre_submit/currency_deposit_pre_submit_logic.dart';
import 'package:gogaming_app/common/tracker/event.dart';
import '../../../../common/tracker/analytics_manager.dart';
import '../../../../common/tracker/gaming_data_collection.dart';

import '../../../../common/service/coupon_service.dart';

part 'currency_deposit_submit_state.dart';

class CurrencyDepositSubmitLogic extends BaseController
    with SingleRenderControllerMixin, SingleRenderViewDelegate {
  late CurrencyDepositSubmitState state = CurrencyDepositSubmitState(
    payment: payment,
    currency: currency,
  );

  CurrencyDepositSubmitLogic({
    required this.payment,
    required this.currency,
  });

  final GamingCurrencyPaymentModel payment;
  final GamingCurrencyModel currency;

  Worker? _everListener;
  Worker? _bankListener;
  CurrencyDepositPreSubmitLogic get preLogic =>
      Get.find<CurrencyDepositPreSubmitLogic>();

  final tag = 'CurrencyDepositSubmitLogic';

  late BonusWrapperLogic bonusWraperLogic;

  @override
  void onInit() {
    super.onInit();
    bonusWraperLogic = Get.put(
        BonusWrapperLogic(
          tag: tag,
          usedPIQ: false,
          unknowtmpcode: false,
          bonusActivitiesNo: CouponService.sharedInstance.bonusActivitiesNo,
        ),
        tag: tag);
    _initListener();
    ever<List<GamingFaqModel>>(state._data, (v) {
      loadCompleted(
        state: LoadState.successful,
      );
    });
    getAllVirtualRate().listen((event) {});
  }

  @override
  void onClose() {
    super.onClose();
    _disposeListener();
  }

  void _initListener() {
    _everListener ??= debounce(state.amountController.text, (v) {
      final amoutIsPass = _checkAmoutIsPass();
      state._isEnable.value = amoutIsPass &&
          (state.payment.needBankCode ? state.bank != null : true);
      bonusWraperLogic.resetBonus();
      if (amoutIsPass) {
        _loadBonusStreamData().listen(null, onError: (err, p1) {});
      }
    });

    _bankListener ??= ever(state._bank, (v) {
      final amoutIsPass = _checkAmoutIsPass();
      state._isEnable.value = amoutIsPass &&
          (state.payment.needBankCode ? state.bank != null : true);
    });
  }

  bool _checkAmoutIsPass() {
    final fixedAmountIsPass = state.amountType.value == 0 &&
        state.payment.fixedAmounts.isNotEmpty &&
        state.estimatedAmount > 0;
    return fixedAmountIsPass || state.amountController.isPass;
  }

  void _disposeListener() {
    _everListener?.dispose();
    _bankListener?.dispose();
  }

  @override
  void Function()? get onLoadData =>
      () => onLoadStreamData().listen(null, onError: (err, p1) {});

  Stream<void> onLoadStreamData() {
    loadCompleted(state: LoadState.loading);
    return GamingFAQBottomSheet.loadDataStream().doOnData((event) {
      state._data.value = event;
    }).doOnError((p0, p1) {
      loadCompleted(state: LoadState.failed);
    });
  }

  Stream<void> _loadBonusStreamData() {
    return bonusWraperLogic.loadBonus(
      currency: state.currency.currency!,
      payment: state.payment.category,
      amount: state.estimatedAmount,
      filter: (element) {
        return element.projectedIncome == 0 &&
            element.bonusActivitiesNo != 'couponcodedeposit' &&
            (element.prizeType != 6);
      },
    );
  }

  void submit() {
    primaryFocus?.unfocus();
    if (preLogic.state.isDepositVirtualGetCurrency) {
      _depositCryptoCurrency().listen((event) {});
    } else {
      _deposit().listen(null, onError: (err, p1) {});
    }
  }

  CurrencyDepositPreSubmitLogic? _findPreSubmitLogic() {
    try {
      return Get.find<CurrencyDepositPreSubmitLogic>();
    } catch (e) {
      return null;
    }
  }

  void _changeArtificialChannel(GamingCurrencyPaymentModel channel) {
    final preSubmitLogic = _findPreSubmitLogic();
    if (preSubmitLogic != null) {
      state._isLoading.value = true;
      // 切换到人工支付方式
      preSubmitLogic.updatePaymentTab(channel.type.first, channel);

      final amount =
          min(channel.maxAmount, max(state.estimatedAmount, channel.minAmount));

      _disposeListener();
      // 当前页面数据更新为人工支付方式
      state._payment(channel);
      state.amountController.validator = [
        GamingTextFieldAmountValidator(
          min: channel.minAmount,
          max: channel.maxAmount,
          errorHint: localized('valid_amount'),
        )
      ];
      state.amountController.textController.text = amount.stripTrailingZeros();

      final Completer<void> complater = Completer();
      _loadBonusStreamData().doOnData((event) {
        complater.complete();
      }).listen(null, onError: (err, p1) {});
      complater.future.then((value) {
        submit();
      });
      _initListener();
    }
  }

  bool _checkCryptoCurrencyStatus(GoGamingResponse<dynamic> data) {
    if (data.code == '200') return true;
    if (data.code == '2061' || data.code == '2072' || data.code == '2110') {
      DialogUtil(
        context: Get.overlayContext!,
        iconPath: R.commonDialogErrorBig,
        iconWidth: 80.dp,
        iconHeight: 80.dp,
        title: localized('hint'),
        content: data.message ?? localized('failed'),
        leftBtnName: '',
        rightBtnName: localized('confirm_button'),
        onRightBtnPressed: () {
          Get.back<void>();
        },
      ).showNoticeDialogWithTwoButtons();
    }

    return false;
  }

  bool _checkStatus(GamingCurrencyDepositModel data) {
    if (!data.statueSuccess) {
      GamingCurrencyPaymentModel? channel;
      if (data.statue == 5 && !state.payment.isArtificial) {
        channel = _findPreSubmitLogic()?.getArtificialChannel();
      }
      //创建失败&当前是人工通道
      if (data.statue == 5 && state.payment.isArtificial) {
        DialogUtil(
          context: Get.overlayContext!,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          title: localized('hint'),
          content: localized('trans_busy'),
          leftBtnName: localized('i_ha_kn00'),
          rightBtnName: '',
          onRightBtnPressed: () {
            Get.back<void>();
          },
        ).showNoticeDialogWithTwoButtons();
      } else {
        DialogUtil(
          context: Get.overlayContext!,
          iconPath: R.commonDialogErrorBig,
          iconWidth: 80.dp,
          iconHeight: 80.dp,
          title: localized('hint'),
          content: data.statueMessage ?? '',
          leftBtnName: '',
          rightBtnName: channel != null && data.statue == 5
              ? localized('pay_channel_busy_b')
              : localized('i_ha_kn00'),
          onRightBtnPressed: () {
            if (data.statue == 5 && channel != null) {
              _changeArtificialChannel(channel);
            }
            Get.back<void>();
          },
        ).showNoticeDialogWithTwoButtons();
      }

      Sentry.captureException(FaitDepositError(
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        paymentCode: data.paymentCode,
        statue: data.statue,
        statueMessage: data.statueMessage,
      ));
    }
    return data.statueSuccess;
  }

  /// 存虚得法
  Stream<GamingDepositVirtualToCurrencyModel?> _depositCryptoCurrency() {
    state._isLoading.value = true;
    final start = DateTime.now();
    return PGSpi(Deposit.toCurrency.toTarget(
      inputData: {
        'amount': state.estimatedAmount,
        "paymentCode": state.payment.code,
        "currency": state.currency.currency!,
        "paymentCurrency": preLogic.state.cryptoCurrency!.currency,
        "network": preLogic.state.network?.network ?? '',
        "rateId": state.currencyAllVirtualModel?.rateId,
        "actionType": 6,
        'activityNo':
            bonusWraperLogic.state.bonus?.bonusActivitiesNo ?? "unknowtmpcode",
      },
    )).rxRequest<GamingDepositVirtualToCurrencyModel?>((value) {
      if (value['data'] != null) {
        return GamingDepositVirtualToCurrencyModel.fromJson(
            value['data'] as Map<String, dynamic>);
      }
      return null;
    }).flatMap((value) {
      if (value.data != null) {
        if (_checkCryptoCurrencyStatus(value)) {
          return Stream.value(value.data);
        }
      }
      return Stream.value(null);
    }).doOnData((event) {
      final end = DateTime.now();
      Map<String, dynamic> dataMap = {
        "actionvalue1": end.difference(start).inSeconds.toString(),
        "actionvalue2": state.payment.code,
      };
      GamingDataCollection.sharedInstance
          .submitDataPoint(TrackEvent.depositTime, dataMap: dataMap);
      AnalyticsManager.logEvent(
          name: 'deposit_fiat',
          parameters: {"payment_code": state.payment.code});
      if (event != null) {
        Get.toNamed<void>(
          Routes.currencyDepositVirtualResultConfirm.route,
          arguments: {
            'data': event,
            'payment': state.payment,
            'title': localized('dep_fiat'),
          },
        );
      }
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        if (err.error == GoGamingError.limitExceeded) {
          _showLimitExceeded();
        } else if (err.error == GoGamingError.limitSelfExceeded) {
          _showSelfLimitExceeded(message: err.message);
        } else {
          Toast.showFailed(err.message);
        }
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      state._isLoading.value = false;
    });
  }

  Stream<GamingCurrencyDepositModel?> _deposit() {
    state._isLoading.value = true;
    final start = DateTime.now();
    return PGSpi(Deposit.currency.toTarget(
      inputData: {
        'amount': state.estimatedAmount,
        'paymentCode': state.payment.code,
        'currency': state.currency.currency!,
        'actionType': state.payment.actionType,
        'activityNo':
            bonusWraperLogic.state.bonus?.bonusActivitiesNo ?? "unknowtmpcode",
        if (state.payment.isBankTransfer) 'userName': state.kycName!,
        if (state.payment.needBankCode) 'bankCode': state.bank!.bankCode,
        if (state.payment.isHtmlOnlineBank || state.payment.isEWallet)
          'callbackUrl': '${WebUrlService.baseUrl}/zh-cn/wallet/overview',
      },
    )).rxRequest<GamingCurrencyDepositModel?>(retry: 0, receiveTimeout: 90000,
        (value) {
      if (value['data'] != null) {
        return GamingCurrencyDepositModel.fromJson(
            value['data'] as Map<String, dynamic>);
      }
      return null;
    }).flatMap((value) {
      if (value.data != null) {
        if (_checkStatus(value.data!)) {
          return Stream.value(value.data);
        }
      }
      return Stream.value(null);
    }).doOnData((event) {
      final end = DateTime.now();
      Map<String, dynamic> dataMap = {
        "actionvalue1": end.difference(start).inSeconds.toString(),
        "actionvalue2": state.payment.code,
      };
      GamingDataCollection.sharedInstance
          .submitDataPoint(TrackEvent.depositTime, dataMap: dataMap);
      AnalyticsManager.logEvent(
          name: 'deposit_fiat',
          parameters: {"payment_code": state.payment.code});
      if (event != null) {
        String title = event.isEWallet
            ? localized('ew')
            : event.isHtmlOnlineBank
                ? localized('on_payment')
                : localized('int_bank_trans');
        Get.toNamed<void>(
          Routes.currencyDepositResultConfirm.route,
          arguments: {
            'data': event,
            'payment': state.payment,
            'title': title,
          },
        );
      }
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        if (err.error == GoGamingError.limitExceeded) {
          _showLimitExceeded();
        } else if (err.error == GoGamingError.limitSelfExceeded) {
          _showSelfLimitExceeded(message: err.message);
        } else {
          Toast.showFailed(err.message);
        }
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      state._isLoading.value = false;
    });
  }

  void _showSelfLimitExceeded({String? message}) {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('hint'),
      content: message ?? localized("error_user_self_exclusion_deposit"),
      leftBtnName: '',
      rightBtnName: localized('confirm_button'),
      onRightBtnPressed: () {
        Get.back<void>();
      },
    ).showNoticeDialogWithTwoButtons();
  }

  void _showLimitExceeded() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('sent_abe'),
      content: localized('kyc_error03'),
      leftBtnName: localized('cancels'),
      rightBtnName: localized('verification'),
      onRightBtnPressed: () {
        Get.back<void>();
        Get.toNamed<void>(Routes.kycMiddle.route);
      },
    ).showNoticeDialogWithTwoButtons();
  }

  void openBankSelector() {
    primaryFocus?.unfocus();
    final currency = state.currency.currency!;
    final paymentCode = state.payment.code;
    GamingBankSelector.showDepositBank(
      currency: currency,
      paymentCode: paymentCode,
      onLoadComplate: (list) {
        state._bankMap.addAll({currency: list});
      },
      original: state._bankMap[currency],
    ).then((value) {
      if (value != null) {
        state._bankModel = value;
        state._bank(value);
      }
    });
  }

  /// 获取汇率
  Stream<bool> getAllVirtualRate() {
    if (preLogic.state.isDepositVirtualGetCurrency == false) {
      return Stream.value(true);
    }
    return PGSpi(Currency.getFiattoVirtualRate.toTarget(input: {
      'currency': state.currency.currency,
      'category': 'Deposit'
    })).rxRequest<GamingCurrencyVirtualModel?>((value) {
      final data = value['data'] as Map<String, dynamic>?;
      if (data == null) {
        return null;
      }
      return GamingCurrencyVirtualModel.fromJson(data);
    }).flatMap((response) {
      final success = response.success;
      if (success) {
        state._currencyAllVirtualModel.value = response.data;
        Rates rate = state._currencyAllVirtualModel.value!.rates
            .where((element) =>
                element.currency == preLogic.state.cryptoCurrency?.currency)
            .first;
        state._curRates.value = rate;
      }
      return Stream.value(success == true);
    });
  }
}
