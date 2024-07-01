import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/game/models/gg_game_provider_category.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_aggs_wallet_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_transfer_wallet_history_model.dart';
import 'package:gogaming_app/common/api/wallet/wallet_api.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/wallet_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/game_config.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/widget_header.dart';

part 'transfer_wallet_state.dart';

class TransferWalletLogic extends BaseController with RefreshControllerMixin {
  TransferWalletLogic(GamingAggsWalletModel wallet)
      : state = TransferWalletState(wallet);

  late TransferWalletState state;

  late StreamSubscription<dynamic> userBalanceSub;

  @override
  void onInit() {
    super.onInit();
    //订阅余额更新
    userBalanceSub = AccountService().userBalances.listen((p0) {
      getWalletViewData();
    });
  }

  @override
  void Function(int) get onRefresh => (p) {
        refreshCompleted(state: LoadState.loading);
        Rx.combineLatestList([
          _loadWalletBalance().doOnData((event) {
            state._wallet(event);
          }),
          onLoadStreamData(page: p).doOnData((event) {
            state._data.value = event;
          }),
        ]).doOnData((event) {
          refreshCompleted(
            state: LoadState.successful,
            total: state.data.total,
            count: state.data.count,
          );
        }).doOnError((err, p1) {
          refreshCompleted(state: LoadState.failed);
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
        }).listen(null, onError: (p0, p1) {});
      };

  @override
  void Function(int) get onLoadMore => (p) {
        loadMoreCompleted(state: LoadState.loading);
        onLoadStreamData(page: p).doOnData((event) {
          state._data.value = state.data.apply(event);
          loadMoreCompleted(
            state: LoadState.successful,
            total: state.data.total,
            count: state.data.count,
          );
        }).doOnError((p0, p1) {
          loadMoreCompleted(state: LoadState.failed);
        }).listen(null, onError: (p0, p1) {});
      };

  Stream<GoGamingPagination<GamingTransferWalletHistoryModel>>
      onLoadStreamData({
    required int page,
  }) {
    return PGSpi(Wallet.gameWalletHistory.toTarget(
      input: {
        'providerId': state.wallet.providerId,
        'pageIndex': page,
        'pageSize': 10,
      },
    )).rxRequest<GoGamingPagination<GamingTransferWalletHistoryModel>>((value) {
      return GoGamingPagination<GamingTransferWalletHistoryModel>.fromJson(
        itemFactory: (e) => GamingTransferWalletHistoryModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<GamingAggsWalletModel> _loadWalletBalance() {
    return WalletService.sharedInstance
        .loadSingleTransferWalletBalance(
      isFirst: state.wallet.isFirst,
      providerId: state.wallet.providerId!,
      category: state.wallet.category,
      currencies: state.wallet.currenciesName,
    )
        .map((event) {
      event.providerCategorys = state.wallet.providerCategorys;
      return event;
    });
  }

  /// 刷新钱包数据
  void getWalletViewData() {
    if (controller.state.loadState == LoadState.loading) return;
    if (!AccountService().isLogin) return;

    showLoading();
    // 更新钱包信息
    _loadWalletBalance().doOnData((event) {
      state._wallet(event);
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      hideLoading();
    }).listen(null, onError: (p0, p1) {});
  }

  bool get hasMultiCategorys {
    // return state.wallet.providerCategorys?.isNotEmpty == true;
    return state.wallet.providerCategorys?.isNotEmpty == true &&
        state.wallet.providerCategorys!.length > 1;
  }

  Future<void> onPlayGamePressed() async {
    if (hasMultiCategorys) {
      final selectCategory = await GamingSelector.simple<int>(
        title: localized('go_game'),
        useCloseButton: false,
        centerTitle: true,
        // fixedHeight: false,
        itemBuilder: (context, e, index) {
          final category = GGGameProviderCategory.fromValue('$e');
          final localizeText = localized('${category.title}__text');
          final text =
              '${localized(state.wallet.category.toLowerCase())}-$localizeText';
          return Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(height: 50.dp),
              Expanded(
                child: Text(
                  text,
                  textAlign: TextAlign.center,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ),
            ],
          );
        },
        original: state.wallet.providerCategorys!,
      );

      final providerCatId = '${state.wallet.providerId!}-$selectCategory';

      playGame(
          providerCatId: providerCatId,
          selectCategory: GGUtil.parseInt(selectCategory));
    } else {
      final providerCatId =
          '${state.wallet.providerId!}-${state.wallet.providerCategorys?.first}';
      playGame(
          providerCatId: providerCatId,
          selectCategory:
              GGUtil.parseInt(state.wallet.providerCategorys?.first));
    }
  }

  void playGame({required String providerCatId, int selectCategory = 0}) {
    // 如果是GPI棋牌｜FC捕鱼，跳转到
    if (providerCatId == GameConfig.gpiChessProviderId ||
        providerCatId == GameConfig.fchunterProviderId) {
      Get.toNamed<dynamic>(Routes.providerGameList.route, arguments: {
        "providerId": providerCatId,
      });
      return;
    }
    if (GameConfig.agProvider.contains(state.wallet.providerId)) {
      if (selectCategory == 5) {
        // 这里如果selectCategory为5，就是老虎机，跳转到游戏列表页
        Get.offAndToNamed<dynamic>(Routes.providerGameList.route, arguments: {
          "providerId": providerCatId,
        });
      } else {
        // 其他情况，跳转到游戏介绍页 其中包括4
        Get.toNamed<void>(Routes.gameDetail.route, arguments: {
          'gameId': '0',
          'providerId': providerCatId,
        });
      }
    } else if (providerCatId.contains(GameConfig.baisonProvider)) {
      if (selectCategory == 5) {
        // 这里如果selectCategory为5，就是老虎机，跳转到游戏列表页
        Get.offAndToNamed<dynamic>(Routes.providerGameList.route, arguments: {
          "providerId": providerCatId,
        });
      } else if (selectCategory == 6) {
        // 其他情况，跳转到游戏介绍页 其中包括4
        Get.toNamed<void>(Routes.gameDetail.route, arguments: {
          'gameId': '1000',
          'providerId': providerCatId,
        });
      }
    } else {
      Get.toNamed<dynamic>(Routes.gamePlayReady.route, arguments: {
        'providerId': providerCatId,
      });
    }
  }

  @override
  void onClose() {
    super.onClose();
    userBalanceSub.cancel();
  }
}
