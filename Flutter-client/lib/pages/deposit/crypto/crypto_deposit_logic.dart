import 'dart:async';
import 'dart:math';

import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_model.dart';
import 'package:gogaming_app/common/api/deposit/deposit_api.dart';
import 'package:gogaming_app/common/api/deposit/models/gaming_deposit_address_model.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/api/history/models/gaming_crypto_history_model.dart';
import 'package:gogaming_app/common/service/bonus_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/tracker/event.dart';
import 'package:gogaming_app/common/tracker/gaming_data_collection.dart';
import 'package:gogaming_app/common/widgets/bonus_wrapper.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_network_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_selector.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../../common/service/coupon_service.dart';
import '../../../common/tracker/analytics_manager.dart';

part 'crypto_deposit_state.dart';

class CryptoDepositLogic extends BaseController
    with SingleRenderControllerMixin {
  CryptoDepositLogic([this.currency]);

  final String? currency;

  final state = CryptoDepositState();

  Worker? worker1;
  Worker? worker2;
  Worker? worker3;

  /// 欧洲流程进入页面后展示红利弹窗，展示后切换币种不会再次出现红利弹窗
  bool didDisplay = false;

  final tag = 'CryptoDepositLogic';

  late BonusWrapperLogic bonusWraperLogic;

  void _init() {
    final currencyService = CurrencyService.sharedInstance;
    final defaultCurrency = GamingCurrencyModel.usdt();
    GamingCurrencyModel selectedCurrency = defaultCurrency;
    final currencyList = currencyService.getCryptoList();

    if (currency != null) {
      selectedCurrency = currencyList.singleWhere(
        (element) => element.currency == currency,
        orElse: () => defaultCurrency,
      );
    } else {
      if (currencyService.selectedCurrency.isDigital) {
        selectedCurrency = currencyService.selectedCurrency;
      }
    }

    if (!currencyList
        .map((e) => e.currency)
        .contains(selectedCurrency.currency)) {
      selectedCurrency = currencyList.firstOrNull ?? defaultCurrency;
    }

    setCurrency(
      selectedCurrency,
    );
  }

  @override
  void onInit() {
    super.onInit();
    bonusWraperLogic = Get.put(
        BonusWrapperLogic(
          tag: tag,
          usedPIQ: true,
          unknowtmpcode: false,
          bonusActivitiesNo: CouponService.sharedInstance.bonusActivitiesNo,
        ),
        tag: tag);
    _init();
    worker1 =
        ever<GoGamingPagination<GamingCryptoHistoryModel>>(state._data, (v) {
      loadCompleted(
        state: v.total == 0 ? LoadState.empty : LoadState.successful,
      );
    });
    worker2 = ever<GamingCurrencyNetworkModel?>(state._network, (v) {
      if (v == null) {
        state.addressModel = null;
        state._address.value = null;
      }
    });
    worker3 = ever(bonusWraperLogic.state.bonusObs, (callback) {
      _submitBonus();
    });
    Map<String, dynamic> dataMap = {"actionvalue1": 0};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.clickDeposit, dataMap: dataMap);
    AnalyticsManager.logEvent(
        name: 'deposit_visit', parameters: {"deposit_type": "crypto"});
  }

  @override
  void onClose() {
    super.onClose();
    worker1?.dispose();
    worker2?.dispose();
    worker3?.dispose();
  }

  @override
  void Function()? get onLoadData =>
      () => onLoadStreamData().listen(null, onError: (p0, p1) {});

  Stream<void> onLoadStreamData() {
    loadCompleted(state: LoadState.loading);
    final now = DateTime.now();
    final end =
        DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
    final start = end.subtract(const Duration(days: 30));
    return PGSpi(History.crypto.toTarget(
      input: {
        'category': 'Deposit',
        'StartTime': start.millisecondsSinceEpoch,
        'EndTime': end.millisecondsSinceEpoch,
        'PageIndex': 1,
        'PageSize': 3,
      },
    )).rxRequest<GoGamingPagination<GamingCryptoHistoryModel>>((value) {
      return GoGamingPagination<GamingCryptoHistoryModel>.fromJson(
        itemFactory: (e) => GamingCryptoHistoryModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    }).doOnData((event) {
      state._data.value = event.data;
    }).doOnError((p0, p1) {
      loadCompleted(state: LoadState.failed);
    });
  }

  void selectCurrency() {
    GamingCurrencySelector.show(isDigital: true).then((value) {
      if (value != null) {
        setCurrency(value);
      }
    });
  }

  void setCurrency(GamingCurrencyModel value) {
    final bool isChange = state.currency?.currency != value.currency;
    state._currency(value);
    if (isChange) {
      state._network.value = null;
      _loadBonusStreamData().listen(null, onError: (err) {});
    }
  }

  void selectNetwork() {
    GamingCurrencyNetworkSelector.show(
      category: CurrencyCategory.deposit,
      currency: state.currency!.currency!,
      original: state._networks[state.currency!.currency!],
      onLoadComplate: (v) {
        state._networks = v;
      },
    ).then((value) {
      if (value != null) {
        state._network(value);
        _loadAddress();
      }
    });
  }

  void _loadAddress() {
    SmartDialog.showLoading<void>();

    PGSpi(Deposit.depositAddress.toTarget(
      input: {
        'currency': state.currency!.currency,
        'network': state.network!.network,
      },
    )).rxRequest<GamingDepositAddressModel>((value) {
      return GamingDepositAddressModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).doOnData((event) {
      state.addressModel = event.data;
      state._address(event.data);
    }).doOnError((p0, p1) {
      if (p0 is GoGamingResponse) {
        Toast.showFailed(p0.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }

  Stream<void> _loadBonusStreamData() {
    return bonusWraperLogic
        .loadBonus(
      currency: state.currency!.currency!,
      amount: 100000.0,
    )
        .doOnDone(() {
      // 有红利且用户为欧洲区在进入存款页面时候自动展开红利弹窗
      if (!didDisplay) {
        if ((bonusWraperLogic.state.bonusList?.isNotEmpty ?? false) &&
            !KycService.sharedInstance.isAsia) {
          didDisplay = true;
          bonusWraperLogic.openBonusSelector(
            currency: state.currency!.currency!,
            amount: 100000.0,
          );
        }
      }
    });
  }

  void _submitBonus() {
    BonusService.submitCryptoBonus(
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
}
