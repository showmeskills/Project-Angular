import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/activity/activity_api.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_list_model.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_model.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_rank_model.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/tournament/common/tournament_web_socket.dart';
import 'package:gogaming_app/widget_header.dart';

part 'tournament_state.dart';

class TournamentLogic extends BaseController with SingleRenderControllerMixin {
  final state = TournamentState();

  Worker? worker;

  late final TournamentWebSocket _webSocket = TournamentWebSocket(
    onRankLeaderboard: onRankLeaderboard,
    onSelfRank: onSelfRank,
  );

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
        _loadDataStream().listen(null, onError: (err) {});
      };

  Stream<void> _loadDataStream() {
    loadCompleted(
      state: LoadState.loading,
    );
    return Rx.combineLatestList([
      CurrencyService.sharedInstance.updateRate(),
      _getTournamentList(),
    ]).doOnData((event) {
      loadCompleted(
        state: LoadState.successful,
      );

      final codes =
          state.data.startList?.list.map((e) => e.tmpCode!).toList() ?? [];
      _webSocket.init(
        rankLeaderboardAddCondition: (value) {
          return codes.contains(value.tmpCode);
        },
        selfRankAddCondition: (value) {
          return codes.contains(value.tmpCode);
        },
      );
      if (event.isEmpty) {
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
      }
    }).doOnError((p0, p1) {
      loadCompleted(
        state: LoadState.failed,
      );
      if (p0 is GoGamingResponse) {
        Toast.showFailed(p0.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  Stream<TournamentListModel?> _getTournamentList() {
    return PGSpi(Activity.getNewRankList.toTarget(inputData: {
      'startDto': {
        'current': 1,
        'orderDirection': 'desc',
        'size': 999,
      },
      'endDto': {
        'current': 1,
        'orderDirection': 'desc',
        'size': 6,
      },
      'preDto': {
        'current': 1,
        'orderDirection': 'desc',
        'size': 4,
      },
    })).rxRequest((p0) {
      if (p0['data'] is Map) {
        return TournamentListModel.fromJson(p0['data'] as Map<String, dynamic>);
      }
      return null;
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      if (event != null) {
        state._data.value = event;
        _getRankingList().listen((event) {
          final map = {for (var element in event) (element).tmpCode!: element};
          state._data.value = state.data.copyWith(
            startList: state.data.startList?.copyWith(
              list: state.data.startList?.list.map((e) {
                return e.copyWith(
                  currentUserRank: map[e.tmpCode]?.currentUserRank,
                  pageTable: map[e.tmpCode]?.pageTable,
                );
              }).toList(),
            ),
          );
        }, onError: (p0) {});
      }
    });
  }

  Stream<List<TournamentModel>> _getRankingList() {
    final codes = state.data.startList?.list.map((e) => e.tmpCode).toList();
    if (codes?.isEmpty ?? true) {
      return Stream.value([]);
    }
    return PGSpi(Activity.getNewRankResult.toTarget(inputData: {
      'current': 1,
      'size': 5,
      'tmpCodes': codes,
    })).rxRequest((p0) {
      return (p0['data'] as List<dynamic>?)?.map((e) {
            return TournamentModel.fromJson(e as Map<String, dynamic>);
          }).toList() ??
          [];
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<TournamentModel> _getRanking(String tmpCode) {
    return PGSpi(Activity.getNewRankResult.toTarget(inputData: {
      'current': 1,
      'size': 5,
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
        return Stream.error('');
      }
      return Stream.value(value.data!);
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
        applySuccess(tmpCode);
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

  void applySuccess(String tmpCode) {
    final index =
        state.data.startList?.list.indexWhere((e) => e.tmpCode == tmpCode) ??
            -1;
    // 报名成功后将活动的uidCanJoin改为false，以隐藏报名按钮
    if (index != -1) {
      final value = state.data.startList!.list[index];
      state._data.value = state.data.copyWith(
        startList: state.data.startList?.copyWith(
          list: state.data.startList?.list
            ?..replaceRange(
              index,
              index + 1,
              [value.copyWith(uidCanJoin: false)],
            ),
        ),
      );
    }
  }

  void _refreshRanking(int index) {
    final oldValue = state.data.startList?.list[index];
    if (oldValue != null) {
      _getRanking(oldValue.tmpCode!).doOnData((event2) {
        state._data.value = state.data.copyWith(
          startList: state.data.startList?.copyWith(
            list: state.data.startList?.list
              ?..replaceRange(index, index + 1, [
                oldValue.copyWith(
                  currentUserRank: event2.currentUserRank,
                  pageTable: event2.pageTable,
                )
              ]),
          ),
        );
      }).listen(null, onError: (err) {});
    }
  }

  /// 当活动开始时，将活动从预告列表移除，添加到进行中列表
  void onCountdownStart(TournamentModel value) {
    final index = state.data.preList?.list
            .indexWhere((e) => e.tmpCode == value.tmpCode) ??
        -1;
    if (index == -1) {
      return;
    }
    state._data.value = state.data.copyWith(
      preList: state.data.preList?..removeAt(index),
      startList: state.data.startList?.insert(
          0,
          value.copyWith(
            status: TournamentStatus.ongoing,
            uidCanJoin: true,
          )),
    );
    _refreshRanking(0);
  }

  /// 当活动结束时，将活动从进行中列表移除，添加到已结束列表
  void onCountdownEnd(TournamentModel value) {
    final index = state.data.startList?.list
            .indexWhere((e) => e.tmpCode == value.tmpCode) ??
        -1;
    if (index == -1) {
      return;
    }
    state._data.value = state.data.copyWith(
      startList: state.data.startList?.removeAt(index),
      endList: state.data.endList?.insert(
          0,
          value.copyWith(
            status: TournamentStatus.expired,
            uidCanJoin: false,
          )),
    );
  }

  void onRankLeaderboard(List<TournamentRankModel> event) {
    final old = {
      for (var e in state.data.startList?.list ?? <TournamentModel>[])
        e.tmpCode!: <String, TournamentRankModel>{
          for (var e2 in e.pageTable?.list ?? <TournamentRankModel>[])
            e2.uid!: e2
        }
    };

    for (var element in event) {
      if (old.containsKey(element.tmpCode)) {
        old[element.tmpCode!]?.addAll({
          element.uid!: element,
        });
      }
    }

    state._data.value = state.data.copyWith(
      startList: state.data.startList?.copyWith(
        list: state.data.startList?.list.map((e) {
          final list = (old[e.tmpCode!]?.values.toList() ?? [])
            ..sort((a, b) => a.rankNumber!.compareTo(b.rankNumber!));
          return e.copyWith(
            pageTable: e.pageTable?.copyWith(
              list: list,
              total: list.length,
            ),
          );
        }).toList(),
      ),
    );
  }

  void onSelfRank(TournamentRankModel event) {
    final old = {
      for (TournamentModel e
          in state.data.startList?.list ?? <TournamentModel>[])
        e.tmpCode!: e.currentUserRank
    };

    if (old.containsKey(event.tmpCode)) {
      old[event.tmpCode!] = event;
    }

    state._data.value = state.data.copyWith(
      startList: state.data.startList?.copyWith(
        list: state.data.startList?.list.map((e) {
          return e.copyWith(
            currentUserRank: old[e.tmpCode!],
          );
        }).toList(),
      ),
    );
  }
}
