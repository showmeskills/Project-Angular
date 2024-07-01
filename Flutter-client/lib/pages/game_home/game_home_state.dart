// ignore_for_file: invalid_use_of_protected_member
part of 'game_home_logic.dart';

class GameHomeState {
  final _allKey = GamingGameListByLabelModel(
    labelCode: '',
    labelName: localized('lobby'),
    icon: R.gameGameLobby,
    image: '',
    menuIcon: R.gameGameLobby,
  );
  late TabController tabController;
  final RxList<GamingBannerModel> _banner = <GamingBannerModel>[].obs;
  List<GamingBannerModel> get banner => _banner.value;

  List<GamingGameProviderModel> get provider => GameService().provider;

  final index = 0.obs;

  final RxList<GamingGameListByLabelModel> _hall =
      <GamingGameListByLabelModel>[].obs;
  List<GamingGameListByLabelModel> get hall => _hall;

  final RxList<GamingGameListByLabelModel> _hallTab =
      <GamingGameListByLabelModel>[].obs;
  List<GamingGameListByLabelModel> get hallTab {
    return List.from(_hallTab.value)..insert(0, _allKey);
  }

  GamingGameListByLabelModel get currentLabel {
    assert(index.value > 0, '全部tab不支持使用该字段');
    return hallTab.elementAt(index.value);
  }

  final loadSuccess = false.obs;
}
