import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/account/account_api.dart';
import 'package:gogaming_app/common/api/account/models/gaming_preference_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/language/models/gaming_language.dart';
import 'package:gogaming_app/common/api/user_notice/models/gaming_notice_config.dart';
import 'package:gogaming_app/common/api/user_notice/user_notice_api.dart';
import 'package:gogaming_app/common/api/wallet/models/gg_user_balance.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/gaming_tag_service/gaming_tag_service.dart';
import 'package:gogaming_app/common/service/language_service.dart';
import 'package:gogaming_app/common/service/restart_service.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_transfer_selector.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/user_setting.dart';
import 'package:gogaming_app/controller_header.dart';

part 'gaming_preference_state.dart';

class GamingPreferenceLogic extends BaseController {
  GamingCurrencyModel get selectedCurrency =>
      CurrencyService.sharedInstance.selectedCurrency;

  String get selectedIconUrl => selectedCurrency.iconUrl;
  String get selectedCurrencyStr => selectedCurrency.currency ?? '';

  RxString currentLanguage = "".obs;
  RxList<String> optionalLanguages = <String>[].obs;
  final Map<String, String> _optionalLanguagesConfig = <String, String>{};

  /// 可选货币
  List<GGUserBalance> myBalanceList = [];

  /// 抵用金
  GamingPreferenceModel? userSetting;
  // 是否使用抵用金投注
  RxBool isEnableCredit = true.obs;
  RxBool isChangeCreditLoading = false.obs;

  // 通知
  GamingNoticeConfig? noticeConfig;
  RxString currentNoticeLanguage = localized('not_set').obs;

  List<String> curNotice = [];
  RxString curNoticeStr = ''.obs;

  RxString invisibilityModeStr = ''.obs;

  @override
  void onInit() {
    super.onInit();
    _loadDefaultLanguage();
    _loadLanguagesConfig();
    _updateCredit();
    _loadUserBalances();
    _loadNoticeSetting();
    GamingEvent.changeNotificationInApp.subscribe(() {
      _loadNoticeSetting();
    });

    _loadInvisibilityModeStr();
    GamingEvent.modifyInvisibilityMode.subscribe(() {
      _loadInvisibilityModeStr();
    });
  }

  @override
  void onClose() {
    super.onClose();
    GamingEvent.changeNotificationInApp.unsubscribe(() {});
    GamingEvent.modifyInvisibilityMode.unsubscribe(() {});
  }

  /// 获取通知设置
  void _loadNoticeSetting() {
    PGSpi(UserNotice.getNoticeConfig.toTarget())
        .rxRequest<GamingNoticeConfig?>((value) {
      return value['data'] is Map<String, dynamic>
          ? GamingNoticeConfig.fromJson(value['data'] as Map<String, dynamic>)
          : null;
    }).listen((event) {
      noticeConfig = event.data;
      setCurrentNoticeLanguage();
    }).onError((Object error) {});
  }

  void setCurrentNoticeLanguage() {
    curNotice.clear();
    curNoticeStr.value = '';

    /// 站内信类型
    noticeConfig?.noticeTypeList?.forEach((element) {
      if (element == 'System') {
        curNotice.add(localized('sys_noti'));
      } else if (element == 'Transaction') {
        curNotice.add(localized('trade_noti'));
      } else if (element == 'Information') {
        curNotice.add(localized('news_noti'));
      } else if (element == 'Activity') {
        curNotice.add(localized('activities_noti'));
      }
    });
    curNoticeStr.value = curNotice.join(',');

    /// 通知语言
    if (noticeConfig == null || _optionalLanguagesConfig.isEmpty) return;
    _optionalLanguagesConfig.forEach((key, value) {
      if (value == noticeConfig?.language) {
        currentNoticeLanguage.value = key;
      }
    });
  }

  void _loadUserBalances() async {
    myBalanceList = AccountService.sharedInstance.userBalances.toList();

    if (myBalanceList.isEmpty) {
      AccountService.sharedInstance.fetchUserBalance().listen((event) {
        myBalanceList = AccountService.sharedInstance.userBalances.toList();
      }, onError: (Object e) {
        if (e is GoGamingResponse) {
          Toast.showFailed(e.message);
        } else {
          Toast.showTryLater();
        }
      });
    }
  }

  /// 选择货币
  void selectCurrency() {
    GamingCurrencyTransferSelector.show(
            original: myBalanceList) //state.commonCurrency
        .then((value) {
      if (value != null) {
        setDefaultCurrency(value.currency ?? '');
      }
    });
  }

  void onSelectBalance(String currency) {
    final selectedCurrency = CurrencyService.sharedInstance[currency];
    if (selectedCurrency != null) {
      CurrencyService.sharedInstance.selectedCurrency = selectedCurrency;
    }
  }

  void _updateCredit() {
    userSetting = AccountService.sharedInstance.userSetting;
    isEnableCredit.value = userSetting?.isEnableCredit ?? true;
  }

  void _loadInvisibilityModeStr() {
    /// 接口返回的
    List<String> allMode = [
      'ShowUserName',
      'ShowUid',
      'Invisibility',
    ];

    /// 多语言翻译key
    List<String> allModeStr = [
      'show_username',
      'show_uid',
      'fully_invisible',
    ];
    userSetting = AccountService.sharedInstance.userSetting;

    String curMode = userSetting?.invisibilityMode ?? '';
    invisibilityModeStr.value = '';

    for (int i = 0; i < allMode.length; i++) {
      if (curMode == allMode[i]) {
        invisibilityModeStr.value = allModeStr[i];
      }
    }
  }

