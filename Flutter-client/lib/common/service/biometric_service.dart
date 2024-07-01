import 'package:flutter/services.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/helper/encrypt.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:local_auth/local_auth.dart';
import 'package:system_settings/system_settings.dart';

import 'biometric_service/android_auth_message.dart';
import 'biometric_service/ios_auth_message.dart';

/// 登录流程
///
/// 1. getAvailableBiometrics 刷新生物识别硬件和系统支持情况
///
/// 2. getKey & enrolled 判断是否有生物识别key且设备支持生物识别
///
/// 3. authenticate 验证生物识别，成功后使用getToken获取token
class BiometricService {
  factory BiometricService() => _getInstance();

  static BiometricService get sharedInstance => _getInstance();

  static BiometricService? _instance;

  BiometricService._internal() {
    // 初始化
  }

  // 获取对象
  static BiometricService _getInstance() {
    _instance ??= BiometricService._internal();
    return _instance!;
  }

  final LocalAuthentication _auth = LocalAuthentication();

  final cacheBiometricKeys = ReadWriteValue<Map<String, dynamic>?>(
    'CacheBiometricInfo',
    null,
    () => GetStorage(),
  );

  late Map<String, dynamic> biometricKeys = () {
    return cacheBiometricKeys.val ?? {};
  }();

  final _hardwareSupport = false.obs;

  /// 硬件是否支持
  bool get hardwareSupport => _hardwareSupport.value;

  final _availableBiometrics = <BiometricType>[].obs;

  bool get enrolled => _availableBiometrics.isNotEmpty;

  /// 获取最后一次登录账号的key
  /// 结合enrolled可以判断当前设备是否满足生物识别登录硬性要求（设备支持并开启+有key记录）
  String? getKey() {
    final uid = AccountService.sharedInstance.lastLoginUid;
    if (biometricKeys.containsKey(uid)) {
      final key = biometricKeys[uid] as String?;
      return (key?.isEmpty ?? true) ? null : key;
    }
    return null;
  }

  bool canBiometricLogin() {
    return hardwareSupport &&
        GGUtil.parseStr(getKey()).isNotEmpty &&
        AccountService.sharedInstance.lastLoginUid != null &&
        Config.sharedInstance.environment.allowBiometrics;
  }

  /// 组合请求token
  Future<String?> getToken() async {
    final key = getKey();
    if (key != null) {
      final uid = AccountService.sharedInstance.lastLoginUid;
      if (uid != null) {
        final deviceId = await DeviceUtil.getDeviceIdentifier();
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        return Encrypt.encodeString(
            'deviceid=$deviceId&uid=$uid&timestamp=$timestamp&key=$key');
      }
    }
    return Future.value(null);
  }

  // 存储当前用户的 uid->key
  void storeKey(String key) {
    final uid = AccountService.sharedInstance.lastLoginUid;
    if (uid != null) {
      cacheBiometricKeys.val = biometricKeys
        ..addAll({
          uid: key,
        });
      GamingEvent.openBiometric.notify();
    }
  }

  // 删除当前用户的key
  void removeKey() {
    final uid = AccountService.sharedInstance.lastLoginUid;
    if (uid != null) {
      cacheBiometricKeys.val = biometricKeys..remove(uid);
      GamingEvent.openBiometric.notify();
    }
  }

  /// 检查硬件支持情况
  Future<bool> _checkHardwareSupport() {
    return _auth.canCheckBiometrics.then((value) {
      _hardwareSupport.value = value;
      return Future.value(value);
    }).catchError((err) {
      _hardwareSupport.value = false;
      return Future.value(false);
    });
  }

