import 'dart:async';

import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_main_wallet/gaming_main_wallet_currency_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_main_wallet/gaming_main_wallet_model.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/wallet_service.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/widget_header.dart';

part 'main_wallet_state.dart';

class MainWalletLogic extends BaseController with SingleRenderControllerMixin {
  MainWalletLogic() : state = MainWalletState();

  late MainWalletState state;

  late StreamSubscription<dynamic> userBalanceSub;

  @override
  void onInit() {
    super.onInit();

    everAll([
      state.textFieldController.text,
      state._hideSmallAsset,
      state._sort,
    ], (v) {
      _onFilterChanged();
    });

    ever<List<GamingMainWalletCurrencyModel>>(state._currencies, (v) {
      loadCompleted(
        state: v.isEmpty ? LoadState.empty : LoadState.successful,
      );
    });
    ever<GamingMainWalletModel>(state._wallet, (v) {
      state.currencies.assignAll(v.currencies.toList());
    });

    //订阅余额更新
    userBalanceSub = AccountService().userBalances.listen((p0) {
      getWalletViewData();
    });
  }

  @override
  void Function() get onLoadData => () {
        loadCompleted(state: LoadState.loading);
        onLoadDataStream().doOnError((err, p1) {
          loadCompleted(state: LoadState.failed);
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
        }).listen(null, onError: (p0, p1) {});
      };

  Stream<void> onLoadDataStream() {
    return Rx.combineLatestList([
      CurrencyService.sharedInstance.updateRate(),
      WalletService().loadMainWallet().doOnData((event) {
        state._wallet(event);
      }),
    ]);
  }

  void getWalletViewData() {
    if (!controller.state.loadSuccessful) return;
    if (!AccountService().isLogin) return;

    showLoading();
    // 更新钱包信息
    onLoadDataStream().doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      hideLoading();
    }).listen(null, onError: (p0, p1) {});
  }

  void expand(String? currency) {
    if (state.expanded == currency) {
      state._expanded.value = null;
    } else {
      state._expanded.value = currency;
    }
  }

  void sort(MainWalletCurrencySortType type) {
    if (state.sort?.type == type) {
      if (state.sort!.order == MainWalletCurrencySortOrder.ascending) {
        state._sort(state.sort!.copyWith(
          order: MainWalletCurrencySortOrder.descending,
        ));
      } else {
        state._sort.value = null;
      }
    } else {
      state._sort(MainWalletCurrencySort.ascending(type: type));
    }
  }

  void toggleHideSmallAsset() {
    state._hideSmallAsset.value = !state.hideSmallAsset;
  }

  void _onFilterChanged() {
    List<GamingMainWalletCurrencyModel> list = state.wallet.currencies.toList();
    final keyword = state.textFieldController.text;
    if (keyword.isNotEmpty) {
      list = list
          .where((element) =>
              element.currency.toLowerCase().contains(keyword.toLowerCase()))
          .toList();
    }

    if (state.hideSmallAsset) {
      list = list
        ..removeWhere((element) =>
            state._convertUSDT(element.total, element.currency).number < 10);
    }

    if (state.sort != null) {
      if (state.sort!.type == MainWalletCurrencySortType.currency) {
        list = list
          ..sort((a, b) {
            if (state.sort!.order == MainWalletCurrencySortOrder.ascending) {
              return a.currency.compareTo(b.currency);
            } else {
              return b.currency.compareTo(a.currency);
            }
          });
      } else {
        list = list
          ..sort((a, b) {
            late double a1;
            late double b1;
            if (state.sort!.type == MainWalletCurrencySortType.all) {
              a1 = a.total;
              b1 = b.total;
            } else if (state.sort!.type ==
                MainWalletCurrencySortType.canUseAmount) {
              a1 = a.canUseAmount;
              b1 = b.canUseAmount;
            } else if (state.sort!.type ==
                MainWalletCurrencySortType.freezeAmount) {
              a1 = a.freezeAmount;
              b1 = b.freezeAmount;
            }
            if (state.sort!.order == MainWalletCurrencySortOrder.ascending) {
              return state._convertUSDT(a1, a.currency).number.compareTo(
                    state._convertUSDT(b1, b.currency).number,
                  );
            } else {
              return state._convertUSDT(b1, b.currency).number.compareTo(
                    state._convertUSDT(a1, a.currency).number,
                  );
            }
          });
      }
    }
    state.currencies.assignAll(list);
  }

  void clearNegative(GamingMainWalletCurrencyModel data) {
    showLoading();
    WalletService().applyClearNegative(data.currency).listen((event) {
      if (event) {
        Toast.showSuccessful(localized('app_s'));
      }
    }, onError: (Object error) {
      if (error is GoGamingResponse) {
        Toast.showFailed(error.message);
      } else {
        Toast.showTryLater();
      }
    }, onDone: () {
      hideLoading();
    });
  }

  void creditCardBuy(String currency) {
    Map<String, dynamic> dataMap = {"actionvalue1": 2};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.clickDeposit, dataMap: dataMap);
    showLoading();
    CurrencyService().getCurrencyPurchase(toToken: currency).listen((event) {
      hideLoading();
      if (event?.contains('http') == true) {
        // 跳转第三方网页
        Get.toNamed<dynamic>(
          Routes.webview.route,
          arguments: {
            'link': event,
            'title': localized('buy_coins'),
          },
        );
      } else {
        Toast.showTryLater();
      }
    }, onError: (Object error) {
      hideLoading();
      if (error is GoGamingResponse) {
        Toast.showFailed(error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

  @override
  void onClose() {
    super.onClose();
    userBalanceSub.cancel();
  }
}
