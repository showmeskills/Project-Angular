// ignore_for_file: unused_element
import 'package:gogaming_app/config/config.dart';

import '../base/base_api.dart';

enum GameSortType {
  home('HomeSort'),
  provider('ProviderSort'),
  label('LabelSort');

  const GameSortType(this.value);

  final String value;

  factory GameSortType.fromValue(int value) {
    switch (value) {
      case 0:
        return GameSortType.home;
      case 1:
        return GameSortType.provider;
      case 2:
        return GameSortType.label;
    }
    throw 'Invalid enum value: $value';
  }
}

enum GameLabelType {
  hall('Hall'),
  front('FrontPage'),
  menu('Menu'),
  hallBar('HallBar');

  const GameLabelType(this.value);

  final String value;

  factory GameLabelType.fromValue(String value) {
    switch (value) {
      case 'Hall':
        return GameLabelType.hall;
      case 'FrontPage':
        return GameLabelType.front;
      case 'Menu':
        return GameLabelType.menu;
      case 'HallBar':
        return GameLabelType.hallBar;
    }
    throw 'Invalid enum value: $value';
  }
}

enum Game with GoGamingApi {
  /// 游戏信息
  getGameInfo(params: {'providerCatId': '供应商Id-Category', 'gameId': 'gameId'}),

  /// 搜索
  search(params: {'name': "关键词"}),

  /// 获取游戏标签
  gameLabel(),

  /// 获取游戏链接
  playGame(params: {
    'providerCatId': '游戏商代碼',
    'gameId': '游戏id',
    'currencyCode': '用户币别代号',
    'gameCurrencyCode': '游戏币种',
    'playMode': 'Try | Normal',
    'siteType': 'PC | Mobile | APP',
    'domain': '請求方網域名 Web传送站台网域 APP传送系统版本号 ex.ios15.2、Android 11',
    'agOddType': null, //AG盤口類型
  }),

  /// 获取场景标签
  getScenesMenu(),

  /// 根据场景 id 获取游戏列表
  getScenesGameListByLabelIds(params: {
    'ids': [0],
  }),

  /// 移除收藏游戏
  removeFavoriteGame(data: {'id': 0}),

  /// 添加收藏游戏
  addFavoriteGame(data: {'id': 0}),
  getGameListByLabel(data: {
    'labelCodes': <int>[],
    'isRecomment': null, //bool 是否首页推荐
    'gameCount': null, //int 显示游戏数量，预设24个，上限50个
    'isHall': null, // bool 是否游戏大厅
    'entryType': null, // 从大厅进入的类型 0：不区分，1：娱乐城，2：彩票
  }),
  getGameMultipleLabel(data: {
    'labelCodes': <int>[],
    'isRecomment': null, //bool 是否首页推荐
    'gameCount': null, //int 显示游戏数量，预设24个，上限50个
    'isHall': null, // bool 是否游戏大厅
    'entryType': null, // 从大厅进入的类型 0：不区分，1：娱乐城，2：彩票
  }),

  /// * [sortType] 场景类型 `GameSortType.home.value`
  getGameListByProvider(
    data: {
      'labelCode': null,

      /// 变更为 int 数组
      'providerCatIds': null,
      'gameTypes': null,
      'sort': null,
      // HomeSort:0, //首页排序       首页排序，或者不传sortType 默认就是这个
      // ProviderSort:1, //厂商排序    点击厂商的时候传递
      // LabelSort:2, //标签排序    点击标签的时候传递
      'sortType': null,
      'pageIndex': 0,
      'pageSize': 20,
    },
  ),
  getProviderByLabel(
    data: {
      'labelCodes': <String>[],
    },
  ),

  getLabelByProviderId(params: {'providerCatId': 'x'}),
  getSortSelect(),
  getProvider(),

  /// 获取热门游戏
  getHotMatch(params: {
    'matchCount': 0,
    'lang': '',
  }),

