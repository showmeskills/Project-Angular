// ignore_for_file: unnecessary_null_comparison

import 'package:big_dart/big_dart.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_aggs_wallet_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_main_wallet/gaming_main_wallet_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_transfer_wallet_balance_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_wallet_currency.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_wallet_overview_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_main_wallet.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_transfer_wallet.dart';
import 'package:gogaming_app/common/api/wallet/wallet_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/router/app_pages.dart';

class WalletService {
  factory WalletService() => _getInstance();

  static WalletService get sharedInstance => _getInstance();

  static WalletService? _instance;

  /// 转账钱包列表数据
  final transferWallet = <GamingOverviewTransferWalletModel>[].obs;

  /// 钱包总览数据
  GamingWalletOverviewModel? _overviewModel;

  static WalletService _getInstance() {
    _instance ??= WalletService._internal();
    return _instance!;
  }

  WalletService._internal() {
    final cacheUser = AccountService.sharedInstance.cacheUser;
    cacheUser.getBox!().listenKey(cacheUser.key, (value) {
      resetAllData();
    });
  }

  void resetAllData() {
    transferWallet.clear();
    _overviewModel = null;
  }

  /// 刷新钱包划转列表
  Stream<List<GamingOverviewTransferWalletModel>> getTransferWallet() {
    // if (transferWallet.isNotEmpty) {
    //   return Stream.value(transferWallet.toList());
    // }
    return PGSpi(Wallet.transferWalletList.toTarget())
        .rxRequest<List<GamingOverviewTransferWalletModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => GamingOverviewTransferWalletModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    }).doOnData((event) {
      transferWallet.assignAll(event.data);
    }).map((event) => event.data);
  }

  /// 钱包总览 依赖汇率数据所以要先获取汇率数据再请求
  Stream<GamingWalletOverviewModel> overview({bool useCahce = false}) {
    if (useCahce && _overviewModel != null) {
      return Stream.value(_overviewModel!);
    }
    return PGSpi(Wallet.overview.toTarget())
        .rxRequest<GamingWalletOverviewModel>((value) {
      return GamingWalletOverviewModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).flatMap((event) {
      List<GamingAggsWalletCurrencyModel> currencies = [];
      List<String> delete = [];
      for (final e in event.data.overviewWallet.currencies) {
        final rate = CurrencyService().getUSDTRate(e.currency);
        if (rate != null) {
          currencies.add(GamingAggsWalletCurrencyModel(
            currency: e.currency,
            totalBalance: e.balance,
            rate: rate,
          ));
        } else {
          delete.add(e.currency);
        }
      }
      event.data.overviewWallet.currencies
          .removeWhere((element) => delete.contains(element.currency));
      if (currencies.isNotEmpty) {
        event.data.overviewWallet.totalBalance = currencies
            .map((e) => Big(e.totalBalance) * Big(e.rate))
            .reduce((value, element) => value + element)
            .toNumber();
        event.data.totalAsset = event.data.overviewWallet.totalBalance;
      }
      _overviewModel = event.data;
      return Stream.value(event.data);
    });
  }

  /// 主钱包
  Stream<GamingMainWalletModel> loadMainWallet() {
    return PGSpi(Wallet.mainWallet.toTarget())
        .rxRequest<GamingMainWalletModel>((value) {
          return GamingMainWalletModel.fromJson(
              value['data'] as Map<String, dynamic>);
        })
        .map((event) => event.data)
        .flatMap((event) {
          List<GamingAggsWalletCurrencyModel> currencies = [];
          List<String> delete = [];
          for (final e in event.currencies) {
            final rate = CurrencyService().getUSDTRate(e.currency);
            if (rate != null) {
              currencies.add(GamingAggsWalletCurrencyModel(
                currency: e.currency,
                totalBalance: e.total,
                rate: rate,
              ));
            } else {
              delete.add(e.currency);
            }
          }
          event.currencies
              .removeWhere((element) => delete.contains(element.currency));
          event.totalAsset = currencies.isEmpty
              ? 0
              : currencies
                  .map((e) => Big(e.totalBalance) * Big(e.rate))
                  .reduce((value, element) => value + element)
                  .toNumber();
          return Stream.value(event);
        });
  }

  Stream<GamingAggsWalletModel> loadSingleTransferWalletBalance({
    required String providerId,
    required String category,
    required List<String> currencies,
    required bool isFirst,
  }) {
    if (isFirst || currencies.isEmpty) {
      return Stream.value(GamingAggsWalletModel(
        category: category,
        isFirst: isFirst,
        providerId: providerId,
        currencies: [],
      ));
    }
    return Rx.combineLatestList<GamingAggsWalletCurrencyModel>(
      currencies.map(
        (c) => PGSpi(Wallet.transerWalletBalance.toTarget(
          input: {
            'platformGroupCode': providerId,
            'currency': c,
          },
        )).rxRequest<GamingTransferWalletBalanceModel>((value) {
          return GamingTransferWalletBalanceModel.fromJson(
              value['data'] as Map<String, dynamic>);
        }).flatMap(
          (value) => Stream.value(
            GamingAggsWalletCurrencyModel(
              currency: c,
              totalBalance: value.data.totalBalance,
              rate: value.data.rate,
              availBalanceForWithdraw: value.data.availBalanceForWithdraw,
            ),
          ),
        ),
      ),
    ).flatMap((values) {
      return Stream.value(GamingAggsWalletModel(
        category: category,
        providerId: providerId,
        isFirst: isFirst,
        currencies: values.toList(),
      ));
    });
  }

  /// 获取转账钱包余额
  Stream<List<GamingAggsWalletModel>> loadTransferWalletBalance(
      List<GamingOverviewTransferWalletModel> transferWallet) {
    final wallets = transferWallet;
    if (wallets.isEmpty) {
      return Stream.value([]);
    }
    return Rx.combineLatestList(wallets.map((e) {
      final List<String> currencies = [];
      for (final element in e.currencies) {
        if (element.isActivate) {
          currencies.add(element.currency!);
        }
      }
      return loadSingleTransferWalletBalance(
        providerId: e.providerId,
        category: e.category,
        currencies: currencies,
        isFirst: e.isFirst,
      ).map((event) {
        event.providerCategorys = e.providerCategorys;
        return event;
      });
    }));
  }

  /// 清除抵用券
  Stream<bool> clearCredit() {
    return PGSpi(Wallet.clearCredit.toTarget()).rxRequest<bool>((value) {
      return value['data'] == true;
    }).map((event) => event.data);
  }

  /// 负值清零申请
  Stream<bool> applyClearNegative(String currency) {
    return PGSpi(Wallet.applyClearNegative.toTarget(
      inputData: {'currency': currency},
    )).rxRequest<bool>((value) {
      return value['data'] == true;
    }).map((event) => event.data);
  }

  /// 判断是否允许提款
  Stream<bool> allowWithdrawal() {
    return PGSpi(Wallet.allowWithdrawal.toTarget()).rxRequest<bool>((value) {
      return value['data'] == true;
    }).map((event) => event.data);
  }

  /// 获取可以进行 清除提款限额 的币种
  Stream<List<GamingWalletOverviewCurrencyModel>> getClearWithdrawal() {
    return PGSpi(Wallet.getClearWithdrawal.toTarget())
        .rxRequest<List<GamingWalletOverviewCurrencyModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) => GamingWalletOverviewCurrencyModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    }).map((event) => event.data);
  }

  ///  清除提款限额
  Stream<bool> clearWithdrawalLimit() {
    return PGSpi(Wallet.clearWithdrawalLimit.toTarget())
        .rxRequest<bool>((value) {
      return value['data'] == true;
    }).map((event) => event.data);
  }

  ///  清除提款限额
  Stream<bool> cancelCurrency(String orderNum) {
    return PGSpi(
            Wallet.cancelCurrency.toTarget(inputData: {'orderNum': orderNum}))
        .rxRequest<bool>((value) {
      return value['data'] == true;
    }).map((event) => event.data);
  }

  void openMainWallet(GamingOverviewMainWalletModel wallet) {
    Get.toNamed<void>(
      Routes.mainWallet.route,
      arguments: {
        'data': wallet,
      },
    );
  }

  void openTransferWallet(GamingAggsWalletModel wallet) {
    if (wallet.isFirst) {
      Get.toNamed<dynamic>(Routes.transfer.route,
          arguments: {'category': wallet.category});
    } else {
      Get.toNamed<void>(
        '${Routes.transferWallet.route}/${wallet.providerId!}',
        arguments: {
          'data': wallet,
        },
      );
    }
  }
}
