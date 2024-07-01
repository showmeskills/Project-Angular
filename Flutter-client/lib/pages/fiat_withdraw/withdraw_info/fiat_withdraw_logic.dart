import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_check_payment_avail_model.dart';
import 'package:gogaming_app/common/api/wallet/wallet_api.dart';
import 'package:gogaming_app/common/api/withdraw/models/withdraw_riskform_verify_model.dart';
import 'package:gogaming_app/common/api/withdraw/withdraw_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/service/payment_iq_service/payment_iq_config.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/models/kyc/go_gaming_kyc_model.dart';
import 'package:gogaming_app/pages/advanced_certification/common/advanced_certification_util.dart';
import 'package:gogaming_app/pages/fiat_withdraw/fiat_to_eb/fiat_to_eb_logic.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../R.dart';
import '../../../common/api/currency/models/gaming_currency_model.dart';
import '../../../common/api/currency/models/gaming_currency_quota_model.dart';
import '../../../common/api/currency/models/payment/gaming_currency_payment_model.dart';
import '../../../common/api/currency/models/payment/gaming_currency_payment_result_model.dart';
import '../../../common/widgets/gaming_selector/gaming_currency_selector.dart';
import '../../../common/widgets/gg_dialog/dialog_util.dart';
import '../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import 'fiat_withdraw_state.dart';

class FiatWithdrawLogic extends BaseController {
  final FiatWithdrawState state = FiatWithdrawState();
  FiatWithdrawLogic([this.initCurrency]);

  final String? initCurrency;

  final paymentIQController =
      PaymentIQController(method: PaymentIQMethod.withdraw);

  void pressSelectCurrency() {
    GamingCurrencySelector.show().then((value) {
      if (value != null) {
        _onChangeCurrency(value);
      }
    });
  }

  @override
  void onInit() {
    Map<String, dynamic> dataMap = {"actionvalue1": 1};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.clickTransfer, dataMap: dataMap);
    KycService.sharedInstance
        .updateKycData()
        .listen((event) {}, onError: (_) {});
    super.onInit();

