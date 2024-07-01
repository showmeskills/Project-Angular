import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_list_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_network_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_rate_list_model.dart';
import 'package:gogaming_app/common/api/deposit/deposit_api.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/utils/util.dart';

import '../../api/base/base_api.dart';
import '../ip_service.dart';

part '_settings_mixin.dart';

class CurrencyService with _SettingsMixin {
  factory CurrencyService() => _getInstance();

  // instance的getter方法，通过CurrencyService.instance获取对象
  static CurrencyService get sharedInstance => _getInstance();

  // 静态变量_instance，存储唯一对象
  static CurrencyService? _instance;

  // 私有的命名式构造方法，通过它可以实现一个类可以有多个构造函数，
  // 子类不能继承internal不是关键字，可定义其他名字
  CurrencyService._internal() {
    // 初始化
  }

  // 获取对象
  static CurrencyService _getInstance() {
    _instance ??= CurrencyService._internal();
    return _instance!;
  }

  late Map<String, GamingCurrencyModel> _currencyData = () {
    Map<String, GamingCurrencyModel> currencyData = {};
    for (var element in currencyList) {
      currencyData[element.currency ?? ''] = element;
    }
    return currencyData;
  }();

  final cacheCurrencyList = ReadWriteValue<List<dynamic>?>(
    'CurrencyService.cacheCurrencyList',
    null,
    () => GetStorage(),
  );

  /// 所有币种兑usdt汇率
  final _usdtRate = <String, double>{}.obs;
  double getUSDTRate(String? currency, [double defaultValue = 1.0]) {
    return GGUtil.parseDouble(_usdtRate[currency], defaultValue);
  }

  /// 提款网络
  final withdrawNetworks = <GamingCurrencyNetworkListModel>[].obs;

  Map<String, List<GamingCurrencyNetworkModel>> get withdrawNetworksMap =>
      {for (var e in withdrawNetworks) e.currency: e.networks};

  List<GamingCurrencyNetworkModel> get withdrawAllNetwork {
    var sets = <GamingCurrencyNetworkModel>{};
    for (var element in withdrawNetworks) {
      sets.addAll(element.networks);
    }
    return sets.toList();
  }

  /// 存款网络
  final depositNetworks = <GamingCurrencyNetworkListModel>[].obs;

  Map<String, List<GamingCurrencyNetworkModel>> get depositNetworksMap =>
      {for (var e in depositNetworks) e.currency: e.networks};

  /// 所有的货币
  late List<GamingCurrencyModel> _currencyList = () {
    final List<GamingCurrencyModel> list = cacheCurrencyList.val == null
        ? []
        : cacheCurrencyList.val!
            .map((e) => GamingCurrencyModel.fromJson(
                Map<String, dynamic>.from(e as Map)))
            .toList();
    list.sort((a, b) => a.sort.compareTo(b.sort));
    return list;
  }();

  List<GamingCurrencyModel> get currencyList => _currencyList;

  set currencyList(List<GamingCurrencyModel> newList) {
    _currencyList = newList;
    _currencyList.sort((a, b) => a.sort.compareTo(b.sort));
    Map<String, GamingCurrencyModel> currencyData = {};
    for (var element in currencyList) {
      currencyData[element.currency ?? ''] = element;
    }
    _currencyData = currencyData;
    fiatList = getFiatList();
    cryptoList = getCryptoList();
    cacheCurrencyList.val = _currencyList.map((e) => e.toJson()).toList();
  }

  final _cacheSelectedCurrency = ReadWriteValue<Map<String, dynamic>?>(
    'CurrencyService._cacheSelectedCurrency',
    null,
    () => GetStorage(),
  );

  ReadWriteValue<Map<String, dynamic>?> get cacheSelectedCurrency =>
      _cacheSelectedCurrency;

  /// 选中的货币
  late final selectedCurrencyObs = () {
    GamingCurrencyModel model = _loadSelectedCurrency();
    return model.obs;
  }();

  void logoutRefreshSelectedCurrecy() {
    IPService.sharedInstance.getIpInfo(force: true).listen((event) {
      selectedCurrencyObs(_loadSelectedCurrency());
    }).onError((Object error) {});
  }

