import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/list_by_label_model.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/tools/url_tool.dart';
import 'package:gogaming_app/config/config.dart';

import '../generated/r.dart';
import 'environment.dart';

enum GameSportsTpe {
  /// OB体育
  obSport,

  /// IM体育
  imSport,

  /// 沙巴体育
  sbSport,

  /// 平博体育
  pbSport,

  /// FB体育
  fbSport,

  /// IM电竞
  imEs,

  ///  平博电竞
  pbEs
}

/// 配置游戏相关的，由前端写死的参数
class GameConfig {
  final Environment environment;

  GameConfig(this.environment);

  /// 筛选厂商，在游戏首页只显示以下渠道的厂商
  final List<String> sortProviders = ["SlotGame", "LiveCasino"];

  // /// 为你推荐的id
  // final String recommendID = "1152547813572677";

  /// 供应商列表要过滤指定供应商
  late final filterProviders = ['60001-3', '62001-1', originalProvider];

  /// 原创游戏厂商id
  final originalProvider = 'GBGame-3';

  /// 不显示“游戏中”的游戏厂商
  late final notPlayingProvider = obLotteryProvider;

  static const obLotteryProvider = 'OBLottery-3';
  static const tcLotteryProvider = 'TCLottery-3';
  static const sgLotteryProvider = 'SGLottery-3';
  static const vrLotteryProvider = 'VRLottery-3';
  static const gpiProvider = 'GPIGame-3';
  static const imeSportProvider = 'IMESport-2';
  static const imSportProvider = 'IMSport-1';
  static const sbSportProvider = 'SaBaSport-1';
  static const pinnacleSportProvider = 'PinnacleSport-1';
  static const fbSportProvider = 'FBSport-1';
  static const tfSportProvider = 'TFESport-2';

  /// providerCatId对应的前缀
  /// ag的 VND 只能输入10的倍数 ag contain '20006'
  static const agProvider = ['20006', 'AGSlot'];
  static const baisonProvider = 'Baison';
  // 目前 的厂商类型有'SportsBook' | 'Esports' | 'Lottery' | 'LiveCasino' | 'SlotGame' | 'Chess' 这六种，
  // 判断只有 【SlotGame 类型的厂商的下的游戏】和【大转盘】，显示“游戏使用中
  /// 显示“游戏中”的游戏厂商
  final playingProvider = ['SlotGame'];

  /// 当没有gameId时根据providerId映射到gameId
  late final gameIdMap = {
    imeSportProvider: 'ESPORTSBULL',
    '40016-2': '',
    obLotteryProvider: '',
    tcLotteryProvider: '',
    vrLotteryProvider: '',
  };

  /// 原创游戏跳转链接
  String originalGameUrl(String gameId) {
    return UrlTool.addParameterToUrl(
        "${WebUrlService.baseUrl}/"
        "${GoGamingService.sharedInstance.apiLang}/"
        "original/${gameId.toLowerCase()}?isApp=1&isDark=${ThemeManager.shareInstacne.isDarkMode ? 1 : 0}",
        GoGamingService.sharedInstance.curToken);
  }

  /// 开元棋牌 id
  static const kyChessProviderId = 'KYChess-6';

  /// 首页体育跳转
  static const sportProviderId = 'OBSport-1';

  /// GPI棋牌 id
  static const gpiChessProviderId = 'GPIChess-6';

  /// FC捕鱼 id
  static const fchunterProviderId = 'FCHunter-5';

  GameSportsTpe getCurType(String providerId, {String gameID = ''}) {
    switch (providerId) {
      case sportProviderId:
        return GameSportsTpe.obSport;
      case imSportProvider:
        return GameSportsTpe.imSport;
      case sbSportProvider:
        return GameSportsTpe.sbSport;
      case pinnacleSportProvider:
        if (gameID == 'e-sports') {
          return GameSportsTpe.pbEs;
        } else {
          return GameSportsTpe.pbSport;
        }
      case fbSportProvider:
        return GameSportsTpe.fbSport;
      case imeSportProvider:
        return GameSportsTpe.imEs;
      default:
        return GameSportsTpe.obSport;
    }
  }

