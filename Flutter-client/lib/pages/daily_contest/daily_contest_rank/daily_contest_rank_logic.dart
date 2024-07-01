import 'dart:async';

import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../../common/api/bonus/models/gaming_daily_contest_model/gaming_contest_rank_model.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import '../../../common/api/bonus/models/gaming_daily_contest_model/gaming_daily_contest_model.dart';
import '../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import 'daily_contest_rank_state.dart';

class DailyContestRankLogic extends BaseController {
  final DailyContestRankState state = DailyContestRankState();

  Timer? timer;

  @override
  void onReady() {
    SmartDialog.showLoading<void>();
    _loadContestRankInfo().doOnData((event) {
      SmartDialog.dismiss<void>();
      if (event != null) {
        state.rankModel.value = event;
        _timeCountDown();
      }
    }).doOnError((error, p1) {
      SmartDialog.dismiss<void>();
      if (error is GoGamingResponse) {
        Toast.showFailed(error.message);
      } else {
        Toast.showTryLater();
      }
    }).listen((event) {});
    super.onReady();
  }

  @override
  void dispose() {
    _stopTimer();
    super.dispose();
  }

  void _startTimer(int lastTime) {
    timer = Timer.periodic(const Duration(seconds: 1), (object) {
      int tempTime = lastTime;
      if (tempTime > 60 * 60 * 24) {
        state.day.value = '${tempTime ~/ (60 * 60 * 24)}';
        tempTime = tempTime - (int.parse(state.day.value) * 60 * 60 * 24);
      }
      if (tempTime > 60 * 60) {
        state.hours.value = '${tempTime ~/ (60 * 60)}';
        tempTime = tempTime - (int.parse(state.hours.value) * 60 * 60);
      }
      if (tempTime > 60) {
        state.minutes.value = '${tempTime ~/ 60}';
        tempTime = tempTime - (int.parse(state.minutes.value) * 60);
      }
      state.second.value = '$tempTime';
      lastTime -= 1;
      if (lastTime == 0) {
        _stopTimer();
      }
    });
  }

  void _timeCountDown() {
    final lastTime =
        (state.rankModel.value.endTime - state.rankModel.value.nowTime) / 1000;
    if (lastTime > 0) {
      _startTimer(lastTime.toInt());
    }
  }

  void _stopTimer() {
    if (timer != null) {
      timer!.cancel();
      timer = null;
    }
  }

  Stream<GamingContestRankModel?> _loadContestRankInfo() {
    return PGSpi(Bonus.getContestActivities.toTarget())
        .rxRequest<List<GamingDailyContestModel>?>((value) {
      try {
        final data = value['data']['title'];
        if (data is List) {
          return data
              .map((e) => GamingDailyContestModel.fromJson(
                  Map<String, dynamic>.from(e as Map)))
              .toList();
        } else {
          return null;
        }
      } catch (e) {
        return null;
      }
    }).flatMap((resp) {
      /// 过滤所有标题名为 unknown 的活动
      final respList =
          resp.data?.where((element) => element.title != 'unknown').toList() ??
              [];
      if (respList.isEmpty) {
        return Stream.value(null);
      }

      /// getRankById 接口要求登录
      /// 没有登录直接使用已有数据构建 model 返回
      if (!AccountService.sharedInstance.isLogin) {
        return Stream.value(
          GamingContestRankModel(
            title: respList.first.title,
            activitiesNo: respList.first.activitiesNo,
            period: respList.first.period,
            endTime: respList.first.endTime,
            nowTime: respList.first.nowTime,
          ),
        );
      }

      return PGSpi(Bonus.getRankById.toTarget(
        input: {
          'activitiesNo': respList.first.activitiesNo,
        },
      )).rxRequest<GamingContestRankModel?>((value) {
        final map = value['data'];
        if (map is Map<String, dynamic>) {
          return GamingContestRankModel.fromJson(map);
        } else {
          return null;
        }
      }).flatMap((value) {
        return Stream.value(value.data);
      });
    });
  }
}
