enum MenuItemModelType {
  // 没找到
  none,
  // 老虎机
  slot,
  // 真人娱乐场
  liveCasino,
  // 游戏节目
  gameShow,
  // 新游戏
  newGame,
  // 可购买奖励回合
  buyRewardRound,
  // 桌面游戏
  desktopGame,
  // 21点
  blackjack,
  // 百家乐
  baccarat,
  // 轮盘
  roulette,
  // 即开彩
  instantLottery,
  // 快3
  fast3,
  // 快乐彩
  happyLottery,
  // PK拾
  pk10,
  // 世界乐透
  worldLottery,
  // 时时彩
  timeLottery,
  // 越南彩
  vietnamLottery,
  // 11选5
  elevenFive,
  // 双色球
  doubleColorBall,
  // 3D
  threeD,
  // 幸运飞艇
  luckyAirship,
  // 低频彩
  lowFrequencyLottery,
}

class GameCategory {
  static MenuItemModelType modelType(int? id) {
    switch (id) {
      case 1152547066396741:
        return MenuItemModelType.slot;
      case 1152546635268165:
        return MenuItemModelType.liveCasino;
      case 1152546797191237:
        return MenuItemModelType.gameShow;
      case 1152546721431621:
        return MenuItemModelType.newGame;
      case 1152546874916933:
        return MenuItemModelType.buyRewardRound;
      case 1152547358179397:
        return MenuItemModelType.desktopGame;
      case 1152545832239173:
        return MenuItemModelType.blackjack;
      case 1152545906786373:
        return MenuItemModelType.baccarat;
      case 1152545762148421:
        return MenuItemModelType.roulette;
      case 1384751691420293:
        return MenuItemModelType.instantLottery;
      case 1384757928350341:
      case 1457454164149893:
      case 1457454164657797:
      case 1457454165132933:
      case 1457454166066821:
      case 1521836699846725:
        return MenuItemModelType.fast3;
      case 1384759752430213:
      case 1457454166607493:
      case 1457454168147589:
      case 1384884984730245:
        return MenuItemModelType.happyLottery;
      case 1384884979733125:
      case 1384752445117061:
      case 1521836698978373:
      case 1486429636645957:
      case 1486429640201285:
      case 1457451566106245:
      case 1457451567040133:
        return MenuItemModelType.pk10;
      case 1384753443443333:
      case 1457451550213765:
      case 1457451551819397:
      case 1457451553228421:
      case 1486429648557125:
      case 1457451556472453:
      case 1457451556931205:
        return MenuItemModelType.timeLottery;
      case 1384430765885445:
      case 1457454172194437:
      case 1457454172718725:
      case 1457454173324933:
      case 1457454173783685:
      case 1457454174258821:
      case 1457454175192709:
      case 1457454175569541:
      case 1457454175995525:
      case 1457454176437893:
      case 1457454176847493:
      case 1457454177273477:
      case 1457454177715845:
      case 1457454178141829:
      case 1457454178567813:
      case 1457454178977413:
        return MenuItemModelType.vietnamLottery;
      case 1384884980437637:
      case 1384757409321605:
      case 1457451559126661:
      case 1457451559601797:
      case 1457451560027781:
      case 1457451560470149:
      case 1384884985680517:
      case 1384884977586821:
        return MenuItemModelType.elevenFive;
      case 1384760671752837:
      case 1384884972294789:
      case 1384884971999877:
        return MenuItemModelType.doubleColorBall;
      case 1457451560928901:
      case 1457451562649221:
      case 1457451563091589:
      case 1384884961940101:
      case 1384759301673605:
        return MenuItemModelType.threeD;
      case 1384884978471557:
      case 1384884967985797:
        return MenuItemModelType.luckyAirship;
      case 1384765577286277:
        return MenuItemModelType.lowFrequencyLottery;
      default:
        return MenuItemModelType.none;
    }
  }

  static int typeNumForTracker(MenuItemModelType type) {
    switch (type) {
      // 没找到
      case MenuItemModelType.none:
        return 0;
      // 老虎机
      case MenuItemModelType.slot:
        return 1;
      case MenuItemModelType.liveCasino:
        return 2;
      case MenuItemModelType.gameShow:
        return 3;
      case MenuItemModelType.newGame:
        return 4;
      case MenuItemModelType.buyRewardRound:
        return 5;
      case MenuItemModelType.desktopGame:
        return 6;
      case MenuItemModelType.blackjack:
        return 7;
      case MenuItemModelType.baccarat:
        return 8;
      case MenuItemModelType.roulette:
        return 9;
      case MenuItemModelType.instantLottery:
        return 11;
      case MenuItemModelType.fast3:
        return 22;
      case MenuItemModelType.happyLottery:
        return 33;
      case MenuItemModelType.pk10:
        return 44;
      case MenuItemModelType.worldLottery:
        return 55;
      case MenuItemModelType.timeLottery:
        return 66;
      case MenuItemModelType.vietnamLottery:
        return 77;
      case MenuItemModelType.elevenFive:
        return 88;
      case MenuItemModelType.doubleColorBall:
        return 99;
      case MenuItemModelType.threeD:
        return 100;
      case MenuItemModelType.luckyAirship:
        return 110;
      case MenuItemModelType.lowFrequencyLottery:
        return 120;
      default:
        return 0;
    }
  }

  static int typeNumForTrackerWithId(int? id) {
    MenuItemModelType type = modelType(id);
    return typeNumForTracker(type);
  }
}