    _checkRiskformVerify().doOnData((event) {
      if (initCurrency != null) {
        try {
          _onChangeCurrency(CurrencyService.sharedInstance
              .getFiatList()
              .singleWhere((element) => element.currency == initCurrency));
        } catch (e) {
          return;
        }
      }
    }).listen(null, onError: (err) {});
  }

  Stream<bool> _checkRiskformVerify() {
    if (KycService.sharedInstance.isAsia) {
      return Stream.value(true);
    }
    return PGSpi(Withdraw.riskformVerify.toTarget())
        .rxRequest<WithdrawRiskformVerifyModel>((value) {
      return WithdrawRiskformVerifyModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).flatMap((value) {
      return Stream.value(!(value.data.isValid ?? true));
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        if (err.error == GoGamingError.kycLevelError &&
            err.data is WithdrawRiskformVerifyModel) {
          String route = Routes.kycPrimary.route;
          final kycType = (err.data as WithdrawRiskformVerifyModel).kycType;
          if (kycType == KycVerifyType.primary) {
            route = Routes.kycMiddle.route;
          } else if (kycType == KycVerifyType.intermediate) {
            route = Routes.kycAdvance.route;
          }
          KycService.sharedInstance.showKycEuDialog(route);
        } else if (err.error == GoGamingError.kycDocumentError) {
          KycService.sharedInstance.showDocumentDialog();
        } else if (err.error == GoGamingError.limitExceeded) {
          AdvancedCertificationUtil.showCertificationDialog();
        } else if (err.error == GoGamingError.eddInReview) {
          AdvancedCertificationUtil.showRiskAssessmentResult();
        } else if (err.error == GoGamingError.kycInReview) {
          KycService.sharedInstance.showKycReviewEuDialog();
        } else {
          Toast.showFailed(err.message);
        }
      } else {
        Toast.showTryLater();
      }
    });
  }

  void selectPaymentMethod(GamingCurrencyPaymentModel info) {
    SmartDialog.showLoading<void>();
    _loadCheckPaymentAvail(info: info, currency: state.currentCurrency.value!)
        .doOnData((event) {
      if (event.data.userName != null) {
        AccountService.sharedInstance.setKycName(event.data.userName!);
      }
      SmartDialog.dismiss<void>();
      info.isNeedWalletAddress = event.data.isNeedWalletAddress;
      info.walletAddressValid = event.data.walletAddressValid;
      if (state.selectPaymentInfo.value?.code != info.code) {
        // 切换方式后应该清空数据 暂时手动清空
        Get.delete<FiatToEBLogic>();
        state.selectPaymentInfo(info);
      }
    }).doOnError((err, p1) {
      SmartDialog.dismiss<void>();
      if (err is GoGamingResponse) {
        if (err.error == GoGamingError.kycCountryError) {
          _showKycError(err.message ?? '');
        } else if (err.error == GoGamingError.kycLevelError &&
            err.data is GamingCheckPaymentAvailModel) {
          String? route;
          final kycType = (err.data as GamingCheckPaymentAvailModel).kycType;
          if (kycType?.isEmpty ?? true) {
            route = Routes.kycPrimary.route;
          } else if (kycType == KycVerifyType.primary) {
            route = Routes.kycMiddle.route;
          } else if (kycType == KycVerifyType.intermediate) {
            route = Routes.kycAdvance.route;
          }
          if (route != null) {
            KycService.sharedInstance.onNeedKycLevelAlert(
              Get.overlayContext!,
              route,
            );
          }
        } else if (err.error == GoGamingError.kycDocumentError) {
          KycService.sharedInstance.showDocumentDialog();
        } else if (err.error == GoGamingError.limitExceeded) {
          AdvancedCertificationUtil.showCertificationDialog();
        } else if (err.error == GoGamingError.eddInReview) {
          AdvancedCertificationUtil.showRiskAssessmentResult();
        } else if (err.error == GoGamingError.kycInReview) {
          KycService.sharedInstance.showKycReviewEuDialog();
        } else {
          Toast.showFailed(err.message);
        }
      } else {
        Toast.showTryLater();
      }
    }).listen((v) {});
  }

  void _showKycError(String content) {
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized("not_ava"),
      content: content,
      contentMaxLine: 5,
      leftBtnName: '',
      rightBtnName: localized('online_cs'),
      onRightBtnPressed: () {
        CustomerServiceRouter().toNamed();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  void _onChangeCurrency(GamingCurrencyModel value) {
    _checkRiskformVerify().doOnData((v) {
      paymentIQController.setCurrency(value.currency!);
      state.currentCurrency(value);
      _clearData();
      _onLoadPayMethod(value);
    }).listen(null, onError: (err) {});
  }

  void _clearData() {
    state.selectPaymentType(localized("other_pay"));
    state.selectPaymentInfo.value = null;
    state.payment.value = null;
  }

  void _onLoadPayMethod(GamingCurrencyModel value) {
    state.showPIQ.value = KycService.sharedInstance.intermediatePassed;
    showLoading();
    Rx.combineLatestList([
      _loadCurrencyQuota(value.currency ?? '').doOnData((event) {
        state.currencyQuotaModel.value = event;
      }),
      _getPaymentList(value).doOnData((event) {
        if (event.types.isNotEmpty) {
          state.selectPaymentType(event.types.first);
        }
        state.payment(event);
      }),
    ]).listen((event) {
      hideLoading();
    }).onError((Object err) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
      hideLoading();
    });
  }

  int getPaymentActionType(String type) {
    return state.payment.value?.paymentList.firstWhereOrNull((element) {
          return element.type.contains(type);
        })?.actionType ??
        0;
  }

  GamingCurrencyPaymentModel? getPaymentWithType(String type) {
    return state.payment.value?.paymentList.firstWhereOrNull((element) {
      return element.type.contains(type);
    });
  }

  Stream<GamingCurrencyQuotaModel> _loadCurrencyQuota(String currency) {
    Map<String, dynamic> req = {
      'currencyType': currency,
    };

    return PGSpi(Currency.getQuotaLimit.toTarget(input: req))
        .rxRequest<GamingCurrencyQuotaModel>((value) {
      final data = value['data'] as Map<String, dynamic>;
      return GamingCurrencyQuotaModel.fromJson(data);
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<GoGamingResponse<GamingCheckPaymentAvailModel>> _loadCheckPaymentAvail(
      {required GamingCurrencyPaymentModel info,
      required GamingCurrencyModel currency}) {
    Map<String, dynamic> req = {
      'code': info.code,
      'currencyType': currency.currency,
      'category': 'Withdraw',
    };
    return PGSpi(Wallet.checkPaymentAvail.toTarget(input: req))
        .rxRequest<GamingCheckPaymentAvailModel>((value) {
      final data = value['data'] as Map<String, dynamic>;
      return GamingCheckPaymentAvailModel.fromJson(data);
    }).flatMap((value) {
      return Stream.value(value);
    });
  }

  Stream<GamingCurrencyPaymentResultModel> _getPaymentList(
      GamingCurrencyModel selectValue) {
    return PGSpi(Currency.getPaymentList.toTarget(
      input: {
        'currency': selectValue.currency,
        'category': 'Withdraw',
      },
    )).rxRequest<GamingCurrencyPaymentResultModel>((value) {
      final data = value['data'] as Map<String, dynamic>;
      return GamingCurrencyPaymentResultModel.fromJson(data);
    }).flatMap((value) {
      return Stream.value(value.data);
    }).flatMap((value) {
      return Stream.value(GamingCurrencyPaymentResultModel(
        types: value.types,
        paymentList: value.paymentList.where((element) {
          return element.type.isNotEmpty;
        }).toList(),
      ));
    });
  }

  void submitPIQ() {
    KycService.sharedInstance.checkMiddleDialog(
      () {
        state.showPIQ.value = true;
      },
      Get.overlayContext!,
    );
  }
}
