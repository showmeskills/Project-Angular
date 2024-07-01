import 'dart:async';

import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/activity/activity_api.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_model.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_rank_model.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/tournament/common/tournament_web_socket.dart';
import 'package:gogaming_app/pages/tournament/list/tournament_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part 'tournament_detail_state.dart';

class TournamentDetailLogic extends BaseController
    with SingleRenderControllerMixin {
  TournamentDetailLogic(this.tmpCode);
  final String tmpCode;

  final state = TournamentDetailState();

  late final TournamentWebSocket _webSocket = TournamentWebSocket(
    onRankLeaderboard: onRankLeaderboard,
    onSelfRank: onSelfRank,
  );

  Worker? worker;

  @override
  void onInit() {
    super.onInit();
    worker =
        ever(CurrencyService.sharedInstance.selectedCurrencyObs, (callback) {});
  }

  @override
  void onClose() {
    super.onClose();
    worker?.dispose();
    _webSocket.dispose();
  }

  @override
  void Function()? get onLoadData => () {
        loadCompleted(
          state: LoadState.loading,
        );
        Rx.combineLatestList([
          CurrencyService.sharedInstance.updateRate(),
          _getTournamentRank().doOnData((event) {
            state._data.value = event;
          }),
        ]).doOnData((event) {
          _webSocket.init(
            selfRankAddCondition: (value) {
              return value.tmpCode == tmpCode;
            },
            rankLeaderboardAddCondition: (value) {
              return value.tmpCode == tmpCode;
            },
          );
          checkCanJoin().listen((event) {}, onError: (err) {});

          loadCompleted(
            state: LoadState.successful,
          );
        }).doOnError((err, p1) {
          loadCompleted(
            state: LoadState.failed,
          );

          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else if (err is UnsupportedError) {
            DialogUtil(
              context: Get.overlayContext!,
              iconPath: R.commonDialogErrorBig,
              iconWidth: 80.dp,
              iconHeight: 80.dp,
              title: localized('hint'),
              content: localized('no_tournament_tips'),
              contentMaxLine: 3,
              leftBtnName: '',
              rightBtnName: localized('confirm_button'),
              onRightBtnPressed: () {
                Get.back<void>();
                Get.back<void>();
              },
            ).showNoticeDialogWithTwoButtons();
          } else {
            Toast.showTryLater();
          }
        }).listen((event) {}, onError: (Object? err) {});
      };

  Stream<TournamentModel> _getTournamentRank() {
    return PGSpi(Activity.getNewRankResult.toTarget(inputData: {
      'current': 1,
      'size': state.size,
      'tmpCodes': [tmpCode],
    })).rxRequest((p0) {
      final json = (p0['data'] as List<dynamic>).firstOrNull;
      if (json == null) {
        return null;
      } else {
        return TournamentModel.fromJson(json as Map<String, dynamic>);
      }
    }).flatMap((value) {
      if (value.data == null) {
        return Stream.error(UnsupportedError(''));
      }
      return Stream.value(value.data!);
    });
  }

  void onRankLeaderboard(List<TournamentRankModel> event) {
    final old = {
      for (TournamentRankModel e in state.data?.pageTable?.list ?? []) e.uid!: e
    };

    old.addAll({for (TournamentRankModel e in event) e.uid!: e});

    final list = old.values.toList()
      ..sort((a, b) => a.rankNumber!.compareTo(b.rankNumber!));

    state._data.value = state.data?.copyWith(
      pageTable: state.data?.pageTable?.copyWith(
        list: list,
        total: list.length,
      ),
    );
  }

  void onSelfRank(TournamentRankModel event) {
    state._data.value = state.data?.copyWith(
      currentUserRank: event,
    );
  }

  Stream<bool> checkCanJoin() {
    late Stream<bool> stream;
    if (!AccountService().isLogin) {
      stream = Stream.value(true);
    } else {
      if (state.data?.status != TournamentStatus.ongoing) {
        stream = Stream.value(false);
      } else {
        stream = PGSpi(Activity.newRankCheckApply.toTarget(inputData: {
          'tmpCodes': [tmpCode],
        })).rxRequest((p0) {
          final json = (p0['data'] as List<dynamic>).firstOrNull;
          if (json == null) {
            return false;
          } else {
            return json['canJoin'] as bool? ?? false;
          }
        }).flatMap((value) {
          return Stream.value(value.data);
        });
      }
    }

    return stream.doOnData((event) {
      state._data.value = state.data?.copyWith(
        uidCanJoin: event,
      );
    });
  }

  void apply(String tmpCode) {
    SmartDialog.showLoading<void>();
    PGSpi(Activity.newRankActivityApply.toTarget(inputData: {
      'tmpCode': tmpCode,
    })).rxRequest((p0) {
      return p0['data'] as bool;
    }).doOnData((event) {
      if (event.data) {
        Toast.showSuccessful(localized('resp'));
        state._data.value = state.data?.copyWith(
          uidCanJoin: false,
        );
        Get.findOrNull<TournamentLogic>()?.applySuccess(tmpCode);
      } else {
        Toast.showSuccessful(localized('resp_f'));
      }
    }).doOnError((p0, p1) {
      if (p0 is GoGamingResponse) {
        Toast.showFailed(p0.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (err) {});
  }

  void onCountdownEnd(TournamentModel data) {
    state._data.value = state.data?.copyWith(
      status: TournamentStatus.expired,
      uidCanJoin: false,
    );
  }

  void onCountdownStart(TournamentModel data) {
    state._data.value = state.data?.copyWith(
      status: TournamentStatus.ongoing,
    );
    checkCanJoin().listen((event) {}, onError: (err) {});
    setSize(state.size);
  }

  void setSize(int value) {
    state._size.value = value;
    state._rankLoading.value = true;
    _getTournamentRank().doOnData((event) {
      state._data.value = state.data?.copyWith(
        pageTable: event.pageTable,
        currentUserRank: event.currentUserRank,
      );
    }).doOnDone(() {
      state._rankLoading.value = false;
    }).listen((event) {}, onError: (Object? err) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }
}
