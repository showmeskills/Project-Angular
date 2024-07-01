import 'dart:async';

import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';

import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/currency/models/payment/gaming_currency_payment_model.dart';
import 'package:gogaming_app/common/api/currency/models/payment/gaming_currency_payment_result_model.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/api/history/models/gaming_currency_history_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_check_payment_avail_model.dart';
import 'package:gogaming_app/common/api/wallet/wallet_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/bonus_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/service/payment_iq_service/payment_iq_config.dart';
import 'package:gogaming_app/common/widgets/bonus_wrapper.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_network_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_selector.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/models/kyc/go_gaming_kyc_model.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../common/tracker/analytics_manager.dart';
import 'currency_deposit_pre_submit_logic.dart';
import 'currency_deposit_pre_submit_logic_m1.dart';

class CurrencyDepositPreSubmitLogicM2 extends CurrencyDepositPreSubmitLogic {
  CurrencyDepositPreSubmitLogicM2([this.currency]);

  final String? currency;

  Worker? worker1;
  Worker? worker2;

  @override
  final state = CurrencyDepositPreSubmitState();

  @override
  final paymentIQController = PaymentIQController();

  @override
  final tag = 'CurrencyDepositPreSubmitLogicM2';

  late BonusWrapperLogic bonusWraperLogic;

  void _init() {
    final currencyService = CurrencyService.sharedInstance;
    final defaultCurrency = GamingCurrencyModel.cny();
    GamingCurrencyModel selectedCurrency = defaultCurrency;
    final currencyList = currencyService.getFiatList();

    if (currency != null) {
      selectedCurrency = currencyList.singleWhere(
        (element) => element.currency == currency,
        orElse: () => defaultCurrency,
      );
    } else {
      if (!currencyService.selectedCurrency.isDigital) {
        selectedCurrency = currencyService.selectedCurrency;
      }
    }

    if (!currencyList
        .map((e) => e.currency)
        .contains(selectedCurrency.currency)) {
      selectedCurrency = currencyList.firstOrNull ?? defaultCurrency;
    }

    setCurrency(selectedCurrency);

    GamingEvent.onDeposit.subscribe(onDeposit);
  }