  /// 菜单栏彩票列表数据
  final lotteryList = [
    GamingGameListByLabelModel(
      // labelCode: '1384751691420293',
      labelCode: LotteryLabel.lotteryInLott.labelCode,
      labelName: "in_lott",
      icon: R.lotteryInLott,
      image: '',
      menuIcon: R.lotteryMenuInLott,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384752445117061',
      labelCode: LotteryLabel.lotteryPkTen.labelCode,
      labelName: "pk_ten",
      icon: R.lotteryPkTen,
      image: '',
      menuIcon: R.lotteryMenuPkTen,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384753443443333',
      labelCode: LotteryLabel.lotterySsc.labelCode,
      labelName: "ssc",
      icon: R.lotterySsc,
      image: '',
      menuIcon: R.lotteryMenuSsc,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384754031301253',
      labelCode: LotteryLabel.lotteryLotto.labelCode,
      labelName: "lotto",
      icon: R.lotteryLotto,
      image: '',
      menuIcon: R.lotteryMenuLotto,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384757409321605',
      labelCode: LotteryLabel.lotteryEleFive.labelCode,
      labelName: "ele_five",
      icon: R.lotteryEleFive,
      image: '',
      menuIcon: R.lotteryMenuEleFive,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384757928350341',
      labelCode: LotteryLabel.lotteryKThree.labelCode,
      labelName: "k_three",
      icon: R.lotteryKThree,
      image: '',
      menuIcon: R.lotteryMenuKThree,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384759301673605',
      labelCode: LotteryLabel.lotteryThreed.labelCode,
      labelName: "threed",
      icon: R.lotteryThreed,
      image: '',
      menuIcon: R.lotteryMenuThreed,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384759752430213',
      labelCode: LotteryLabel.lotteryKeno.labelCode,
      labelName: "keno",
      icon: R.lotteryKeno,
      image: '',
      menuIcon: R.lotteryMenuKeno,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384760671752837',
      labelCode: LotteryLabel.lotteryShuanseqiu.labelCode,
      labelName: "shuanseqiu",
      icon: R.lotteryShuanseqiu,
      image: '',
      menuIcon: R.lotteryMenuShuanseqiu,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384761298473605',
      labelCode: LotteryLabel.lotteryWanzifour.labelCode,
      labelName: "wanzifour",
      icon: R.lotteryWanzifour,
      image: '',
      menuIcon: R.lotteryMenuWanzifour,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384430765885445',
      labelCode: LotteryLabel.lotteryVnc.labelCode,
      labelName: "vnc",
      icon: R.lotteryVnc,
      image: '',
      menuIcon: R.lotteryMenuVnc,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384431996389381',
      labelCode: LotteryLabel.lotteryShaibao.labelCode,
      labelName: "shaibao",
      icon: R.lotteryShaibao,
      image: '',
      menuIcon: R.lotteryMenuShaibao,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384764990001797',
      labelCode: LotteryLabel.lotteryLeagueLegends.labelCode,
      labelName: "league_legends",
      icon: R.lotteryLeagueLegends,
      image: '',
      menuIcon: R.lotteryMenuLeagueLegends,
    ),
    GamingGameListByLabelModel(
      // labelCode: '1384765577286277',
      labelCode: LotteryLabel.lotteryDipin.labelCode,
      labelName: "dipin",
      icon: R.lotteryDipin,
      image: '',
      menuIcon: R.lotteryMenuDipin,
    ),
  ];
}

/// 提供不同商户id对应的彩票数据
/// 1对应模版1的SIT、UAT、PRO
/// 18对应模版2的PRO 21对应模版2的SIT
/// 20 28对应模版5的 PRO和SIT
enum LotteryLabel {
  /// 即开彩
  lotteryInLott(code: {
    "1": "1384751691420293",
    "18": "18142",
    "20": "20142",
    "28": "28064",
    "21": "21062"
  }),

  /// Pk十
  lotteryPkTen(code: {
    "1": "1384752445117061",
    "18": "18203",
    "20": "20203",
    "28": "28137",
    "21": "21135"
  }),

  /// 时时彩
  lotterySsc(code: {
    "1": "1384753443443333",
    "18": "18204",
    "20": "20204",
    "28": "28065",
    "21": "21063"
  }),

  /// 六合彩
  lotteryLotto(code: {
    "1": "1384754031301253",
    "18": "18173",
    "20": "20173",
    "28": "28138",
    "21": "21136"
  }),

  /// 11选5
  lotteryEleFive(code: {
    "1": "1384757409321605",
    "18": "18205",
    "20": "20205",
    "28": "28066",
    "21": "21064"
  }),

  /// 快3
  lotteryKThree(code: {
    "1": "1384757928350341",
    "18": "18174",
    "20": "20174",
    "28": "28140",
    "21": "21138"
  }),

  /// 3d
  lotteryThreed(code: {
    "1": "1384759301673605",
    "18": "18206",
    "20": "20206",
    "28": "28067",
    "21": "21065"
  }),

  /// 快乐彩
  lotteryKeno(code: {
    "1": "1384759752430213",
    "18": "18175",
    "20": "20175",
    "28": "28068",
    "21": "21066"
  }),

  /// 双色球
  lotteryShuanseqiu(code: {
    "1": "1384760671752837",
    "18": "18207",
    "20": "20207",
    "28": "28141",
    "21": "21139"
  }),

  /// 万字4D
  lotteryWanzifour(code: {
    "1": "1384761298473605",
    "18": "18176",
    "20": "20176",
    "28": "28069",
    "21": "21067"
  }),

  /// 越南彩
  lotteryVnc(code: {
    "1": "1384430765885445",
    "18": "18209",
    "20": "20209",
    "28": "28070",
    "21": "21068"
  }),

  /// 骰宝
  lotteryShaibao(code: {
    "1": "1384431996389381",
    "18": "18178",
    "20": "20178",
    "28": "28142",
    "21": "21140"
  }),

  /// 英雄联盟
  lotteryLeagueLegends(code: {
    "1": "1384764990001797",
    "18": "18208",
    "20": "20208",
    "28": "28071",
    "21": "21069"
  }),

  /// 低频彩
  lotteryDipin(code: {
    "1": "1384765577286277",
    "18": "18177",
    "20": "20177",
    "28": "28144",
    "21": "21142"
  });

  const LotteryLabel({required this.code});

  final Map<String, String> code;

  String get labelCode {
    return code[Config.tenantId] ?? code.values.first;
  }
}
