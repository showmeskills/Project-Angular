import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gg_user_balance.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/manager_currency/manager_currency_logic.dart';

class CoinDropdownLogic extends GetxController {
  BuildContext? context;

  final GamingTextFieldController searchController =
      GamingTextFieldController();

  final isLoading = false.obs;
  final currentTab = 0.obs;

  final fiatCoins = <GGUserBalance>[].obs;

  /// 真人娱乐场奖金
  final liveCasinoNonStickyCoins = <GGUserBalance>[].obs;

  /// 娱乐场奖金
  final casinoNonStickyCoins = <GGUserBalance>[].obs;

  double searchNonstickyCoinBalance(String? currency) {
    final list = searchNonstickyCoinMoldes(currency);
    double result = 0;
    for (GGUserBalance userBalance in list) {
      result += userBalance.balance;
    }
    return result;
  }

  List<GGUserBalance> searchNonstickyCoinMoldes(String? currency) {
    if (currency == null) {
      return [];
    }

    List<GGUserBalance> results = <GGUserBalance>[];
    final liveCasinoModel =
        liveCasinoNonStickyCoins.firstWhereOrNull((element) {
      return element.currency == currency;
    });
    if (liveCasinoModel != null) results.add(liveCasinoModel);

    final casinoModel = casinoNonStickyCoins.firstWhereOrNull((element) {
      return element.currency == currency;
    });
    if (casinoModel != null) results.add(casinoModel);
    return results;
  }

  List<GGUserBalance> get fiatAggsCoins {
    if (CurrencyService.sharedInstance.hideZeroBalance) {
      return List<GGUserBalance>.from(fiatCoins)
        ..removeWhere((element) => (element.balance == 0 &&
            (searchNonstickyCoinBalance(element.currency) == 0)));
    } else {
      return fiatCoins;
    }
  }

  final cryptoCoins = <GGUserBalance>[].obs;

  List<GGUserBalance> get cryptoAggsCoins {
    List<GGUserBalance> list = List<GGUserBalance>.from(cryptoCoins);

    // 过滤掉0余额
    if (CurrencyService.sharedInstance.hideZeroBalance) {
      list = list
        ..removeWhere((element) => (element.balance == 0 &&
            (searchNonstickyCoinBalance(element.currency) == 0)));
    }
    // 如果开启了以法币显示加密货币

    return list.map((e) {
      final balance = CurrencyService.sharedInstance.cryptoToFiat(
        currency: e.currency!,
        balance: e.balance,
      );
      return e.copyWith(
        balance: balance.toNumber(),
      );
    }).toList();
  }

  late Function disposeListen;
  late Function disposeListen2;
  late Function disposeListen3;
  late Worker userBalancesWorker;
  late Worker searchWorker;

  List<GGUserBalance> get selectedBalances {
    if (currentTab.value == 0) {
      return cryptoAggsCoins;
    } else {
      return fiatAggsCoins;
    }
  }

  List<GamingCurrencyModel> get allCoins =>
      CurrencyService.sharedInstance.currencyList;

  final currencyManager = Get.put(ManagerCurrencyLogic(), permanent: true);

  @override
  void onInit() {
    super.onInit();

    isLoading.value = true;

    setupData();

    // 监听用户更新
    final cacheUser = AccountService.sharedInstance.cacheUser;
    disposeListen = cacheUser.getBox!().listenKey(cacheUser.key, (value) {
      if (!AccountService.sharedInstance.isLogin) {
        resetData();
      }
      setupData();
    });
    // 余额变动
    userBalancesWorker = ever<List<GGUserBalance>>(
        AccountService.sharedInstance.userBalances, (callback) {
      update();
    });
    // 币种更新
    final cacheCurrencyList = CurrencyService.sharedInstance.cacheCurrencyList;
    disposeListen2 =
        cacheCurrencyList.getBox!().listenKey(cacheCurrencyList.key, (value) {
      _refreshData();
    });

    // 币种管理更新
    final hiddenList = CurrencyService.sharedInstance.hiddenList;
    disposeListen3 = hiddenList.getBox!().listenKey(hiddenList.key, (value) {
      _refreshData();
    });

    searchWorker = debounce<String>(searchController.text, (v) {
      if (v.isEmpty) {
        _refreshData();
      } else {
        _searchData(v);
      }
    });
  }

  void loadData() {
    setupData();
  }

  void dismissView() {
    searchController.focusNode.unfocus();
    searchController.textController.clear();
  }

