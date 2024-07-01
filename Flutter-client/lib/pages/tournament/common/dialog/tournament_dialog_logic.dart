import 'package:gogaming_app/common/api/activity/activity_api.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_model.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

part 'tournament_dialog_state.dart';

class TournamentDialogLogic extends GetxController
    with SingleRenderControllerMixin {
  final String providerId;
  final String category;
  final String gameId;
  final RxList<TournamentModel> list;

  final state = TournamentDialogState();

  TournamentDialogLogic({
    required this.list,
    required this.providerId,
    required this.category,
    required this.gameId,
  }) {
    state._list = list;
  }

  late final SingleRenderViewController _controller =
      SingleRenderViewController(
    autoLoadData: list.isEmpty,
    initialState:
        list.isNotEmpty ? RenderState.successful : RenderState.loading,
  );
  @override
  SingleRenderViewController get controller => _controller;

  @override
  void Function()? get onLoadData => () {
        loadCompleted(state: LoadState.loading);
        Rx.combineLatestList([
          CurrencyService.sharedInstance.updateRate(),
          getTournamentRank(),
        ]).doOnData((event) {
          if (state.list.isEmpty) {
            loadCompleted(state: LoadState.empty);
          } else {
            loadCompleted(state: LoadState.successful);
          }
        }).doOnError((p0, p1) {
          loadCompleted(state: LoadState.failed);
          if (p0 is GoGamingResponse) {
            Toast.showFailed(p0.message);
          } else {
            Toast.showTryLater();
          }
        }).listen((event) {}, onError: (err) {});
      };

  Stream<List<TournamentModel>> getTournamentRank() {
    return PGSpi(Activity.getNewRankResult.toTarget(inputData: {
      'current': 1,
      'size': 10,
      'gameTypeDto': {
        'gameCode': gameId,
        'gameCategory': category,
        'gameProvider': providerId,
      },
    })).rxRequest((p0) {
      return (p0['data'] as List<dynamic>?)
              ?.map((e) => TournamentModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      state._list.value = event
        ..removeWhere((element) => element.status != TournamentStatus.ongoing);
    });
  }
}
