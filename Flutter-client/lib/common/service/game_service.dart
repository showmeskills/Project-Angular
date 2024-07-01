import 'package:base_framework/base_framework.dart';
import 'package:gogaming_app/common/api/game/game_api.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_search_result_model.dart';

import 'package:gogaming_app/common/api/game/models/gaming_game_provider_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_range_setting_model.dart';
import 'package:gogaming_app/common/api/game/models/play_game_model.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_wallet_overview/gaming_overview_transfer_wallet.dart';
import 'package:gogaming_app/common/service/restart_service.dart';
import 'package:gogaming_app/common/service/wallet_service.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import 'package:gogaming_app/config/config.dart';

import '../api/base/base_api.dart';
import '../api/game/models/game_label_model.dart';
import '../api/game/models/gaming_game_sort_model.dart';
import '../api/game/models/gaming_multip_label_model.dart';
import 'currency/currency_service.dart';

/// GamingGameListByLabelModel包涵文本数据 所以需要重启
class GameService extends RestartServiceInterface {
  factory GameService() => _getInstance();

  static GameService get sharedInstance => _getInstance();

  static GameService? _instance;

  static GameService _getInstance() {
    _instance ??= GameService._internal();
    return _instance!;
  }

  GameService._internal();

  final providerObs = <GamingGameProviderModel>[].obs;
  final RxList<GamingSortSelectModel> _sortItems =
      <GamingSortSelectModel>[].obs;

  List<GamingSortSelectModel> get sortItems => _sortItems;

  final RxList<GameLabelModel> _gameLabelList = <GameLabelModel>[].obs;

  /// 获取所有游戏标签
  List<GameLabelModel> get gameLabelList => _gameLabelList;

  /// 所有的供应商列表
  List<GamingGameProviderModel> get provider => providerObs;

  late final recommendGame = GamingGameMultipleLabelModel(gameLists: []).obs;

  late final rangeSetting =
      GamingGameRangeSettingModel(providerSettingList: []).obs;

  final favoriteCount = 0.obs;

  void initData() {
    loadProvider().listen((event) {}, onError: (e) {});
    loadRecommend().listen((event) {}, onError: (e) {});
    loadRangeSetting().listen((event) {}, onError: (e) {});
    loadSortItems().listen((event) {}, onError: (e) {});
    loadGameLabel().listen((event) {}, onError: (e) {});
  }

  String displayIconUrl(String? currency) {
    if (currency == null) return '';
    if (currency == 'USD') {
      currency = 'USDT';
    }
    return CurrencyService()[currency]?.iconUrl ?? '';
  }

  String displayCurrency(String? currency) {
    if (currency == 'USD') {
      return 'USDT';
    } else {
      return currency ?? '';
    }
  }

  /// 根据 labelId 查找，结果可能为空
  GameLabelModel? getLabelModelByLabelId(String labelId) {
    return gameLabelList.firstWhereOrNull((element) {
      return element.code == labelId;
    });
  }

  /// 获取游戏链接
  Stream<GoGamingResponse<PlayGameModel>> getPlayGame({
    required String providerId,
    String? gameId,
    required String currencyCode,
    required String gameCurrencyCode,
    bool isTry = false,
    String? agOddType,
    required bool showModeIsDay,
  }) {
    final gameIdMap = Config.currentConfig.gameConfig.gameIdMap;
    final domain = WebUrlService.baseUrl;

    final map = {
      'showMode': showModeIsDay ? 'Day' : 'Night',
      'providerCatId': providerId,
      'gameId': gameId ?? gameIdMap[providerId] ?? providerId,
      'currencyCode': currencyCode,
      'gameCurrencyCode': gameCurrencyCode,
      'playMode': isTry ? 'Try' : 'Normal',
      'siteType': 'Mobile',
      'domain': domain,
      if (agOddType?.isNotEmpty == true) 'AgOddType': agOddType, //AG盤口類型
    };
    return PGSpi(Game.playGame.toTarget(input: map))
        .rxRequest<PlayGameModel>((value) {
      var data = <String, dynamic>{};
      if (value['data'] is Map) {
        data = Map<String, dynamic>.from(value['data'] as Map);
      }
      return PlayGameModel.fromJson(data);
    }).doOnData((event) {
      // 如果游戏链接为空，上报错误
      if (event.success && (event.data.playGameUrl?.isEmpty ?? true)) {
        Sentry.captureException(GameUrlEmpty(map));
      }
    });
  }

