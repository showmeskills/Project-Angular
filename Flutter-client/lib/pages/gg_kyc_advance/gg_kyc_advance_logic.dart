import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/controller_header.dart';

import 'gg_kyc_advance_state.dart';

class GGKycAdvanceLogic extends BaseController {
  final GGKycAdvanceState state = GGKycAdvanceState();

  @override
  void onInit() {
    state.placeController.textController.addListener(() {
      _checkParams();
    });
    state.areaCodeController.textController.addListener(() {
      _checkParams();
    });
    state.cityController.textController.addListener(() {
      _checkParams();
    });
    super.onInit();
    _getMemberInfo();
  }

  @override
  void onReady() {
    state.placeController.textController.text =
        AccountService().gamingUser?.address ?? '';
  }

  void _getMemberInfo() {
    SmartDialog.showLoading<void>();
    KycService().queryUserBasicInfo().listen((event) {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
      final address = event?.address;
      final zipCode = event?.zipCode;
      final city = event?.city;
      state.placeController.textController.text = address ?? '';
      state.areaCodeController.textController.text = zipCode ?? '';
      state.cityController.textController.text = city ?? '';
    }, onError: (Object e) {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    });
  }

  void _checkParams() {
    if (state.placeController.isNotEmpty &&
        state.placeController.isPass &&
        state.areaCodeController.isNotEmpty &&
        state.areaCodeController.isPass &&
        state.cityController.isNotEmpty &&
        state.cityController.isPass) {
      state.continueEnable.value = true;
    } else {
      state.continueEnable.value = false;
    }
  }
}