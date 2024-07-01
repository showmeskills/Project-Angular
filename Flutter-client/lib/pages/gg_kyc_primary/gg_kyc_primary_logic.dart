import 'dart:async';
import 'dart:convert';

import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:flutter/foundation.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/country_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/tools/phone_number_util.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/gg_kyc_home/gg_kyc_home_logic.dart';
import 'package:intl/intl.dart';

import '../../common/api/kyc/kyc.dart';
import '../../common/api/kyc/models/gg_kyc_cache_info.dart';
import '../../common/service/merchant_service/merchant_service.dart';
import '../../common/tracker/analytics_manager.dart';
import 'gg_kyc_primary_state.dart';

class GGKycPrimaryLogic extends BaseController {
  // 强制认证成功后关闭页面
  final bool closeAfterSuccess;

  final GGKycPrimaryState state = GGKycPrimaryState();

  RxBool isVoice = false.obs;

  GGKycPrimaryLogic([
    this.closeAfterSuccess = false,
  ]);

  @override
  void onInit() {
    super.onInit();
    state.phoneController.textController.addListener(() {
      _checkPhoneNumber();
    });
    state.codeController.textController.addListener(() {
      checkParams();
    });
    state.nameController.value.textController.addListener(() {
      checkParams();
    });
    state.firstNameController.value.textController.addListener(() {
      checkParams();
    });
    state.lastNameController.value.textController.addListener(() {
      checkParams();
    });
    ever<GamingTextFieldController>(state.nameController, (value) {
      value.textController.addListener(() {
        checkParams();
      });
    });

    everAll([
      state.birthday,
      state.currentCountry,
      state.email.text,
      state.address.text,
      state.postCode.text,
      state.city.text,
    ], (value) {
      checkParams();
    });
    _readFillCache();
  }

  @override
  void onClose() {
    _saveCache();
    super.onClose();
  }

  void _saveCache() {
    PGSpi(
      Kyc.cachePrimaryInfo.toTarget(
        inputData: {
          "fullName": state.nameController.value.textController.text,
          "firstName": state.firstNameController.value.textController.text,
          "lastName": state.lastNameController.value.textController.text,
          "dob": state.birthday.value,
          "address": state.address.textController.text,
          "city": state.city.textController.text,
          "zipCode": state.postCode.textController.text,
          "email": state.email.textController.text,
          "mobile": state.phoneController.textController.text,
          "areaCode": state.currentCountry.value.areaCode,
          "countryCode": state.currentCountry.value.code,
        },
      ),
    ).rxRequest<bool?>((value) {
      return value['data'] is bool ? value['data'] as bool : null;
    }).listen(null);
  }

