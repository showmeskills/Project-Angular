import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';
import 'package:gogaming_app/common/api/history/history_type.dart';
import 'package:gogaming_app/common/api/history/models/gaming_bonus_adjust_account.dart';
import 'package:gogaming_app/common/api/history/models/gaming_bonus_grant_type_model.dart';
import 'package:gogaming_app/common/api/history/models/gaming_commission_type.dart';
import 'package:gogaming_app/common/api/history/models/gaming_transfer_wallet_select_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_selector_with_all.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/models/wallet_history_status.dart';

part 'gaming_wallet_history_state.dart';

class GamingWalletHistoryLogic extends BaseController
    with GetSingleTickerProviderStateMixin, RefreshControllerMixin {
  GamingWalletHistoryLogic(
      {required this.historyTypeValue, this.isDigital = true});
  final state = GamingWalletHistoryState();
  late TabController tabController;
  final String historyTypeValue;
  final bool isDigital;
  @override
  void onInit() {
    super.onInit();
    _initIndex();
    state.isDigital.value = isDigital;
    _setStatus();
    resetSift();
    _loadDepositStatus();
    _loadWithdrawStatus();
    _initTabController(7);
  }

  void _loadDepositStatus() {
    PGSpi(History.getHistoryStatus.toTarget(input: {'isDeposit': true}))
        .rxRequest<List<HistoryStatus>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => HistoryStatus.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        return [];
      }
    }).listen((event) {
      if (event.success) {
        state.depositStatus = event.data;
        state.depositStatus
            .insert(0, HistoryStatus(code: '', description: localized('all')));
        setCurStatus(state.depositStatus[0]);
      }
    }).onError((error) {});
  }

  void _loadWithdrawStatus() {
    PGSpi(History.getHistoryStatus.toTarget(input: {'isDeposit': false}))
        .rxRequest<List<HistoryStatus>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => HistoryStatus.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        return [];
      }
    }).listen((event) {
      if (event.success) {
        state.withdrawStatus = event.data;
        state.withdrawStatus
            .insert(0, HistoryStatus(code: '', description: localized('all')));
        setCurStatus(state.withdrawStatus[0]);
      }
    }).onError((error) {});
  }

  /// 设置划转和调账状态（本地写死）
  void _setStatus() {
    state.transferStatus.clear();
    state.transferStatus
        .add(HistoryStatus(code: '-1', description: localized('all')));
    state.transferStatus
        .add(HistoryStatus(code: '0', description: localized('successful')));
    state.transferStatus
        .add(HistoryStatus(code: '1', description: localized('failed')));

    state.adjustStatus.clear();
    state.adjustStatus
        .add(HistoryStatus(code: '0', description: localized('all')));
    state.adjustStatus
        .add(HistoryStatus(code: '1', description: localized('add')));
    state.adjustStatus
        .add(HistoryStatus(code: '2', description: localized('deductions')));

    state.allAccounts.clear();
    state.allAccounts.add(GamingHistoryAdjustAccount(
        category: 'Main', description: localized('main')));
    state.allAccounts.add(GamingHistoryAdjustAccount(
        category: 'WithdrawLimit', description: FeeService().wdLimit));

    setCurAdjustAccount(state.allAccounts[0]);
  }

  List<HistoryStatus> getCurAllStatus() {
    if (state.index == 0) {
      return state.depositStatus;
    } else if (state.index == 1) {
      return state.withdrawStatus;
    } else if (state.index == 2) {
      return state.transferStatus;
    } else if (state.index == 4) {
      return state.adjustStatus;
    }

    return [];
  }

  /// 设置状态
  void setCurStatus(HistoryStatus status) {
    state.historyStatus = status;
    state._curStatus(status);
  }

  /// 设置时间范围类型
  void setCurScopeType(TimeScopeType type) {
    state.timeScopeType = type;
    state._curScopeType(type);

    if (type != TimeScopeType.customizeTime) {
      int before = 30;
      if (type == TimeScopeType.last7Days) {
        before = 7;
      } else if (type == TimeScopeType.last90Days) {
        before = 90;
      }

      DateTime now = DateTime.now();
      DateTime end = DateTime(now.year, now.month, now.day);
      DateTime start = end.subtract(Duration(days: before));

      setCustomizeTimeStartTime(start);
      setCustomizeTimeEndTime(end, moreOneDay: true);
    } else {
      DateTime now = DateTime.now();
      DateTime end = DateTime(now.year, now.month, now.day);
      setCustomizeTimeEndTime(state.endTime ?? end, moreOneDay: true);
    }
  }

  /// 设置币种
  void setCurrency(GamingCurrencyModel? model) {
    if (model == null) {
      /// 选择全部币种
      GamingCurrencyModel cur = GamingCurrencyModel(
          currency: localized('all'),
          name: localized('all'),
          symbol: '',
          icon: '',
          isDigital: true,
          isVisible: true,
          sort: 0);
      state.currencyModel = cur;
      state._currency(cur);
    } else {
      state.currencyModel = model;
      state._currency(model);
    }
  }

  void _initTabController(int length) {
    tabController =
        TabController(length: length, vsync: this, initialIndex: state.index);
    tabController.removeListener(_tabListener);
    tabController.addListener(_tabListener);
  }

  void _initIndex() {
    if (historyTypeValue.isEmpty ||
        historyTypeValue == HistoryType.deposit.value) {
      state._index.value = 0;
    } else if (historyTypeValue == HistoryType.withdraw.value) {
      state._index.value = 1;
    } else if (historyTypeValue == HistoryType.transfer.value) {
      state._index.value = 2;
    } else if (historyTypeValue == HistoryType.bonus.value) {
      state._index.value = 3;
    } else if (historyTypeValue == HistoryType.adjust.value) {
      state._index.value = 4;
    } else if (historyTypeValue == HistoryType.commission.value) {
      state._index.value = 5;
    } else if (historyTypeValue == HistoryType.luckyDraw.value) {
      state._index.value = 6;
    }
  }

  void _tabListener() {
    if (state.index != tabController.index) {
      state._index.value = tabController.index;
      resetSift();
      GamingEvent.refreshHistoryWallet.notify();
    }
  }

  /// 点击筛选的重置,初始化
  void resetSift() {
    if (getCurAllStatus().isNotEmpty) {
      setCurStatus(getCurAllStatus()[0]);
    }
    setCurScopeType(TimeScopeType.last30Days);
    setCurrency(null);

    if (state.allBonusType.isNotEmpty) {
      setCurBonusType(state.allBonusType[0]!);
    }

    if (state.allCommissionType.isNotEmpty) {
      setCurCommissionType(state.allCommissionType[0]);
    }

    if (state.allAccounts.isNotEmpty) {
      setCurAdjustAccount(state.allAccounts[0]);
    }
  }

  /// 设置自定义时间
  void setCustomizeTimeScopeType(DateTime start, DateTime end) {
    setCurScopeType(TimeScopeType.customizeTime);
    setCustomizeTimeStartTime(start);
    setCustomizeTimeEndTime(end);
  }

  /// 设置自定义时间
  void setCustomizeTimeStartTime(DateTime start) {
    state.startDateTime = start;
    state._startTime(start);
  }

  /// 设置自定义时间
  void setCustomizeTimeEndTime(DateTime end, {bool moreOneDay = false}) {
    if (moreOneDay) {
      DateTime realEnd =
          DateTime(end.year, end.month, end.day).add(const Duration(days: 1));

      state.endDateTime = realEnd;
      state._endTime(realEnd);
    } else {
      state.endDateTime = end;
      state._endTime(end);
    }
  }

  /// 初始化 设置默认钱包
  void setDefaultWallet(List<GamingTransferWalletSelectType> allWallets) {
    state.allWallets = allWallets;

    /// 查找主账户
    for (GamingTransferWalletSelectType wallet in allWallets) {
      if (wallet.isMainWallet) {
        state.mainWallet = wallet;
        break;
      }
    }

    setFromWallet(state.mainWallet);
  }

  /// 设置from钱包
  void setFromWallet(GamingTransferWalletSelectType? fromWallet) {
    if (state.toWallet != null &&
        fromWallet != null &&
        fromWallet.code == state.toWallet!.code &&
        fromWallet.code != '') {
      // from 和 to 都有值，并且把to设置给from
      exchangeWallets();
    } else {
      state.fromTransferWalletSelectType = fromWallet;
      state._fromWallet(fromWallet);
      if (state.fromWallet != null && !state.fromWallet!.isMainWallet) {
        setToWallet(state.mainWallet);
      }
    }
  }

  /// 设置to钱包
  void setToWallet(GamingTransferWalletSelectType? toWallet) {
    if (state.fromWallet != null &&
        toWallet != null &&
        toWallet.code == state.fromWallet!.code &&
        toWallet.code != '') {
      // from 和 to 都有值，并且把from设置给to
      exchangeWallets();
    } else {
      state.toTransferWalletSelectType = toWallet;
      state._toWallet(toWallet);
      state.toWalletName.value = toWallet?.description ?? '';
      if (state.toWallet != null && !state.toWallet!.isMainWallet) {
        setFromWallet(state.mainWallet);
      }
    }
  }

  /// 钱包置换
  void exchangeWallets() {
    final temp = state.fromWallet;
    state.fromTransferWalletSelectType = state.toWallet;
    state._fromWallet(state.toWallet);
    state.toTransferWalletSelectType = temp;
    state._toWallet(temp);
    state.toWalletName.value == (temp?.description ?? '');
  }

  /// 点击筛选
  void onClickSift() {
    GamingEvent.refreshHistoryWallet.notify();
  }

  /// 初始化 红利方式
  void setDefaultAllBonus(List<GamingBonusGrantTypeModel> allBonusType) {
    if (allBonusType.isEmpty) return;
    state.allBonusType.clear();
    state.allBonusType = allBonusType;
    state.allBonusType.insert(
        0,
        GamingBonusGrantTypeModel.fromJson(
            {'code': '', 'description': localized('all')}));
    setCurBonusType(state.allBonusType[0]!);
  }

  /// 设置当前红利发放方式
  void setCurBonusType(GamingBonusGrantTypeModel bonusType) {
    state.gamingBonusGrantTypeModel = bonusType;
    state._curBonusType(bonusType);
  }

  /// 设置当前账户选择（调账）
  void setCurAdjustAccount(GamingHistoryAdjustAccount account) {
    state.gamingHistoryAdjustAccount = account;
    state._curAdjustAccount(account);
  }

  /// 初始化 佣金类型
  void setDefaultAllCommissionType(List<CommissionType> commissionTypes) {
    if (commissionTypes.isEmpty) return;
    state.allCommissionType.clear();
    state.allCommissionType = commissionTypes;
    state.allCommissionType.insert(0,
        CommissionType.fromJson({'code': '', 'description': localized('all')}));
    setCurCommissionType(state.allCommissionType[0]);
  }

  /// 设置当前佣金类型
  void setCurCommissionType(CommissionType curType) {
    state.commissionType = curType;
    state._curCommissionType(curType);
  }

  /// 选择币种
  void selectCurrency() {
    if (state.index == 0 || state.index == 1) {
      GamingCurrencySelectorWithAll.show(isDigital: state.isDigital.value)
          .then((value) {
        if (value != null) {
          setCurrency(value);
        }
      });
    } else if (state.index == 2 || state.index == 3 || state.index == 4) {
      GamingCurrencySelectorWithAll.show(isAll: true).then((value) {
        if (value != null) {
          setCurrency(value);
        }
      });
    }
  }

  void changeDigital(bool isDigital) {
    if (state.isDigital.value == isDigital) return;
    state.isDigital.value = isDigital;
    resetSift();
    GamingEvent.refreshHistoryWallet.notify();
  }

  @override
  LoadCallback get onRefresh => (p1) {};
}
