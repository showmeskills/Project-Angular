import 'package:gogaming_app/common/api/account/models/gaming_preference_model.dart';
import 'package:gogaming_app/common/api/invisibility_mode/invisibility_mode_api.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import '../../../common/api/base/base_api.dart';

class GamingPreferenceInvisibilityModeLogic extends BaseController {
  GamingPreferenceModel? userSetting;

  RxString invisibilityMode = ''.obs;

  List<String> allMode = [
    'ShowUserName',
    'ShowUid',
    'Invisibility',
  ];

  List<String> allModeStr = [
    'show_username',
    'show_uid',
    'fully_invisible',
  ];

  @override
  void onInit() {
    super.onInit();
    _loadCurMode();
  }

  void _loadCurMode() {
    userSetting = AccountService.sharedInstance.userSetting;
    invisibilityMode.value = userSetting?.invisibilityMode ?? '';
  }

  bool isCurMode(String str) {
    if (invisibilityMode.value == allMode[0] && str == allModeStr[0]) {
      return true;
    }

    if (invisibilityMode.value == allMode[1] && str == allModeStr[1]) {
      return true;
    }

    if (invisibilityMode.value == allMode[2] && str == allModeStr[2]) {
      return true;
    }
    return false;
  }

  void setMode(String str) {
    if (str == allModeStr[0]) {
      invisibilityMode.value = allMode[0];
    } else if (str == allModeStr[1]) {
      invisibilityMode.value = allMode[1];
    } else if (str == allModeStr[2]) {
      invisibilityMode.value = allMode[2];
    }
  }

  void save() {
    PGSpi(Invisibility.modifyInvisibilityMode.toTarget(
      inputData: {'invisibilityMode': invisibilityMode.value},
    )).rxRequest<bool?>((value) {
      final data = value['data'];
      if (data is bool) {
        return data;
      } else {
        return null;
      }
    }).listen((value) {
      if (value.success) {
        AccountService.sharedInstance.updateGamingUserInfo().listen((event) {
          GamingEvent.modifyInvisibilityMode.notify();
        });

        Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.success,
          title: localized('successful'),
          message: localized('set_s'),
        );
      }
    }, onError: (Object e) {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('hint'),
        message: e.toString(),
      );
    });
  }
}
