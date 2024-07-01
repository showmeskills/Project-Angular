import 'dart:async';

import 'package:gogaming_app/common/api/kyc/kyc.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_country.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/gg_kyc_home/gg_kyc_home_logic.dart';
import 'package:iovation_flutter/iovation_flutter.dart';

import '../../../common/api/country/models/gaming_country_model.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/country_service.dart';
import '../../../common/service/event_service.dart';
import '../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import 'gg_kyc_middle_state.dart';

class GGKycMiddleLogic extends BaseController {
  final GGKycMiddleState state = GGKycMiddleState();
  Timer? timer;

  @override
  void onInit() {
    state.isChina.value = state.currentCountry.value.isChina;
    updateCurrentCountry(state.currentCountry.value);

    state.idCardController.textController.addListener(() {
      _contentChanged();
    });

    state.phoneController.textController.addListener(() {
      _contentChanged();
    });

    state.bankCardController.textController.addListener(() {
      state.expandPhoneVer.value = state.bankCardValid;
      _contentChanged();
    });

    state.codeController.textController.addListener(() {
      _contentChanged();
    });

    KycService.sharedInstance.queryUserBasicInfo().listen((event) {
      state.firstNameController.value.textController.text =
          event?.firstName ?? '';
      state.lastNameController.value.textController.text =
          event?.lastName ?? '';
      state.fullNameController.value.textController.text =
          event?.fullName ?? '';
    }).onError((Object error) {});
    super.onInit();
  }

  @override
  void onClose() {
    timer?.cancel();
    super.onClose();
  }

  void updateCurrentCountry(GamingCountryModel value) {
    state.currentSelectVerType.value = VerType.none;
    state.idCardController.textController.clear();
    state.bankCardController.textController.clear();
    state.phoneController.textController.clear();
    CountryService.sharedInstance.changeCurrentCountry(value);
    state.currentCountry(value);
    state.isChina.value = value.isChina;
    _updateForeignVer();
  }

  void _updateForeignVer() {
    final country = state.currentCountry.value;
    if (country.isChina) {
      return;
    }

    showLoading();
    Map<String, dynamic> reqParams = {
      "countryCode": state.currentCountry.value.iso,
    };
    PGSpi(Kyc.kycCountry.toTarget(input: reqParams))
        .rxRequest<GamingKycCountryModel>((value) {
      return GamingKycCountryModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).listen((event) {
      hideLoading();
      if (event.success == true) {
        state.currentVerType.value = event.data;
      }
    }).onError((Object error) {
      hideLoading();
      if (error is GoGamingResponse) {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

  void sendPhoneCheck() {
    if (state.phoneValid) {
      _reqOtpCode();
    } else {
      Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          title: localized('failed'),
          message: localized("sms_ver_code05"));
    }
  }

  void submit() {
    if (state.isChina.value) {
      _chinaSubmit();
    } else {
      _foreignSubmit();
    }
  }

  void selectVerType(VerType type) {
    state.currentSelectVerType.value = type;
    _contentChanged();
  }

  void _chinaSubmit() {
    state.isLoading.value = true;
    _verOtpCode((result) {
      state.isLoading.value = false;
      if (result) {
        state.codeController.addFieldError(showErrorHint: false);
        _verChina();
      } else {
        state.codeController.addFieldError(hint: localized("vercode_err"));
      }
    });
  }

  void _foreignSubmit() {
    Get.toNamed<void>(Routes.kycMiddleUpload.route, arguments: {
      "countryModel": state.currentVerType.value,
      "verType": state.currentSelectVerType.value,
      "countryCode": state.currentCountry.value.iso,
      "fullName": state.fullNameController.value.text.value,
      "firstName": state.firstNameController.value.text.value,
      "lastName": state.lastNameController.value.text.value,
    });
  }

  void _verChina() {
    Map<String, dynamic> reqParams = {
      "fullName": state.fullNameController.value.text.value,
      "idcard": state.idCardController.text.value,
      "bankcard": state.bankCardController.text.value
          .replaceAll(RegExp(r"\s+\b|\b\s"), ""),
      "mobile": state.phoneController.text.value,
    };
    IovationFlutter.getBlackBox().asStream().doOnData((blackBox) {
      PGSpi(Kyc.intermediate.toTarget(inputData: {
        ...reqParams,
        "iovationBlackbox": blackBox,
      })).rxRequest<dynamic>((value) {
        return value;
      }).listen((event) {
        if (event.success == true) {
          bool hasPrePage = Get.findOrNull<GGKycHomeLogic>()?.context != null;
          if (Get.previousRoute == Routes.kycHome.route || hasPrePage) {
            Get.back<dynamic>();
          } else {
            Get.offNamed<dynamic>(Routes.kycHome.route);
          }
          GamingEvent.kycMiddleSuccess.notify();
        }
      }).onError((Object error) {
        if (error is GoGamingResponse) {
          Toast.show(
              context: Get.overlayContext!,
              state: GgToastState.fail,
              title: localized('failed'),
              message: error.toString());
        } else {
          Toast.showTryLater();
        }
      });
    }).listen(null, onError: (err) {
      Toast.showTryLater();
    });
  }

  void _verOtpCode(void Function(bool result) success) {
    Map<String, dynamic> reqParams = {
      "phone": state.phoneController.text.value,
      "smsCode": state.codeController.text.value
    };
    PGSpi(Kyc.verifySms.toTarget(inputData: reqParams))
        .rxRequest<bool>((value) {
      if (value['data'] is bool) {
        return value['data'] as bool;
      } else {
        return false;
      }
    }).listen((event) {
      success.call(event.data);
    }).onError((Object error) {
      success.call(false);
      if (error is GoGamingResponse) {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

  void _reqOtpCode() {
    Map<String, dynamic> reqParams = {
      "phone": state.phoneController.text.value
    };
    PGSpi(Kyc.sendSms.toTarget(input: reqParams)).rxRequest<dynamic>((value) {
      return value;
    }).listen((event) {
      if (event.success == true) {
        state.phoneCodeState.value = PhoneCodeState.send;
        _startTimer();
        Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.success,
          title: localized('completed'),
          message: localized("send_sms_success"),
        );
      }
    }).onError((Object error) {
      if (error is GoGamingResponse) {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: error.toString());
      } else {
        Toast.showTryLater();
      }
    });
  }

  void _startTimer() {
    timer = Timer.periodic(const Duration(seconds: 1), (object) {
      if (state.secondLeft.value > 0) {
        state.secondLeft.value -= 1;
      } else {
        timer?.cancel();
        state.secondLeft.value = 90;
        state.phoneCodeState.value = PhoneCodeState.reSend;
      }
    });
  }

  void _contentChanged() {
    if (state.isChina.value) {
      /// 国内需要通过所有参数校验
      if (state.nameValid &&
          state.idCardValid &&
          state.bankCardValid &&
          state.phoneValid &&
          state.codeValid) {
        state.buttonEnable.value = true;
      } else {
        state.buttonEnable.value = false;
      }
    } else {
      if (state.nameValid &&
          (state.currentSelectVerType.value != VerType.none)) {
        state.buttonEnable.value = true;
      } else {
        state.buttonEnable.value = false;
      }
    }
  }
}