  /// 寻找转账钱包信息
  Stream<GamingOverviewTransferWalletModel?> findTransferWallet(
      String providerId) {
    // 处理游戏和钱包的交互 兼容新旧厂商交互 例如FBSport=》FBSport-1
    if (providerId.contains('-')) {
      providerId = providerId.split('-').first;
    }
    return WalletService().getTransferWallet().flatMap((value) {
      final result = value.firstWhereOrNull((element) =>
          element.providerId == providerId && !element.isMainWallet);
      return Stream.value(result);
    });
  }

  /// 添加收藏游戏
  Stream<GoGamingResponse<int>> addFavoriteGame(int id) {
    return PGSpi(Game.addFavoriteGame.toTarget(inputData: {"id": id}))
        .rxRequest<int>((value) {
      return int.tryParse('${value['data']}') ?? 0;
    }).doOnData((event) {
      favoriteCount.value = event.data;
    });
  }

  /// 移除收藏游戏
  Stream<GoGamingResponse<int>> removeFavoriteGame(int id) {
    return PGSpi(Game.removeFavoriteGame.toTarget(inputData: {"id": id}))
        .rxRequest<int>((value) {
      return int.tryParse('${value['data']}') ?? 0;
    }).doOnData((event) {
      favoriteCount.value = event.data;
    });
  }

  Stream<GoGamingResponse<GamingGameMultipleLabelModel>> loadRecommend() {
    return PGSpi(Game.getGameMultipleLabel.toTarget(
      inputData: {
        'labelCodes': <int>[],
        "isRecomment": false,
        "gameCount": 25,
        'isHill': false,
      },
    )).rxRequest<GamingGameMultipleLabelModel>((value) {
      final labelModel = GamingGameMultipleLabelModel.fromJson(
          value['data'] as Map<String, dynamic>);
      return labelModel;
    }).doOnData((event) {
      recommendGame(event.data);
    });
  }

  Stream<List<GameLabelModel>> loadGameLabel() {
    return PGSpi(Game.gameLabel.toTarget())
        .rxRequest<List<GameLabelModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) =>
                GameLabelModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return <GameLabelModel>[];
      }
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      _gameLabelList(event);
    });
  }

  Stream<List<GamingGameProviderModel>> loadProvider() {
    return PGSpi(Game.getProvider.toTarget())
        .rxRequest<List<GamingGameProviderModel>>((value) {
      return (value['data'] as List)
          .map((e) =>
              GamingGameProviderModel.fromJson(e as Map<String, dynamic>))
          .where((element) => !Config.currentConfig.gameConfig.filterProviders
              .contains(element.providerCatId))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      providerObs.assignAll(event);
    });
  }

  Stream<List<GamingSortSelectModel>> loadSortItems() {
    return PGSpi(Game.getSortSelect.toTarget())
        .rxRequest<List<GamingSortSelectModel>>((value) {
      return (value['data'] as List)
          .map((e) => GamingSortSelectModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      _sortItems.assignAll(event);
    });
  }

  Stream<GoGamingResponse<GamingGameRangeSettingModel>> loadRangeSetting() {
    return PGSpi(Game.getBetRangeSetting.toTarget())
        .rxRequest<GamingGameRangeSettingModel>((value) {
      var data = value['data'];
      final rangeModel =
          GamingGameRangeSettingModel.fromJson(data as Map<String, dynamic>);
      return rangeModel;
    }).doOnData((event) {
      rangeSetting(event.data);
    });
  }

  Stream<GoGamingResponse<GameSearchResultModel?>> gameSearch(String name) {
    return PGSpi(Game.search.toTarget(input: {"name": name}))
        .rxRequest<GameSearchResultModel?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return GameSearchResultModel.fromJson(data);
      } else {
        return null;
      }
    });
  }

  Stream<GoGamingResponse<GamingGameModel?>> gameInfo(
      String gameId, String providerId) {
    return PGSpi(Game.getGameInfo.toTarget(input: {
      "gameId": gameId,
      'providerCatId': providerId,
    })).rxRequest<GamingGameModel?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return GamingGameModel.fromJson(data);
      } else {
        return null;
      }
    });
  }

  @override
  void onClose() {
    _instance = null;
  }
}