  void _readFillCache() {
    SmartDialog.showLoading<void>();
    PGSpi(Kyc.getPrimaryCacheInfo.toTarget())
        .rxRequest<GamingKycCacheInfo?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        return GamingKycCacheInfo.fromJson(data);
      } else {
        return null;
      }
    }).doOnData((event) {
      SmartDialog.dismiss<void>();
      final cacheInfo = event.data;
      if (cacheInfo != null) {
        state.nameController.value.textController.text =
            cacheInfo.fullName ?? '';
        state.firstNameController.value.textController.text =
            cacheInfo.firstName ?? '';
        state.lastNameController.value.textController.text =
            cacheInfo.lastName ?? '';
        state.email.textController.text = cacheInfo.email ?? '';
        state.postCode.textController.text = cacheInfo.zipCode ?? '';
        state.city.textController.text = cacheInfo.city ?? '';
        state.address.textController.text = cacheInfo.address ?? '';
        readCacheDate(cacheInfo.dob ?? '');
        if (state.isNotBindPhone) {
          // 兼容PhoneNumberUtil.isValidPhoneNumber校验问题,延迟处理
          Future.delayed(const Duration(), () {
            state.phoneController.textController.text = cacheInfo.mobile ?? '';
          });
          final bindCountry = CountryService.sharedInstance.countryList
              .firstWhereOrNull(
                  (element) => element.areaCode == cacheInfo.areaCode);
          state.currentCountry.value =
              bindCountry ?? state.currentCountry.value;
        }
      }
      state.email.textController.text =
          cacheInfo?.email ?? (AccountService().gamingUser?.email ?? '');
      _checkPhoneNumber();
    }).doOnError((p0, p1) {
      SmartDialog.dismiss<void>();
    }).listen(null);
  }

  void _checkPhoneNumber() {
    /// 如果已经绑定手机号则不检测手机号格式问题
    if (!state.isNotBindPhone) {
      return;
    }
    phoneNumberValid().then((value) {
      state.phoneController.addFieldError(
        showErrorHint: value == false,
        hint: localized('phone_error_msg'),
      );
      checkParams();
    });
  }

  Future<bool> phoneNumberValid() async {
    final result = await GGPhoneNumberUtil.isValidPhoneNumber(
        phoneNumber: state.phoneController.text.value,
        isoCode: state.currentCountry.value.iso);
    return result == true && state.phoneController.text.value.isNotEmpty;
  }

  void checkParams() {
    var isValid = _checkNameField();
    if (!state.currentCountry.value.isChina) {
      isValid = isValid &&
          state.birthday.value.isNotEmpty &&
          state.email.isPass &&
          state.address.isNotEmpty &&
          state.postCode.isNotEmpty &&
          state.city.isNotEmpty;
    }
    if (state.isNotBindPhone) {
      isValid = isValid &&
          !state.phoneController.showErrorHint &&
          state.codeController.isPass;
    }
    state.continueEnable.value = isValid;
  }

  bool _checkNameField() {
    if (showFullName) {
      return state.nameController.value.isPass;
    } else {
      return (state.firstNameController.value.isPass &&
              state.firstNameController.value.isNotEmpty) &&
          (state.lastNameController.value.isPass &&
              state.lastNameController.value.isNotEmpty);
    }
  }

  bool _isFullNameCountry(GamingCountryModel model) {
    final fullNameCountries = jsonDecode(MerchantService
            .sharedInstance.merchantConfigModel?.config?.fullNameCountries ??
        '');
    if (fullNameCountries is List) {
      return fullNameCountries.contains(model.iso);
    } else {
      return model.isChina ||
          model.isHK ||
          model.isTW ||
          model.isMO ||
          model.isVnm ||
          model.isTha;
    }
  }

  bool get showFullName {
    return _isFullNameCountry(state.currentCountry.value);
  }

  void requestPrimary({String? mobile}) {
    AnalyticsManager.logEvent(name: 'kyc_basic');
    state.isVerifyLoading.value = true;

    final country = state.currentCountry.value;
    final fullName = state.nameController.value.text.value;
    final firstName = state.firstNameController.value.text.value;
    final lastName = state.lastNameController.value.text.value;
    final code = state.isNotBindPhone ? state.codeController.text.value : null;
    final smsVoice = state.isNotBindPhone ? false : null;
    final otpType = state.isNotBindPhone ? VerifyAction.bindMobile.value : null;
    final dob = country.isChina ? null : state.birthday.value;
    final email = state.email.text.value;
    final address = state.address.text.value;
    final city = state.city.text.value;
    final postCode = state.postCode.text.value;
    late Stream<GoGamingResponse<bool>> request;
    if (KycService.sharedInstance.isAsia) {
      request = KycService.sharedInstance.requestPrimary(
        fullName: fullName,
        firstName: firstName,
        lastName: lastName,
        countryCode: country.iso,
        areaCode: state.isNotBindPhone ? country.areaCode : '',
        mobile: state.isNotBindPhone ? mobile : '',
        otpCode: code,
        smsVoice: smsVoice,
        otpType: otpType,
        dob: dob,
        address: address,
        email: email,
        city: city,
        zipCode: postCode,
      );
    } else {
      request = KycService.sharedInstance.requestPrimaryForEU(
        fullName: fullName,
        firstName: firstName,
        lastName: lastName,
        countryCode: country.iso,
        areaCode: state.isNotBindPhone ? country.areaCode : '',
        mobile: state.isNotBindPhone ? mobile : '',
        otpCode: code,
        smsVoice: smsVoice,
        otpType: otpType,
        dob: dob,
        address: address,
        email: email,
        city: city,
        zipCode: postCode,
      );
    }
    request.listen(
      (event) {
        state.isVerifyLoading.value = false;

        if (event.data == true) {
          if (state.isNotBindPhone) {
            // 通知绑定手机成功
            AccountService().updateGamingUserInfo().listen((value) {
              GamingEvent.bindMobileSuccess.notify();
            });
          }
          bool hasPrePage = Get.findOrNull<GGKycHomeLogic>()?.context != null;
          if (Get.previousRoute == Routes.kycHome.route ||
              hasPrePage ||
              closeAfterSuccess) {
            Get.back<dynamic>();
          } else {
            Get.offNamed<dynamic>(Routes.kycHome.route);
          }
          GamingEvent.kycPrimarySuccess.notify();
        }
      },
      onError: (Object error) {
        state.isVerifyLoading.value = false;
        if (error is GoGamingResponse) {
          Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('hint'),
            message: error.toString(),
          );
        } else {
          Toast.showTryLater();
        }
      },
    );
  }

  void setInputDate(List<String> dateList) {
    try {
      debugPrint('KycDateInputWidget onChanged $dateList');
      final dateText = dateList.join('/');
      final date = DateFormat("dd/MM/yyyy").parseStrict(dateText);

      if (date.microsecondsSinceEpoch > DateTime.now().microsecondsSinceEpoch) {
        //日期非法
        state.showDateError.value = true;
      } else {
        updateDate(date);
      }
    } catch (e) {
      //日期非法
      state.showDateError.value = true;
    }
  }

  void readCacheDate(String dateText) {
    try {
      final date = DateFormat("yyyy-MM-dd").parseStrict(dateText);
      // 等到视图渲染后再更新数据
      Future.delayed(const Duration(milliseconds: 50), () {
        setSelectedDate(date);
      });
    } catch (e) {
      debugPrint('kyc readCacheDate error date:$dateText error:$e');
    }
  }

  void setSelectedDate(DateTime date) {
    state.selectedDate = date;
    final feildText = DateFormat("ddMMyyyy").format(date);
    if (feildText != state.dateInputController.getCurrentPin()) {
      state.dateInputController.set([
        feildText.substring(0, 2),
        feildText.substring(2, 4),
        feildText.substring(4)
      ]);
    }
    state.birthday.value = DateFormat("yyyy-MM-dd").format(date);
    state.showDateError.value = false;
  }

  void updateDate(DateTime date) {
    state.selectedDate = date;

    state.birthday.value = DateFormat("yyyy-MM-dd").format(date);
    state.showDateError.value = false;
  }

  void _resetField(GamingCountryModel newValue) {
    if (newValue.isChina && newValue.code != state.currentCountry.value.code) {
      state.email.textController.clear();
      state.birthday.value = '';
    }
    if (_isFullNameCountry(newValue) &&
        !_isFullNameCountry(state.currentCountry.value)) {
      state.firstNameController.value.textController.clear();
      state.lastNameController.value.textController.clear();
    }
    if (!_isFullNameCountry(newValue) &&
        _isFullNameCountry(state.currentCountry.value)) {
      state.nameController.value.textController.clear();
    }
    state.phoneController.textController.clear();
    state.codeController.textController.clear();
    state.city.textController.clear();
    state.postCode.textController.clear();
    state.address.textController.clear();
  }

  void setCurrentCountry(GamingCountryModel value) {
    _resetField(value);
    CountryService.sharedInstance.changeCurrentCountry(value);
    state.currentCountry(value);
    state.updateNameController();
  }
}
