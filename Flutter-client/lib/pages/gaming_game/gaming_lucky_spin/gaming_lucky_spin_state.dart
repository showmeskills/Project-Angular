part of 'gaming_lucky_spin_logic.dart';

class GamingLuckySpinState {
  GameLuckySpinInformationModel? gameLuckySpinInformationModel;
  late final _informationModel = gameLuckySpinInformationModel.obs;
  GameLuckySpinInformationModel? get informationModel =>
      _informationModel.value;

  GameLuckySpinGapModel? gameLuckySpinGapModel;
  late final _gapModel = gameLuckySpinGapModel.obs;
  GameLuckySpinGapModel? get gapModel => _gapModel.value;

  GameLuckySpinResultModel? gameLuckySpinResultModel;
  late final _resultModel = gameLuckySpinResultModel.obs;
  GameLuckySpinResultModel? get resultModel => _resultModel.value;

  // 是否已加载
  RxBool isLoadMusic = false.obs;

  /// 最终匹配的抽奖结果
  Prizeinfos? prizeInfo;
  late final _resultPrize = prizeInfo.obs;
  Prizeinfos? get resultPrize => _resultPrize.value;

  // 原创游戏
  GameLabelProviderModel? oriGame;
  RxDouble height = 631.dp.obs;
  RxBool isLogin = true.obs;
  // 加载游戏信息
  RxBool isLoading = false.obs;
  // 正在抽奖
  RxBool isRun = false.obs;
  // 1 最开始的模式 2，转动过程 3，结果页
  RxInt curMode = 1.obs;
  String baseCurrency = 'USDT';
}
