import 'dart:async';

import 'package:gogaming_app/common/api/auth/auth_api.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/fingerprint_service/fingerprint_service.dart';
import 'package:gogaming_app/config/user_setting.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/helper/encrypt.dart';

import '../../lang/locale_lang.dart';
import 'base_api.dart';

class GoGamingService {
  factory GoGamingService() => _getInstance();

  static GoGamingService get sharedInstance => _getInstance();

  static final GoGamingService _instance = GoGamingService._internal();

  GoGamingService._internal() {
    // 初始化
  }

  // 获取对象
  static GoGamingService _getInstance() {
    return _instance;
  }

  String? _publicKey;
  String? _ua;

  /// 在登录前需要传的 公共参数
  String? jwtToken;
  final cacheJwtToken = ReadWriteValue('CacheJwtToken', '');

  /// 用户token 登录后使用
  String? userToken;

  String get curToken {
    if (AccountService.sharedInstance.isLogin) {
      return 'token=$userToken';
    } else if (jwtToken != null && jwtToken!.isNotEmpty) {
      return 'jwtToken=$jwtToken';
    } else {
      return '';
    }
  }

  void updateToken(String? token, {bool isUser = false}) {
    if (isUser) {
      _setUserToken(token);
    } else {
      _setJwtToken(token);
    }
  }

  void _setUserToken(String? token) {
    userToken = token;
    // eventCenter.emit(gamingTokenAlready);
  }

  void _setJwtToken(String? token) {
    jwtToken = token;
    cacheJwtToken.val = token ?? '';
  }

  void clearPublicKey() {
    _publicKey = null;
    _ua = null;
  }

  String get userAgent {
    return _ua ?? '';
  }

  /// header的公参和token都包含这个参数，后台优先读取header数据,没有再读token数据
  String get apiLang {
    // getLanguage请求在应用初始化之前，这个时候context = null
    if (Get.context != null) {
      if (AppLocalizations.of(Get.context!).isEnglish()) {
        return "en-us";
      }

      if (AppLocalizations.of(Get.context!).isThailand()) {
        return "th";
      }

      if (AppLocalizations.of(Get.context!).isVietnamese()) {
        return "vi";
      }
    }
    if (UserSetting.sharedInstance.lang.isNotEmpty) {
      return UserSetting.sharedInstance.lang;
    }
    return "zh-cn";
  }

  Future<void> getUA() async {
    if (_ua == null) {
      // final deviceName = await DeviceUtil.getDeviceName();
      String deviceModel = await DeviceUtil.getDeviceModel();
      // 过滤一些安卓的设备信息包含非标的符号 防止后端不识别
      deviceModel = deviceModel.replaceAll('+', '');
      final systemVersion = await DeviceUtil.getSystemVersion();
      const appVersion = Config.version;
      // 格式 Mozilla/5.0 (GBD; APP名称代号/APP版本号) (设备; 系统版本; 系统语言)
      _ua =
          'Mozilla/5.0 (GBD; GoGaming/$appVersion) ($deviceModel; $systemVersion)';
    }
    return;
  }

  Future<String> getPublicKey() async {
    if (_ua == null) {
      await getUA();
    }
    if (_publicKey is String) return _publicKey!;

    String nonce = await DeviceUtil.getDeviceIdentifier();
    // final locale = Localizations.localeOf(Global.context);
    // final lang = '${locale.languageCode}-${locale.countryCode}';
    // String? apiLang = 'zh-cn'; // = await SPHelper.getString(SPHelper.apiLang);

    final ua = _ua;
    final lang = apiLang;

    // 商户（暂时填1）
    String tenantId = Config.tenantId;
    // 品牌（暂时填1）
    const market = 1;
    const location = ""; //地址位置
    const domain = "";
    final content =
        'nonce=$nonce&lang=$lang&ua=$ua&tenant=$tenantId&market=$market&location=$location&domain=$domain';
    _publicKey = Encrypt.encodeString(content);
    return _publicKey!;
  }

  Map<String, dynamic> getHeaders() {
    Map<String, String?> headers = {"accept": "*/*"};
    if (_ua != null) headers['User-Agent'] = _ua;
    headers['lang'] = apiLang;
    headers['Fp-Visitor-Id'] = FingerprintService().readVisitorId();

    if (userToken is String && userToken?.isNotEmpty == true) {
      headers['Authorization'] = 'Bearer $userToken';
    } else if (jwtToken is String) {
      headers['Authorization'] = 'Bearer $jwtToken';
    }
    headers['APM-Request-ID'] = getRequestId(headers['Authorization'] ?? '');
    return headers;
  }

  /// APM-Request-ID 对应请求的唯一id
  String getRequestId(String token) {
    final now = DateTime.now().millisecondsSinceEpoch;
    // 时间戳和token组合
    final combineString = '${now}_$token';
    // md5加密
    final hashString = Encrypt.md5Convert(combineString);
    if (hashString.length > 16) {
      return hashString.substring(0, 16);
    } else {
      return hashString;
    }
  }

  Future<Map<String, dynamic>> get commonHeader async {
    Map<String, String?> headers = {"accept": "*/*"};
    if (_ua == null) {
      await getUA();
    }
    if (_ua != null) headers['User-Agent'] = _ua;
    // String l = await SPHelper.getString(SPHelper.lang) ?? "zh-cn";
    // l = l.split("_").first;
    // String lang = "zh-cn";
    // switch (l) {
    //   case "zh":
    //     lang = "zh-cn";
    //     break;
    //   case "en":
    //     lang = "en-us";
    //     break;
    //   case "th":
    //     lang = "th";
    //     break;
    //   case "vi":
    //     lang = "vi";
    //     break;
    //   default:
    //     break;
    // }
    headers['lang'] = apiLang;
    late String token;
    // if (userToken == null || userToken.isEmpty) {
    //   await AccountService.sharedInstance.readUserInfo();
    // }

    if (userToken is String && userToken?.isNotEmpty == true) {
      token = userToken!;
    } else {
      if (jwtToken == null) {
        await authSetup();
      }
      if (jwtToken is String) {
        token = jwtToken!;
      } else {
        token = '';
      }
    }
    headers['Fp-Visitor-Id'] = FingerprintService().readVisitorId();
    headers['Authorization'] = 'Bearer $token';
    headers['APM-Request-ID'] = getRequestId(headers['Authorization'] ?? '');
    return headers;
  }

  Completer<dynamic>? _c;

  Future<dynamic> authSetup() async {
    // 防止并发请求多次token
    if (_c == null || _c?.isCompleted == true) {
      _c = Completer<dynamic>();
      final key = await getPublicKey();
      PGSpi(Auth.setup.toTarget(input: {"s": key})).rxRequest((p0) {
        if (p0['data'] is String) {
          return p0['data'] as String;
        }
        return '';
      }, asyncHeaders: false).listen((event) {
        _setJwtToken(event.data);
        Future(() {
          if (_c == null || _c?.isCompleted == true) {
            return;
          }
          _c?.complete(jwtToken);
        });
      }).onError((Object error, StackTrace? stackTrace) {
        if (cacheJwtToken.val.isNotEmpty) {
          _setJwtToken(cacheJwtToken.val);
        }
        Future(() {
          if (_c == null || _c?.isCompleted == true) {
            return;
          }
          _c?.complete(jwtToken);
        });
      });
    }
    return _c!.future;
  }
}