  /// 根据场景获取标签和游戏列表
  ///
  /// * [gameCount] 显示游戏数量，预设24个，上限50个
  /// * [scenesType] 场景类型 `GameLabelType.hall.value`
  getLabelAndGameListByScenes(data: {
    'gameCount': 24,
    'scenesType': 'x',
  }),
  getBetRangeSetting(),
  getRecentlyPlayed(
    params: {
      'pageIndex': 0,
      'pageSize': 20,
    },
  ),
  getFavoriteGame(
    params: {
      'pageIndex': 0,
      'pageSize': 20,
    },
  );

  const Game({this.params, this.data});

  @override
  final Map<String, dynamic>? params;
  @override
  final dynamic data;

  @override
  String getBaseUrl() {
    switch (this) {
      case Game.playGame ||
            Game.getRecentlyPlayed ||
            Game.getFavoriteGame ||
            Game.getScenesGameListByLabelIds ||
            Game.getScenesMenu:
        return "${Config.currentConfig.apiUrl}v2";
      default:
        return super.getBaseUrl();
    }
  }

  @override
  String get path {
    switch (this) {
      case Game.getGameMultipleLabel:
        return "/game/gamemultiplelabel";
      case Game.getProvider:
        return "/game/provider";
      case Game.getGameListByLabel:
        return "/game/gamelistbylabel";
      case Game.getLabelAndGameListByScenes:
        return "/game/getlabelandgamelistbyscenes";
      case Game.getRecentlyPlayed:
        return "/game/game/getrecentlyplayed";
      case Game.getFavoriteGame:
        return "/game/game/favoritegame";
      case Game.getGameListByProvider:
        return "/game/gamelistbyprovider";
      case Game.getSortSelect:
        return "/game/sortselect";
      case Game.getProviderByLabel:
        return "/game/providerbylabel";
      case Game.addFavoriteGame:
        return "/game/addfavoritegame";
      case Game.removeFavoriteGame:
        return "/game/removefavoritegame";
      case Game.playGame:
        return '/game/game/playgame';
      case Game.getBetRangeSetting:
        return '/game/getbetrangesetting';
      case Game.search:
        return '/game/search';
      case Game.getGameInfo:
        return '/game/getgameinfo';
      case Game.getLabelByProviderId:
        return '/game/getlabelbyproviderid';
      case Game.gameLabel:
        return '/game/gamelabel';
      case Game.getScenesMenu:
        return '/game/game/getscenesmenu';
      case Game.getScenesGameListByLabelIds:
        return '/game/game/getscenesgamelistbylabelids';
      case Game.getHotMatch:
        return '/game/gethotmatch';
    }
  }

  @override
  HTTPMethod get method {
    switch (this) {
      case Game.getProvider:
      case Game.getSortSelect:
      case Game.playGame:
      case Game.getBetRangeSetting:
      case Game.search:
      case Game.getGameInfo:
      case Game.getLabelByProviderId:
      case Game.gameLabel:
      case Game.getRecentlyPlayed:
      case Game.getFavoriteGame:
      case Game.getScenesGameListByLabelIds:
      case Game.getScenesMenu:
      case Game.getHotMatch:
        return HTTPMethod.get;
      case Game.getGameListByLabel:
      case Game.getGameListByProvider:
      case Game.getProviderByLabel:
      case Game.addFavoriteGame:
      case Game.removeFavoriteGame:
      case Game.getGameMultipleLabel:
      case Game.getLabelAndGameListByScenes:
        return HTTPMethod.post;
    }
  }

  @override
  bool get needCache {
    switch (this) {
      case Game.getBetRangeSetting:
      case Game.getProvider:
      case Game.getSortSelect:
      case Game.getProviderByLabel:
      case Game.getGameListByProvider:
      case Game.getGameMultipleLabel:
      case Game.getGameListByLabel:
      case Game.getLabelAndGameListByScenes:
        return true;
      default:
        return false;
    }
  }
}
