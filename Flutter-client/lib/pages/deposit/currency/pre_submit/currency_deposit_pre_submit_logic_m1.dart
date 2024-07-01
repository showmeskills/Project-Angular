import 'dart:async';

import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_bonus_activity_model.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_model.dart';
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
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/models/kyc/go_gaming_kyc_model.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../common/tracker/analytics_manager.dart';
import 'currency_deposit_pre_submit_logic.dart';

part 'currency_deposit_pre_submit_state.dart';

class CurrencyDepositPreSubmitLogicM1 extends CurrencyDepositPreSubmitLogic {
  CurrencyDepositPreSubmitLogicM1({
    this.currency,
    this.bonus,
    this.unknowtmpcode = false,
  });

  final String? currency;
  final GamingBonusActivityModel? bonus;
  final bool unknowtmpcode;

  Worker? worker1;
  Worker? worker2;

  @override
  final tag = 'CurrencyDepositPreSubmitLogicM1';

  late BonusWrapperLogic bonusWraperLogic;

  @override
  final state = CurrencyDepositPreSubmitState();

  @override
  final paymentIQController = PaymentIQController();

  void _init() {
    // 是坦丝需覝红利，默认情况红利加载的loading显示优先级高于当剝选中项
    // 如果丝使用红利则坪加载红利列表丝显示选中红利
    // 暂时注释 || bonus != null 外部传入了bouns时loading的坘化丝影哝显示选中的红利
    bonusWraperLogic.state.bonusObs.value = bonus;
    _sendPIQBonus();
    setCurrency(
        CurrencyService.sharedInstance.getSelectedFiatCurrency(currency));
    GamingEvent.onDeposit.subscribe(onDeposit);
  }

  @override
  void onInit() {
    super.onInit();
    bonusWraperLogic = Get.put(
        BonusWrapperLogic(
            tag: tag, usedPIQ: true, unknowtmpcode: unknowtmpcode),
        tag: tag);
    _init();
    worker1 = ever<GoGamingPagination<GamingCurrencyHistoryModel>>(
        state.dataObs, (v) {
      loadCompleted(
        state: v.total == 0 ? LoadState.empty : LoadState.successful,
      );
    });
    worker2 = ever(bonusWraperLogic.state.bonusObs, (callback) {
      bonusWraperLogic.unknowtmpcode = false;
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
    }).listen((event) {}, onError: (err) {});
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

  /// 获坖帝秝
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
    // 默认货帝
    final defaultCurrency = GamingCurrencyModel.usdt();
    // 顶部选择的货帝
    GamingCurrencyModel mySelectedCurrency = currencyService.selectedCurrency;

    // 坎坰开坯存续得法的货帝列表
    final currencyList = state.currentModelList;

    GamingCurrencyModel selectedCurrency = defaultCurrency;

    // 如果自己顶部选择的是数字货帝，就使用这个货帝。
    if (mySelectedCurrency.isDigital) {
      selectedCurrency = currencyService.selectedCurrency;
      // 如果 列表里面没有，就按照USDT->列表第一个来选择
      if (!currencyList
          .map((e) => e.currency)
          .contains(mySelectedCurrency.currency)) {
        // 来到这里说明，列表里面没有自己选择的货帝
        if (currencyList
            .map((e) => e.currency)
            .contains(defaultCurrency.currency)) {
          // 默认帝秝 usdt坯以选择
          selectedCurrency = defaultCurrency;
        } else {
          // 默认帝秝 usdt丝坯以选择
          selectedCurrency = state.currentModelList.first;
        }
      } else {
        // 选择顶部货帝
        selectedCurrency = mySelectedCurrency;
      }
    } else {
      // 顶部是法帝 顺庝是USDT->第一个
      if (currencyList
          .map((e) => e.currency)
          .contains(defaultCurrency.currency)) {
        // 默认帝秝 usdt坯以选择
        selectedCurrency = defaultCurrency;
      } else {
        // 默认帝秝 usdt丝坯以选择
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
          _paymentNotAvailable();
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

  void _paymentNotAvailable() {
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
  }

  void _loadPayment() {
    // 通过kyc初级认话且是欧洲用户扝坯用kyc
    state.showPIQObs.value = KycService.sharedInstance.primaryPassed &&
        (Config.sharedInstance.environment.useNewEUDepositBonus
            ? !KycService.sharedInstance.isAsia
            : true);
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
        // 因需覝排庝，先分组
        for (final e in event.paymentList) {
          // 坑现人工通靓坎保存下来
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
        // 按顺庝杒入
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
            // 坑现人工通靓坎保存下来
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
      // 欧洲用户且初级认话完戝坯用piq，其余地区丝坯使用piq
      // 坯用piq的情况下，显示piq并加载红利
      // 丝坯用的情况下弹出kyc初级认话检查或者支付丝坯用杝示
      if (map.isEmpty) {
        if (state.showPIQ) {
          _loadBonusStreamData().listen(null, onError: (err) {});
        } else {
          submitPIQ();
        }
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

  /// kyc坊用户地区检查
  @override
  void submitPIQ() {
    if (Config.sharedInstance.environment.useNewEUDepositBonus) {
      // kyc事件监坬回调
      void callback() {
        GamingEvent.kycPrimarySuccess.unsubscribe(callback);
        // 处睆特殊情况，例如未坚kyc认话剝根杮ip等暂时断定该用户为亚洲用户，但是用户坚了欧洲kyc，则弹出红利选择
        if (!KycService.sharedInstance.isAsia) {
          // 通过kyc初级认话且是欧洲用户扝坯用kyc
          state.showPIQObs.value = true;
          if (state.paymentMapObs.value?.isEmpty ?? true) {
            bonusWraperLogic.openBonusSelector(
              currency: state.currency!.currency!,
              amount: 100000.0,
            );
          }
        }
      }

      KycService.sharedInstance.checkPrimaryDialog(
        () {
          if (KycService.sharedInstance.isAsia) {
            _paymentNotAvailable();
          } else {
            // 通过kyc初级认话且是欧洲用户扝坯用kyc
            state.showPIQObs.value = true;
          }
        },
        Get.overlayContext!,
        title: localized('safety_rem00'),
        arguments: {
          'closeAfterSuccess': true,
        },
        onFail: () {
          // kyc未认话，监坬kyc戝功事件
          GamingEvent.kycPrimarySuccess.subscribe(callback);
        },
        onDismiss: () {
          GamingEvent.kycPrimarySuccess.unsubscribe(callback);
        },
      );
    } else {
      KycService.sharedInstance.checkPrimaryDialog(
        () {
          state.showPIQObs.value = true;
        },
        Get.overlayContext!,
        title: localized('safety_rem00'),
      );
    }
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