  GamingCurrencyModel _loadSelectedCurrency() {
    if (AccountService.sharedInstance.isLogin) {
      return _cacheSelectedCurrency.val == null
          ? _configIpDefaultCurrency()
          : GamingCurrencyModel.fromJson(_cacheSelectedCurrency.val!);
    }
    return _configIpDefaultCurrency();
  }

  /// 如果没有设置过默认货币则根据 ip 获取货币
  GamingCurrencyModel _configIpDefaultCurrency() {
    final currency = IPService.sharedInstance.ipModel?.countryCurrency;
    if (currency?.isNotEmpty ?? false) {
      return CurrencyService.sharedInstance.getModelByCurrency(currency!);
    }
    return GamingCurrencyModel.usdt();
  }

  GamingCurrencyModel get selectedCurrency => selectedCurrencyObs.value;

  set selectedCurrency(GamingCurrencyModel model) {
    selectedCurrencyObs(model);
    _cacheSelectedCurrency.val = model.toJson();
  }

  late List<GamingCurrencyModel> fiatList = getFiatList();
  late List<GamingCurrencyModel> cryptoList = getCryptoList();

  final hiddenList = ReadWriteValue<List<dynamic>>(
    'CurrencyService.hiddenList',
    [],
    () => GetStorage(),
  );

  bool isChecked(String? currency) {
    return !hiddenList.val.contains(currency);
  }

  List<GamingCurrencyModel> getCryptoList() {
    final list = _currencyList
        .where((element) => element.isDigital && element.isVisible)
        .toList();
    list.sort((a, b) => a.sort.compareTo(b.sort));
    return list;
  }

  List<GamingCurrencyModel> getFiatList() {
    final list = _currencyList
        .where((element) => !element.isDigital && element.isVisible)
        .toList();
    list.sort((a, b) => a.sort.compareTo(b.sort));
    return list;
  }

  /// 获取选中的法币-法币充值用
  ///
  /// [currency] 如果传入则返回传入的货币，否则返回选中的货币
  GamingCurrencyModel getSelectedFiatCurrency([String? currency]) {
    final defaultCurrency = GamingCurrencyModel.cny();
    GamingCurrencyModel selected = defaultCurrency;
    final currencyList = getFiatList();
    if (currency != null) {
      selected = currencyList.singleWhere(
        (element) => element.currency == currency,
        orElse: () => defaultCurrency,
      );
    } else {
      // 如果选中的币种是法币
      if (!selectedCurrency.isDigital) {
        selected = selectedCurrency;
      }
    }
    // 如果不在币种列表中的则返回第一项币种
    if (!currencyList.map((e) => e.currency).contains(selected.currency)) {
      selected = currencyList.firstOrNull ?? defaultCurrency;
    }
    return selected;
  }

  // Future fetchDataWithKeys(List<String> keys) async {
  //   final notExist = keys.firstWhere(
  //           (element) => !_currencyData.containsKey(element),
  //       orElse: () => null) ==
  //       null;
  //   if (notExist) {
  //     _currencyData = await getAllCurrency();
  //   }
  // }

  GamingCurrencyModel? operator [](String key) {
    // 兼容不包含的游戏币中
    return _currencyData[key] ??
        GamingCurrencyModel(
          currency: key,
          isDigital: false,
          isVisible: true,
          sort: 0,
        );
  }

  bool get isEmpty => currencyList.isEmpty;