  @override
  void onInit() {
    super.onInit();
    bonusWraperLogic = Get.put(
        BonusWrapperLogic(
          tag: tag,
          usedPIQ: true,
          unknowtmpcode: false,
        ),
        tag: tag);
    _init();
    worker1 = ever<GoGamingPagination<GamingCurrencyHistoryModel>>(
        state.dataObs, (v) {
      loadCompleted(
        state: v.total == 0 ? LoadState.empty : LoadState.successful,
      );
    });
    worker2 = ever(bonusWraperLogic.state.bonusObs, (callback) {
      _sendPIQBonus();
    });
    Map<String, dynamic> dataMap = {"actionvalue1": 1};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.clickDeposit, dataMap: dataMap);
    AnalyticsManager.logEvent(
        name: 'deposit_visit', parameters: {"deposit_type": "fiat"});
    _loadSupportCurrency();
  }

  @override
  void onClose() {
    GamingEvent.onDeposit.unsubscribe(onDeposit);
    super.onClose();
    worker1?.dispose();
    worker2?.dispose();
  }

  void _loadSupportCurrency() {
    CurrencyService.sharedInstance
        .getVirtualToCurrency('Deposit')
        .doOnData((event) {
      List<GamingCurrencyModel>? currencyList =
          event?.where((e) => e.isVisible == true).toList();
      currencyList?.sort((a, b) => a.sort.compareTo(b.sort));
      state.currentModelListObs.value = currencyList ?? [];
      _initCurrency();
    }).listen((event) {});
  }

  @override
  void Function()? get onLoadData => () {
        loadCompleted(state: LoadState.loading);
        onLoadStreamData().doOnError((p0, p1) {
          loadCompleted(state: LoadState.failed);
        }).listen(null, onError: (p0, p1) {});
      };

  Stream<void> onLoadStreamData() {
    final now = DateTime.now();
    final end =
        DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
    final start = end.subtract(const Duration(days: 30));
    return PGSpi(History.currency.toTarget(
      input: {
        'category': 'Deposit',
        'StartTime': start.millisecondsSinceEpoch,
        'EndTime': end.millisecondsSinceEpoch,
        'PageIndex': 1,
        'PageSize': 3,
      },
    )).rxRequest<GoGamingPagination<GamingCurrencyHistoryModel>>((value) {
      return GoGamingPagination<GamingCurrencyHistoryModel>.fromJson(
        itemFactory: (e) => GamingCurrencyHistoryModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    }).doOnData((event) {
      state.dataObs.value = event.data;
    });
  }

  @override
  void selectCurrency() {
    GamingCurrencySelector.show(isDigital: false).then((value) {
      if (value != null) {
        setCurrency(value);
      }
    });
  }

  @override
  void selectCryptoCurrency() {
    GamingCurrencySelector.show(
            isDigital: true, original: state.currentModelList)
        .then((value) {
      if (value != null) {
        setCryptoCurrency(value);
      }
    });
  }

  void setCryptoCurrency(GamingCurrencyModel value) {
    if (state.cryptoCurrency?.currency != null &&
        state.cryptoCurrency?.currency != value.currency) {
      state.networkObs.value = null;
    }
    state.cryptoCurrencyObs(value);
  }

  @override
  void selectNetwork() {
    GamingCurrencyNetworkSelector.show(
      category: CurrencyCategory.deposit,
      currency: state.cryptoCurrency!.currency!,
      original: state.networks[state.cryptoCurrency!.currency!],
      onLoadComplate: (v) {
        state.networks = v;
      },
    ).then((value) {
      if (value != null) {
        state.networkObs(value);
      }
    });
  }

  /// 获取币种
  Stream<bool> getAllCurrency() {
    return PGSpi(Currency.getCurrencies.toTarget(input: {
      'type': 2,
      'category': 'Deposit',
      'isSupportVirtualToCurrency': true
    })).rxRequest<List<GamingCurrencyModel>?>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => GamingCurrencyModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return null;
      }
    }).flatMap((response) {
      final success = response.success;
      if (success) {
        state.currentModelListObs.value = response.data ?? [];
      }
      return Stream.value(success == true);
    });
  }

  @override
  void setCurrency(GamingCurrencyModel value) {
    paymentIQController.setCurrency(value.currency!);
    state.currencyObs(value);
    _loadPayment();
  }

  @override
  void updatePaymentTab(String tab, [GamingCurrencyPaymentModel? channel]) {
    state.currentPaymentTabObs.value = tab;
    updatePayment(channel ?? state.currentPaymentList.first);
  }

  void _initCurrency() {
    final currencyService = CurrencyService.sharedInstance;
    // 默认货币
    final defaultCurrency = GamingCurrencyModel.usdt();
    // 顶部选择的货币
    GamingCurrencyModel mySelectedCurrency = currencyService.selectedCurrency;

    // 后台开启存续得法的货币列表
    final currencyList = state.currentModelList;

    GamingCurrencyModel selectedCurrency = defaultCurrency;

    // 如果自己顶部选择的是数字货币，就使用这个货币。
    if (mySelectedCurrency.isDigital) {
      selectedCurrency = currencyService.selectedCurrency;
      // 如果 列表里面没有，就按照USDT->列表第一个来选择
      if (!currencyList
          .map((e) => e.currency)
          .contains(mySelectedCurrency.currency)) {
        // 来到这里说明，列表里面没有自己选择的货币
        if (currencyList
            .map((e) => e.currency)
            .contains(defaultCurrency.currency)) {
          // 默认币种 usdt可以选择
          selectedCurrency = defaultCurrency;
        } else {
          // 默认币种 usdt不可以选择
          selectedCurrency = state.currentModelList.first;
        }
      } else {
        // 选择顶部货币
        selectedCurrency = mySelectedCurrency;
      }
    } else {
      // 顶部是法币 顺序是USDT->第一个
      if (currencyList
          .map((e) => e.currency)
          .contains(defaultCurrency.currency)) {
        // 默认币种 usdt可以选择
        selectedCurrency = defaultCurrency;
      } else {
        // 默认币种 usdt不可以选择
        selectedCurrency = state.currentModelList.first;
      }
    }
    setCryptoCurrency(selectedCurrency);
  }

  @override
  void updatePayment(GamingCurrencyPaymentModel payment) {
    state.currentPaymentModel = payment;
    state.currentPaymentObs(payment);
  }

  @override
  void submit() {
    state.isLoadingObs.value = true;

    PGSpi(Wallet.checkPaymentAvail.toTarget(
      input: {
        'code': state.currentPayment!.code,
        'currencyType': state.currency!.currency,
        'category': CurrencyCategory.deposit.value,
      },
    )).rxRequest<GamingCheckPaymentAvailModel>((value) {
      return GamingCheckPaymentAvailModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).doOnData((event) {
      if (event.data.userName != null) {
        AccountService.sharedInstance.setKycName(event.data.userName!);
      }
      Get.toNamed<void>(
        Routes.currencyDepositSubmit.route,
        arguments: {
          'payment': state.currentPayment!,
          'currency': state.currency!,
        },
      );
    }).doOnError((err, stack) {
      if (err is GoGamingResponse) {
        if (err.error == GoGamingError.kycCountryError) {
          DialogUtil(
            context: Get.overlayContext!,
            iconPath: R.commonDialogErrorBig,
            iconWidth: 80.dp,
            iconHeight: 80.dp,
            title: localized('not_ava'),
            content: localized('kyc_error01'),
            contentMaxLine: 3,
            leftBtnName: localized('cancels'),
            rightBtnName: localized('online_cs'),
            onRightBtnPressed: () {
              Get.back<void>();
              CustomerServiceRouter().toNamed();
            },
            onLeftBtnPressed: () {
              Get.back<void>();
            },
          ).showNoticeDialogWithTwoButtons();
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
        } else {
          Toast.showFailed(err.message);
        }
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      state.isLoadingObs.value = false;
    }).listen(null, onError: (p0, p1) {});
  }

  void _loadPayment() {
    state.showPIQObs.value = KycService.sharedInstance.primaryPassed;
    _resetBonusList();
    SmartDialog.showLoading<void>();

    PGSpi(Currency.getPaymentList.toTarget(
      input: {
        'currency': state.currency!.currency,
        'category': CurrencyCategory.deposit.value,
      },
    )).rxRequest<GamingCurrencyPaymentResultModel>((value) {
      return GamingCurrencyPaymentResultModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).flatMap((value) {
      return Stream.value(GamingCurrencyPaymentResultModel(
        types: value.data.types,
        paymentList: value.data.paymentList.where((element) {
          return element.type.isNotEmpty;
        }).toList(),
      ));
    }).doOnData((event) {
      // event.data.paymentList.removeWhere((element) => element.isCrypto);
      final map = <String, List<GamingCurrencyPaymentModel>>{};
      if (event.types.length > 2) {
        final recommendName = event.types.first;
        final recommed = <GamingCurrencyPaymentModel>[];
        final crypto = <GamingCurrencyPaymentModel>[];
        final other = <GamingCurrencyPaymentModel>[];
        // 因需要排序，先分组
        for (final e in event.paymentList) {
          // 发现人工通道后保存下来
          if (e.isArtificial) {
            state.artificialChannel = e;
          }
          if (e.type.contains(recommendName) && !e.isCrypto) {
            recommed.add(e);
          } else if (e.isCrypto) {
            crypto.add(e);
          } else {
            other.add(e);
          }
        }
        // 按顺序插入
        if (recommed.isNotEmpty) {
          map.addAll({
            recommendName: recommed,
          });
        }
        if (crypto.isNotEmpty) {
          if (crypto.first.type.isNotEmpty) {
            map.addAll({
              crypto.first.type.first: crypto,
            });
          }
        }
        if (other.isNotEmpty) {
          map.addAll({
            localized('other_pay'): other,
          });
        }
      } else {
        for (final type in event.types) {
          for (final e in event.paymentList) {
            // 发现人工通道后保存下来
            if (e.isArtificial) {
              state.artificialChannel = e;
            }
            if (e.type.contains(type)) {
              map.putIfAbsent(type, () => []).add(e);
            }
          }
        }
        if (map.isEmpty) {
          map.addAll({
            localized('other_pay'): event.paymentList,
          });
          map.removeWhere((key, value) => value.isEmpty);
        }
      }
      state.paymentMapObs.value = map;
      if (map.isEmpty && state.showPIQ) {
        _loadBonusStreamData().listen(null, onError: (err) {});
      }
      final tyeps = event.paymentList.map((e) => e.type).toList();
      event.types = tyeps.isEmpty
          ? []
          : tyeps
              .reduce((value, element) => List.from(value)..addAll(element))
              .toSet()
              .toList();
      if (map.isNotEmpty) {
        updatePaymentTab(map.keys.first);
      }
    }).doOnError((p0, p1) {
      if (p0 is GoGamingResponse) {
        Toast.showFailed(p0.message);
      } else {
        Toast.showTryLater();
      }
      _resetBonus();
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }

  @override
  GamingCurrencyPaymentModel? getArtificialChannel() {
    if (state.paymentMap?.isEmpty ?? true) {
      return null;
    }
    return state.artificialChannel;
  }

  @override
  void onDeposit(Map<String, dynamic> data) {
    onLoadStreamData().listen(null, onError: (p0, p1) {});
  }

  @override
  void submitPIQ() {
    KycService.sharedInstance.checkPrimaryDialog(
      () {
        state.showPIQObs.value = true;
      },
      Get.overlayContext!,
      title: localized('safety_rem00'),
    );
  }

  void _resetBonusList() {
    bonusWraperLogic.resetBonusList(state.showPIQ);
  }

  void _resetBonus() {
    bonusWraperLogic.resetBonus();
  }

  void _sendPIQBonus() {
    BonusService.submitPIQBonus(
      bonusActivitiesNo: bonusWraperLogic.state.bonus?.bonusActivitiesNo,
    ).doOnData((event) {
      if (!event.data) {
        Toast.showFailed(event.message);
      }
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).listen(null, onError: (err) {});
  }

  Stream<void> _loadBonusStreamData() {
    return bonusWraperLogic.loadBonus(
      currency: state.currency!.currency!,
      amount: 100000.0,
    );
  }
}
