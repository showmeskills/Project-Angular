part of 'game_stats_logic.dart';

class GameStatsState {
  /// 我的投注
  final myBet = <RealTimeBetInfoModel>[];

  /// 所有投注
  final allBet = <RealTimeBetInfoModel>[];

  /// 风云榜
  final heroBet = <RealTimeBetInfoModel>[];

  /// 最幸运
  final luckiestBet = <RealTimeBetInfoModel>[];
  final globalKey = GlobalKey<AnimatedListState>();
  
  List<RealTimeBetInfoModel> get currentBet {
    if (bettingTitle.value == "my_bet") {
      return myBet;
    } else if (bettingTitle.value == "all_bet") {
      return allBet;
    } else if (bettingTitle.value == "windy_list") {
      return heroBet;
    } else if (bettingTitle.value == "luckiest") {
      return luckiestBet;
    } else {
      return allBet;
    }
  }

  final RxList<GamingDailyContestModel> _dailyContests =
      <GamingDailyContestModel>[].obs;
  List<GamingDailyContestModel> get dailyContests => _dailyContests;

  late final RxList<String> _bettingList = _getBettingList().obs;
  List<String> get bettingList => _bettingList;

  /// 投注选项选中标题
  late final bettingTitle = _getBettingTitle().obs;

  String _getBettingTitle() {
    if (AccountService.sharedInstance.isLogin) {
      return "my_bet";
    } else {
      return "all_bet";
    }
  }

  List<String> _getBettingList() {
    List<String> list = [];
    if (AccountService.sharedInstance.isLogin) {
      list = <String>[
        "my_bet",
        "all_bet",
        "windy_list",
        "luckiest",
      ];
    } else {
      list = <String>["all_bet", "windy_list", "luckiest"];
    }
    if (dailyContests.isNotEmpty) {
      list.add('race_text');
    }
    return list;
  }

  final currentContest = GamingDailyContestModel().obs;
  RxBool isRankDataLoading = false.obs;

  final RxList<GamingContestBonusInfo> _contestRankList =
      <GamingContestBonusInfo>[].obs;
  List<GamingContestBonusInfo> get contestRankList => _contestRankList;

  void initBetTitle() {
    _bettingList.assignAll(_getBettingList());
    bettingTitle.value = _getBettingTitle();
    myBet.clear();
  }

  void updateDialyContest(
      Map<List<GamingDailyContestModel>, List<GamingContestBonusInfo>> event) {
    _dailyContests.value = event.keys.first;
    _contestRankList.value = event.values.first;
    currentContest.value = _dailyContests.first;
    if (dailyContests.isNotEmpty && !_bettingList.contains('race_text')) {
      _bettingList.add('race_text');
    }
  }
}
