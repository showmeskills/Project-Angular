import 'package:gogaming_app/common/api/kyc/kyc.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/service/event_service.dart';
import '../../config/user_setting.dart';

class AliveVerifyLogic extends BaseController {
  final redirectUrl = ''.obs;

  @override
  void onInit() {
    _requestAliveVerifyUrl().doOnData((event) {
      redirectUrl.value = event.data ?? '';
    }).listen((event) {}, onError: (Object e) {
      // 获取授权地址失败
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('failed'),
        message: e.toString(),
      );
    });

    GamingEvent.signalrOnLiveCheck.subscribe(_onLiveCheck);
    super.onInit();
  }

  void _onLiveCheck(Map<String, dynamic> data) {
    final res = data['res'] as Map<String, dynamic>;
    final isSuccess = res['status'] == 2;
    if (isSuccess) {
      Toast.showSuccessful(localized("face_varify_success"));
    }
  }

  Stream<GoGamingResponse<String?>> _requestAliveVerifyUrl() {
    return PGSpi(Kyc.getLiveCheckConnect
            .toTarget(inputData: {'locale': UserSetting.sharedInstance.lang}))
        .rxRequest<String?>((value) {
      final data = value['data'];
      if (data is Map) {
        return data['redirectUrl'] as String;
      } else {
        return null;
      }
    });
  }
}