  void setupData() async {
    _checkAllCoins().flatMap((value) {
      return AccountService.sharedInstance.isLogin
          ? AccountService.sharedInstance.fetchUserBalance()
          : Stream.value(true);
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      if (isLoading.value) {
        isLoading.value = false;
      }
    }).listen((event) {
      _refreshData();
    }, onError: (err) {});
  }

  void _searchData(String keyword) {
    fiatCoins.assignAll(fiatCoins
        .where((element) =>
            element.currency!.toLowerCase().contains(keyword.toLowerCase()))
        .toList());
    cryptoCoins.assignAll(cryptoCoins
        .where((element) =>
            element.currency!.toLowerCase().contains(keyword.toLowerCase()))
        .toList());
    updateHeight();
    update();
  }

  void _refreshData() {
    if (AccountService.sharedInstance.isLogin) {
      _filterDataForLogin();
    } else {
      _filterDataForUnLogin();
    }
    updateHeight();
    update();
  }

  Stream<bool> _checkAllCoins() {
    return allCoins.isEmpty
        ? CurrencyService.sharedInstance.getAllCurrency()
        : Stream.value(true);
  }

  void _filterDataForUnLogin() {
    List<GGUserBalance> cryptoList = [];
    List<GGUserBalance> currencyList = [];
    for (var coin in allCoins) {
      if (coin.isVisible &&
          CurrencyService.sharedInstance.isChecked(coin.currency)) {
        GGUserBalance userBalance = GGUserBalance(
          isDigital: coin.isDigital,
          currency: coin.currency,
          balance: 0,
          sort: 0,
        );
        if (userBalance.isDigital == true) {
          cryptoList.add(userBalance);
        } else {
          currencyList.add(userBalance);
        }
      }
    }
    currencyList.sort((a, b) => a.sort.compareTo(b.sort));
    cryptoList.sort((a, b) => a.sort.compareTo(b.sort));

    fiatCoins.assignAll(currencyList);
    cryptoCoins.assignAll(cryptoList);
  }

  void _filterDataForLogin() {
    final list = AccountService.sharedInstance.userBalances.toList();
    AccountService.sharedInstance.userBalances.assignAll(list);

    List<GGUserBalance> cryptoBalances = list
        .where((userBalance) =>
            userBalance.isDigital &&
            (userBalance.walletCategory.toLowerCase() == 'main') &&
            CurrencyService.sharedInstance.isChecked(userBalance.currency) &&
            CurrencyService
                    .sharedInstance[userBalance.currency ?? '']?.isVisible ==
                true)
        .toList();
    List<GGUserBalance> currencyBalances = list
        .where((userBalance) =>
            !userBalance.isDigital &&
            (userBalance.walletCategory.toLowerCase() == 'main') &&
            CurrencyService.sharedInstance.isChecked(userBalance.currency) &&
            CurrencyService
                    .sharedInstance[userBalance.currency ?? '']?.isVisible ==
                true)
        .toList();
    currencyBalances.sort((a, b) => a.sort.compareTo(b.sort));
    cryptoBalances.sort((a, b) => a.sort.compareTo(b.sort));

    liveCasinoNonStickyCoins.assignAll(list.where((element) {
      return element.walletCategory == 'NSLiveCasino';
    }).toList());
    casinoNonStickyCoins.assignAll(list.where((element) {
      return element.walletCategory == 'NSSlotGame';
    }).toList());
    fiatCoins.assignAll(currencyBalances);
    cryptoCoins.assignAll(cryptoBalances);
  }

  void setCurrentTab(int index) {
    currentTab.value = index;
    updateHeight();
    update();
  }

  void updateHeight() {
    // double height = 0.0;
    // if (currentTab.value == 0) {
    //   height = cryptoCoins.length * 44.dp;
    // } else {
    //   height = fiatCoins.length * 44.dp;
    // }
    // // 最多显示6行
    // double maxHeight = 44.dp * 6;
    // contentHeight.value = min(maxHeight, height);
  }

  void onSelectBalance(GGUserBalance ub) {
    final selectedCurrency = CurrencyService.sharedInstance[ub.currency!];
    if (selectedCurrency != null) {
      CurrencyService.sharedInstance.selectedCurrency = selectedCurrency;
    }
    if (AccountService.sharedInstance.isLogin) {
      currencyManager.setDefaultCurrency(selectedCurrency!.currency!);
    }
  }

  void resetData() {
    fiatCoins.clear();
    cryptoCoins.clear();
  }

  @override
  void onClose() {
    super.onClose();
    searchWorker.dispose();
    userBalancesWorker.dispose();
    disposeListen.call();
    disposeListen2.call();
    disposeListen3.call();
  }
}
