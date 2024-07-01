// ignore_for_file: invalid_use_of_protected_member
part of 'lottery_home_logic.dart';

class LotteryHomeState {
  late TabController tabController;

  final _allKey = GamingGameListByLabelModel(
    labelCode: '',
    labelName: 'all',
    icon: R.lotteryAll,
    image: '',
    menuIcon: R.lotteryAll,
  );

  final RxList<GamingBannerModel> _banner = <GamingBannerModel>[].obs;
  List<GamingBannerModel> get banner => _banner.value;

  final RxList<GamingGameListByLabelModel> _hall =
      <GamingGameListByLabelModel>[].obs;
  List<GamingGameListByLabelModel> get hall => _hall;

  final RxList<GamingGameListByLabelModel> _hallTab =
      Config.sharedInstance.gameConfig.lotteryList.obs;
  List<GamingGameListByLabelModel> get hallTab {
    return List.from(_hallTab.value)..insert(0, _allKey);
  }

  final index = 0.obs;

  GamingGameListByLabelModel get currentLabel {
    assert(index.value > 0, '全部tab不支持使用该字段');
    return hallTab.elementAt(index.value);
  }

  final loadSuccess = false.obs;
}
