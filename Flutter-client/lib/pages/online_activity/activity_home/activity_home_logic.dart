import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_activity_model/gaming_activity_model.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/base/go_gaming_response.dart';
import '../../base/base_controller.dart';
import 'activity_home_state.dart';

class ActivityHomeLogic extends BaseController {
  final ActivityHomeState state = ActivityHomeState();
  List<GamingActivityModel> allDatas = <GamingActivityModel>[];

  @override
  void onInit() {
    requestData();
    GamingDataCollection.sharedInstance
        .startTimeEvent(TrackEvent.visitPromotion);
    super.onInit();
  }

  void requestData() {
    _onLoadDataStream().listen((event) {});
  }

  void pressActivity(GamingActivityModel model) {
    Get.toNamed<void>(Routes.activityDetail.route, arguments: {
      'activitiesNo': model.activitiesNo,
    });
  }

  void pressSelectLabelName(String labelName) {
    state.selectLabelName.value = labelName;

    if (labelName == localized("all")) {
      state.data.assignAll(allDatas);
    } else {
      state.data.assignAll(
        allDatas.where((element) => element.labelName == labelName),
      );
    }
  }

  Stream<void> _onLoadDataStream() {
    showLoading();
    state.isLoading.value = true;
    return PGSpi(Bonus.activityInfo.toTarget(
      input: {'equipment': 'Web'},
    )).rxRequest<List<GamingActivityModel>>((value) {
      List<String> labelNames = <String>[];
      labelNames.add(localized("all"));
      List<GamingActivityModel> datas = <GamingActivityModel>[];
      final isList = value['data'] is Map && value['data']['list'] is List;
      if (!isList) return [];

      (value['data']['list'] as List<dynamic>?)?.forEach((element) {
        labelNames.add(element['labelName'] as String);
        (element['list'] as List<dynamic>?)?.forEach((e) {
          datas.add(GamingActivityModel.fromJson(e as Map<String, dynamic>));
        });
      });

      datas.sort((a, b) => (a.sort).compareTo(b.sort));
      state.labelNames.assignAll(labelNames);
      return datas;
    }).doOnData((event) {
      hideLoading();
      state.isLoading.value = false;
      allDatas.assignAll(event.data);
      state.data.assignAll(event.data);
    }).doOnError((err, p1) {
      hideLoading();
      state.isLoading.value = false;
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }
}