  /// 获取已注册的生物识别类型
  ///
  /// Android API 29之前只能检测指纹硬件是否存在，先过滤硬件检测
  ///
  /// Android大部分设备的Face ID不满足安全等级要求，一般只能使用指纹，如果没有指纹即使有Face ID也会返回空数组
  ///
  /// iOS可以返回具体支持的类型，Android不返回具体的类型，只会返回强弱程度
  Future<List<BiometricType>> getAvailableBiometrics() {
    return _checkHardwareSupport().then((value) {
      if (value) {
        return _auth.getAvailableBiometrics().then((value) {
          _availableBiometrics.value = value;
          return Future.value(value);
        }).catchError((err) {
          _availableBiometrics.value = [];
          return Future.value(<BiometricType>[]);
        });
      } else {
        _availableBiometrics.value = [];
        return Future.value(<BiometricType>[]);
      }
    });
  }

  /// 唤起生物识别
  ///
  /// [biometricOnly] 是否只使用生物识别，不使用设备密码
  Future<bool> authenticate({
    String? reason,
    bool biometricOnly = true,
  }) async {
    return _auth
        .authenticate(
      localizedReason:
          ' ', //reason ?? 'Please authenticate', //其他内容是跟随系统的，这句话是自己设置的，存在一个弹窗两种混合的情况
      authMessages: [
        IOSCustomAuthMessages(
          lockOut: iOSLockOut,
          goToSettingsButton: iOSGoToSettings,
          goToSettingsDescription: iOSGoToSettingsDescription,
          cancelButton: iOSOkButton,
        ),
        const AndroidCustomAuthMessages(),
      ],
      options: AuthenticationOptions(
        biometricOnly: biometricOnly,
        useErrorDialogs: false,
        stickyAuth: true,
      ),
    )
        .then((value) {
      return value;
    }).onError<PlatformException>((err, s) {
      // ios多次尝试失败会返回Authentication failure.
      if (err.message == 'Authentication failure.') {
        return Future.value(false);
      }
      if (err.message != 'Authentication canceled.') {
        // if (err.code == notAvailable || err.code == otherOperatingSystem) {
        //   // 设备不支持生物识别
        //   showNotSupport();
        // } else

        // if (err.code == notEnrolled) {
        //   // 未注册生物识别
        //   showNotEnrolledDialog();
        // }
      }
      return Future.error(err, s);
    });
  }

  /// 不可用，通常是硬件或者系统不支持
  void showNotSupport() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('device_not_support'),
      content: localized('device_not_support_content'),
      rightBtnName: localized('confirm_button'),
      onRightBtnPressed: () {
        Get.back<void>();
      },
    ).showNoticeDialogWithTwoButtons();
  }

  /// 未注册
  void showNotEnrolledDialog() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('biometric_not_enrolled'),
      content: localized('biometric_not_enrolled_content'),
      rightBtnName: localized('open'),
      leftBtnName: localized('cancels'),
      onLeftBtnPressed: () {
        Get.back<void>();
      },
      onRightBtnPressed: () {
        Get.back<void>();
        SystemSettings.security().catchError((err) {
          SystemSettings.app();
        });
      },
    ).showNoticeDialogWithTwoButtons();
  }

  /// 失败次数太多,锁定
  void showLockedOutDialog() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('use_password'),
      content: localized('use_bio_error_much'),
      rightBtnName: localized('use_password'),
      leftBtnName: localized('cancels'),
      onLeftBtnPressed: () {
        Get.back<void>();
      },
      onRightBtnPressed: () {
        Get.back<void>();
        Get.offNamed<dynamic>(Routes.login.route);
      },
    ).showNoticeDialogWithTwoButtons();
  }

  /// 表示 API 比lockedOut更持久地被锁定  解锁需要 PIN/图案/密码等强身份验证
  void showPermanentlyDialog() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('use_password'),
      content: localized('use_bio_error_much_tips'),
      rightBtnName: localized('use_password'),
      leftBtnName: localized('cancels'),
      onLeftBtnPressed: () {
        Get.back<void>();
      },
      onRightBtnPressed: () {
        Get.back<void>();
        Get.offNamed<dynamic>(Routes.login.route);
      },
    ).showNoticeDialogWithTwoButtons();
  }
}