  void _loadDefaultLanguage() {
    final locale = AppLocalizations.of(Get.context!).locale;
    for (var element in GamingLanguage.localeConfig) {
      if (locale.languageCode.contains(element["code"] ?? "")) {
        currentLanguage.value = localized(element["name"]?.toLowerCase() ?? "");
        break;
      }
    }
  }

  Stream<List<GamingLanguage>> _getLanguagesConfig() {
    return LanguageService.sharedInstance.getLanguage().doOnData((event) {
      final list = GamingLanguage.localeConfig
          .map((e) => localized(e["code"] as String))
          .toList();
      List<String> tempOptionalLanguages = <String>[];
      for (String code in list) {
        GamingLanguage? language = event.firstWhereOrNull((element) {
          return element.code?.split("-").first.toLowerCase() ==
              code.toLowerCase();
        });
        if (language != null &&
            language.name != null &&
            language.code != null) {
          _optionalLanguagesConfig[language.name!] = language.code!;
          tempOptionalLanguages.add(language.name!);
        }
      }
      optionalLanguages.value = tempOptionalLanguages;
      _loadDefaultLanguage();
    });
  }

  void pressSetLanguage({VoidCallback? onSucessCallBack}) {
    if (optionalLanguages.isNotEmpty) {
      onSucessCallBack?.call();
    } else {
      SmartDialog.showLoading<void>();
      _getLanguagesConfig().doOnError((err, p1) {
        SmartDialog.dismiss<void>();
        if (err is GoGamingResponse) {
          Toast.showFailed(err.message);
        } else {
          Toast.showTryLater();
        }
      }).doOnData((event) {
        SmartDialog.dismiss<void>();
        onSucessCallBack?.call();
      }).listen((event) {}, onError: (p0, p1) {});
    }
  }

  void _loadLanguagesConfig() {
    _getLanguagesConfig().listen((event) {});
  }

  void _setLanguage(String langCode) async {
    Map<String, String>? result =
        GamingLanguage.localeConfig.firstWhereOrNull((element) {
      return langCode.split("-").first.toLowerCase() ==
          element['code']!.toLowerCase();
    });
    AccountService.sharedInstance.updateDefaultLanguage(langCode).listen(null);
    if (result != null) {
      // 防止重建APP 打断了bottomSheet的pop动画,添加延迟
      Future.delayed(const Duration(milliseconds: 500), () {
        UserSetting.sharedInstance.lang = langCode;
        UserSetting.sharedInstance.async();
        Locale newLocale = Locale(result["code"]!, result['countryCode']);
        AppLocalizations.of(Get.context!).locale = newLocale;
        GamingTagService.sharedInstance.restore();
        RestartService.restart();
      });
    }
  }

  /// 修改语言
  void changeLanguage(String content) {
    String? langCode = _optionalLanguagesConfig[content];
    _setLanguage(langCode ?? "");
  }

  /// 修改通知语言
  void changeNoticeLanguage(String content) {
    String? langCode = _optionalLanguagesConfig[content];

    /// 通知语言
    PGSpi(UserNotice.setNoticeLanguage.toTarget(
      inputData: {'language': langCode ?? ''},
    )).rxRequest<bool?>((value) {
      final data = value['data'];
      if (data is bool) {
        return data;
      } else {
        return null;
      }
    }).listen((value) {
      if (value.success) {
        _loadNoticeSetting();
        Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.success,
          title: localized('successful'),
          message: localized('set_s'),
        );
      }
    }, onError: (e) {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('hint'),
        message: localized('set_f'),
      );
    });
  }

  /// 修改是否使用抵用金
  void modifyCredit() {
    isChangeCreditLoading.value = true;
    PGSpi(Account.modifyCredit.toTarget(
      inputData: {'isEnable': !isEnableCredit.value},
    )).rxRequest<bool?>((value) {
      final data = value['data'];
      if (data is bool) {
        return data;
      } else {
        return null;
      }
    }).listen((value) {
      if (value.success) {
        isChangeCreditLoading.value = false;
        isEnableCredit.value = !isEnableCredit.value;
        AccountService.sharedInstance
            .updateGamingUserInfo()
            .listen((event) {}, onError: (e) {});
        Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.success,
          title: localized('successful'),
          message: localized('set_s'),
        );
      }
    }, onError: (e) {
      isChangeCreditLoading.value = false;
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('hint'),
        message: localized('set_f'),
      );
    });
  }

  /// 修改默认币种
  void setDefaultCurrency(String currency) {
    PGSpi(Account.setDefaultCurrency.toTarget(
      inputData: {'defaultCurrencyType': currency},
    )).rxRequest<bool?>((value) {
      final data = value['data'];
      if (data is bool) {
        return data;
      } else {
        return null;
      }
    }).listen((value) {
      if (value.success) {
        AccountService.sharedInstance.userSetting?.defaultCurrencyType =
            currency;
        onSelectBalance(currency);

        Toast.show(
          context: Get.overlayContext!,
          state: GgToastState.success,
          title: localized('successful'),
          message: localized('set_s'),
        );
      }
    }, onError: (e) {
      Toast.show(
        context: Get.overlayContext!,
        state: GgToastState.fail,
        title: localized('hint'),
        message: localized('set_f'),
      );
    });
  }
}