  Stream<bool> getAllCurrency() {
    return PGSpi(Currency.getCurrencies.toTarget(input: {'type': 0}))
        .rxRequest<List<GamingCurrencyModel>?>((value) {
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
        currencyList = response.data ?? [];
      }
      return Stream.value(success == true);
    });
  }

  Stream<List<GamingCurrencyModel>?> getVirtualToCurrency(String category) {
    return PGSpi(Currency.getCurrencies.toTarget(input: {
      'type': 2,
      'category': category,
      'isSupportVirtualToCurrency': true,
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
      return Stream.value(response.data ?? []);
    });
  }

  bool isDigital(String currency) {
    return _currencyData[currency]?.isDigital ?? true;
  }

  String getIconUrl(String currency) {
    return _currencyData[currency]?.iconUrl ??
        GamingCurrencyModel.usdt().iconUrl;
  }

  String getCurrencyName(String currency) {
    return _currencyData[currency]?.name ??
        GamingCurrencyModel.usdt().name ??
        '';
  }

  GamingCurrencyModel getModelByCurrency(String currency) {
    return _currencyData[currency] ?? GamingCurrencyModel.usdt();
  }

  /// 获取所有虚拟货币和网络
  Stream<Map<String, List<GamingCurrencyNetworkModel>>> getNetworks(
      CurrencyCategory category) {
    return PGSpi(Currency.networks.toTarget(
      input: {
        'category': category.value,
      },
    )).rxRequest<List<GamingCurrencyNetworkListModel>>((value) {
      return (value['data'] as List?)
              ?.map((e) => GamingCurrencyNetworkListModel.fromJson(
                  e as Map<String, dynamic>))
              .toList() ??
          [];
    }).flatMap((value) {
      final result = {for (var e in value.data) e.currency: e.networks};
      if (category == CurrencyCategory.deposit) {
        depositNetworks.assignAll(value.data);
      } else {
        withdrawNetworks.assignAll(value.data);
      }
      return Stream.value(result);
    }).onErrorResume((error, stackTrace) {
      if (category == CurrencyCategory.deposit &&
          depositNetworksMap.isNotEmpty) {
        return Stream.value(depositNetworksMap);
      } else if (category == CurrencyCategory.withdraw &&
          withdrawNetworksMap.isNotEmpty) {
        return Stream.value(withdrawNetworksMap);
      } else {
        throw error;
      }
    });
  }

  /// 获取所有币种兑x汇率 默认baseCurrency = USDT
  Stream<Map<String, double>> updateRate({String baseCurrency = 'USDT'}) {
    return PGSpi(
      Currency.getRate.toTarget(
        input: {
          'baseCurrency': baseCurrency,
          'exchangeCurrencies': {
            ...currencyList.map((e) {
              return e.currency;
            }),
          }.join(','),
        },
      ),
    ).rxRequest<GamingCurrencyRateListModel?>((value) {
      if (value['data'] is Map) {
        return GamingCurrencyRateListModel.fromJson(
            value['data'] as Map<String, dynamic>);
      }
      return null;
    }).flatMap(
      (value) {
        if (value.data != null) {
          final rate = {for (var e in value.data!.rates) e.currency: e.rate};
          if (baseCurrency == 'USDT') {
            _usdtRate.value = rate;
          }
          return Stream.value(rate);
        }
        return Stream.value({});
      },
    );
  }

  /// 获取购买币种链接
  Stream<String?> getCurrencyPurchase({
    String fromCurrency = 'USD',
    String toToken = 'USDT',
    double amount = 100.0,
  }) {
    return PGSpi(Deposit.currencyPurchase.toTarget(
      input: {
        "currency": fromCurrency,
        "token": toToken,
        'amount': amount,
      },
    )).rxRequest<String?>((value) {
      return value['data'] as String?;
    }).map((event) => event.data);
  }

  /// 获取柱状图对应颜色
  Color getColor(String currency) {
    const colorsMap = <String, Color>{
      'USDC': Color(0xff2775c9),
      'TRX': Color(0xffeb0a29),
      'BTC': Color(0xfff7931a),
      'USDT': Color(0xff26a17b),
      'CNY': Color(0xffffa200),
      'CAD': Color(0xff216ff5),
      'AUD': Color(0xff2da9ea),
      'EUR': Color(0xffeecb1c),
      'GBP': Color(0xffbc3fe0),
      'JPY': Color(0xff06c282),
      'THB': Color(0xffff7856),
      'NZD': Color(0xff216ff5),
      'USD': Color(0xff67c316),
      'VND': Color(0xff164bc3),
      'BUSD': Color(0xffebb42e),
      'XRP': Color(0xff404040),
      'DOGE': Color(0xffba9f33),
      'SHIB': Color(0xfff00500),
      'EOS': Color(0xff1d1d1d),
    };
    return colorsMap[currency] ?? Colors.redAccent;
  }
}
