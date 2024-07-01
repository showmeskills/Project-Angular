import 'dart:async';

import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_activity_detail_model.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/controller_header.dart';

import 'activity_detail_state.dart';

class ActivityDetailLogic extends BaseController
    with SingleRenderControllerMixin {
  final String activitiesNo;

  final ActivityDetailState state;

  ActivityDetailLogic(this.activitiesNo)
      : state = ActivityDetailState(activitiesNo);

  @override
  void Function()? get onLoadData => () {
        loadCompleted(state: LoadState.loading);
        PGSpi(Bonus.getActivityDetail.toTarget(input: {
          'bonusActivitiesNo': activitiesNo,
          'equipment': 'App',
        })).rxRequest<GamingActivityDetailModel>((value) {
          final result = GamingActivityDetailModel.fromJson(
              value['data'] as Map<String, dynamic>);
          state.labelCode = result.labelCode;
          return result;
        }).flatMap((value) {
          return _onLoadActivityBaseInfo(value.data);
        }).doOnDone(() {
          H5WebViewManager.sharedInstance.openWebView(
            url: state.webUrl,
            openWindowCallback: (id) {
              state.windowId.value = id;
              loadCompleted(state: LoadState.successful);
            },
          );
        }).doOnError((p0, p1) {
          loadCompleted(state: LoadState.failed);
        }).listen(
          (value) {},
          onError: (p0, p1) {},
        );
      };

  Stream<void> _onLoadActivityBaseInfo(GamingActivityDetailModel model) {
    if (model.labelCode != 'guessing') {
      return const Stream.empty();
    }
    return PGSpi(Bonus.getActivityBaseInfo.toTarget(
      input: {
        'activityCode': activitiesNo,
      },
    )).rxRequest<void>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic> && data['status'] is int) {
        final status = data['status'] as int;
        if (status == 1) {
          state.intoGuessingHome = true;
        }
      }
    });
  }
}
