import 'dart:ui';

import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/game_order/game_order_api.dart';
import 'package:gogaming_app/common/api/game_order/models/casino_order_detail.dart';
import 'package:gogaming_app/common/api/game_order/models/chess_order_detail.dart';
import 'package:gogaming_app/common/api/game_order/models/lottery_order_detail.dart';
import 'package:gogaming_app/common/api/game_order/models/sport_order_detail.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_wager_status_selector.dart';
import 'package:gogaming_app/pages/home/views/home_swiper.dart';

import 'models/game_order_detail_interface.dart';
import 'models/game_order_detail_layout.dart';

class GameOrderDetailLogic extends GetxController {
  GameOrderDetailLogic(this.wagerNumber, this.gameType, this.statusSelector);

  /// 游戏订单编号
  final String wagerNumber;

  /// 游戏类型
  final GameType gameType;
  final GamingWagerStatusSelector statusSelector;

  /// 加载数据中
  final isLoading = false.obs;

  /// 交易单号
  GameOrderDetailValueLayout? transactionNumberValueLayout;

  /// 游戏类型
  GameOrderDetailValueLayout? gameTypeValueLayout;

  /// 场馆
  GameOrderDetailValueLayout? venueValueLayout;

  // 串单列表
  List<GameOrderDetailBunchLayout> bunchList = [];

  // 其他值的列表
  List<GameOrderDetailValueLayout> otherValueLayout = [];

  /// 当前选中的注单
  final selectedBunchIndex = 0.obs;
  HomeSwiperController? swiperController;
  Size? itemSize;

  /// 数据详情
  GameOrderDetailInterface? detailModel;
  List<GameOrderDetailInterface> listDetail = [];

  @override
  void onReady() {
    super.onReady();
    loadData();
  }

  void loadData() {
    isLoading.value = true;
    Stream<dynamic> request;
    if (GameType.lottery == gameType) {
      request = getLotteryDetail();
    } else if (GameType.chess == gameType) {
      request = getChessDetail();
    } else if (GameType.sportsBook == gameType) {
      request = getSportDetail();
    } else if (GameType.casino == gameType) {
      request = getCasinoDetail();
    } else {
      request = Stream.error(0);
    }
    request.listen((event) {
      isLoading.value = false;
      if (event is List<GameOrderDetailInterface>) {
        for (var element in event) {
          element.getStatusText = statusSelector.getStatusText;
        }
        listDetail = event;
        // listDetail = List<GameOrderDetailInterface>.generate(10, (index) {
        //   return event[index % event.length];
        // });
      } else if (event is GameOrderDetailInterface) {
        event.getStatusText = statusSelector.getStatusText;
        detailModel = event;
      }
      _handleViewData();
      update();
    }, onError: (e) {
      isLoading.value = false;
    });
  }

  /// 根据数据生存对应布局数据
  void _handleViewData() {
    GameOrderDetailInterface? model = detailModel;
    final hasBunch = listDetail.isNotEmpty;
    if (hasBunch) {
      model = listDetail.first;
    }
    if (model == null) return;

    transactionNumberValueLayout = GameOrderDetailValueLayout(
      name: 'transaction_num',
      value: wagerNumber,
    );

    gameTypeValueLayout = GameOrderDetailValueLayout(
      name: "game_type",
      value: model.gameCategory ?? '-',
    );
    venueValueLayout = GameOrderDetailValueLayout(
      name: "venue",
      value: model.gameProvider ?? '-',
    );

    otherValueLayout.clear();
    bunchList.clear();

    otherValueLayout = model.otherValueLayout;

    if (hasBunch) {
      int bunchCount = listDetail.length;
      setupSwiperController(bunchCount);
      for (int i = 0; i < bunchCount; i++) {
        final valueLayouts = listDetail[i].bunchLayouts(bunchCount == 1);
        bunchList.add(
            GameOrderDetailBunchLayout(index: i, valueLayouts: valueLayouts));
      }
    }
  }

  void setupSwiperController(int bunchCount) {
    swiperController?.dispose();
    swiperController = HomeSwiperController(
      total: bunchCount,
      mainAxisCount: 4,
    );
  }

  void swiperScrollEnd() {
    final pageIndex = swiperController?.offset ?? 0.0;
    final itemWidth = itemSize?.width ?? 67;
    selectedBunchIndex.value = pageIndex ~/ itemWidth;
  }

  Stream<LotteryOrderDetail> getLotteryDetail() {
    return PGSpi(GameOrder.getLotteryDetail
            .toTarget(input: {'wagerNumber': wagerNumber}))
        .rxRequest<LotteryOrderDetail>((p0) =>
            LotteryOrderDetail.fromJson(p0['data'] as Map<String, dynamic>))
        .map((event) => event.data);
  }

  Stream<List<SportOrderDetail>> getSportDetail() {
    return PGSpi(GameOrder.getSportDetail
            .toTarget(input: {'wagerNumber': wagerNumber}))
        .rxRequest<List<SportOrderDetail>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) =>
                SportOrderDetail.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    }).map((event) => event.data);
  }

  Stream<ChessOrderDetail> getChessDetail() {
    return PGSpi(GameOrder.getChessDetail
            .toTarget(input: {'wagerNumber': wagerNumber}))
        .rxRequest<ChessOrderDetail>((res) => ChessOrderDetail.fromJson(
            Map<String, dynamic>.from(res['data'] as Map)))
        .map((event) => event.data);
  }

  Stream<CasinoOrderDetail> getCasinoDetail() {
    return PGSpi(GameOrder.getCasinoDetail
            .toTarget(input: {'wagerNumber': wagerNumber}))
        .rxRequest<CasinoOrderDetail>((p0) =>
            CasinoOrderDetail.fromJson(p0['data'] as Map<String, dynamic>))
        .map((event) => event.data);
  }

  @override
  void onClose() {
    super.onClose();
    swiperController?.dispose();
  }
}
