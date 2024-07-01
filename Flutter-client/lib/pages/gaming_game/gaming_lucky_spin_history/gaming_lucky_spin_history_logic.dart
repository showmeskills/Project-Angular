import '../../../common/api/lucky_spin/models/game_lucky_spin_history_model.dart';
import 'package:gogaming_app/common/api/lucky_spin/lucky_spin_api.dart';
import '../../base/base_controller.dart';
import 'gaming_lucky_spin_history_state.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';

class GamingLuckySpinHistoryLogic extends BaseController {
  final GamingLuckySpinHistoryState state = GamingLuckySpinHistoryState();

  @override
  void onInit() {
    _loadHistoryData().doOnData((event) {
      state.dataList.assignAll(event);
    }).listen((event) {}, onError: (e) {});
    super.onInit();
  }

  Stream<List<GameLuckySpinHistoryModel>> _loadHistoryData() {
    Map<String, dynamic> req = {
      'startTime': 0,
      'endTime': DateTime.now().millisecondsSinceEpoch,
      'pageIndex': 1,
      'pageSize': 30,
    };

    return PGSpi(LuckySpinApi.getTurnTablePrizeHistory.toTarget(input: req))
        .rxRequest<List<GameLuckySpinHistoryModel>>((value) {
      return (value['data']['histories'] as List)
          .map((e) =>
              GameLuckySpinHistoryModel.fromJson(e as Map<String, dynamic>))
          .toList();
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }
}
