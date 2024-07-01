import 'dart:async';
import 'dart:convert';
import 'dart:developer';
import 'dart:typed_data';
import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/gg_failed_request_desc.dart';
import 'package:gogaming_app/common/service/x5_core_service.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/service/oauth_service/oauth_service.dart';
import 'package:gogaming_app/common/tools/url_tool.dart';
import 'package:gogaming_app/config/environment.dart';
import '../../../config/config.dart';
import 'merchant_config_model.dart';
// ignore_for_file: depend_on_referenced_packages
import 'package:flutter_cache_manager/flutter_cache_manager.dart'
    as flutter_cache;

const merchant1 = {
  "appLogoSun":
      "Merchant/24/31/13/638459118967319370/file/638459118967319241.png",
  "appLogoMoon":
      "Merchant/24/31/13/638459118991699208/file/638459118991699105.png",
  "appBeforeLogoSun":
      "Merchant/24/21/18/638463288984141985/file/638463288984136052.png",
  "appBeforeLogoMoon":
      "Merchant/24/21/18/638463289118763102/file/638463289118757335.png",
  "colorScheme": "sun",
  "maintain": false,
  "maintainTimeEnd": "",
  "defaultAvatarApp": null,
  "startupImg": ["", "", "", ""],
  "openedSocialLogin": ["Google", "Line", "MetaMask", "Telegram"],
  "config": {
    "androidDownloadURL": "https://app.22all.net/lt-android.apk",
    "androidUpdateInfo": "fix bug",
    "apiDomain": "https://www.ltvip2.fun/",
    "appResourceUrl": "https://static.dmcddv.cn/",
    "buildNO": "20240513.1",
    "cardCenterLink":
        "help-center/faq/1155413151285317?articleCode=1156437490171973",
    "comm100CampaignIds":
        "{\"en-us\": \"baf00c8d-1b55-4d30-bff5-39f7c53947b6\",\"zh-cn\": \"b525f5d8-f4bd-486d-bd20-400f8faaee5b\",\"th\": \"cbbeaf6f-b091-452f-b0a7-ce03630962d4\",\"vi\": \"5219e5b1-70d1-4715-a044-4918024af403\",\"tr\":\"98738ca5-4a31-49d2-a006-d871eb3f1fe4\",\"pt-br\":\"caaa8065-9d15-4719-96a4-95629c38b25d\"}",
    "comm100HostUrl": "https://vue.ooooooo2.live",
    "comm100SiteId": "10200007",
    "domainArray":
        "[\"https://www.ltvip2.fun/\",\"https://www.lt168.lol/\",\"https://www.lt99.online/\",\"https://www.lt999.live/\",\"https://www.lt200.xyz/\",\"https://ltvip3.online/\"]",
    "downloadPageUrl": "https://app1.casppxbo.com/",
    "fullNameCountries": "[\"CN\", \"HK\", \"TW\", \"MO\", \"VN\", \"TH\"]",
    "iOSDownloadURL": "https://app1.casppxbo.com/",
    "iOSUpdateInfo": "fix bug",
    "maintenanceContactEmail": "LTgetback@gmail.com",
    "minBuildNO": "20240208.1",
    "noReceivedUrl":
        "help-center/faq/1155417345867845?articleCode=1156348911206469",
    "signalrURL": "https://www.ltvip2.fun/ws",
    "termsUrl": "help-center/faq/1155413151285317?articleCode=1156524497813573",
    "useAuth": "help-center/faq/1029837943259205?articleCode=1155500681969733",
    "asiaCountries": "[\"CN\", \"HK\", \"TW\", \"MO\", \"VN\", \"TH\", \"MY\"]",
    "ignoreEuropeKyc": "0",
    "iosChannelKey":
        "eyJzZXR0aW5nc191cmwiOiJodHRwczovL3FiZXRzdXBwb3J0LnplbmRlc2suY29tL21vYmlsZV9zZGtfYXBpL3NldHRpbmdzLzAxSEUySFc2SlExRzNUU0NROUhYNzRONjRWLmpzb24ifQ==",
    "androidChannelKey":
        "eyJzZXR0aW5nc191cmwiOiJodHRwczovL3FiZXRzdXBwb3J0LnplbmRlc2suY29tL21vYmlsZV9zZGtfYXBpL3NldHRpbmdzLzAxSEUySFI0UEJDQlgzRFpBVlg1MzEyVjMwLmpzb24ifQ==",
    "themeClass": "",
    "x5CoreDownloadDomain": "https://download.yaopan.online",
    "phoneVerifyCryptoDeposit": "true",
    "aliPaySecretRedPacket":
        "Article/23/47/27/638392600677835487/file/638392600677835258.mp4",
    "aliPayH5":
        "Article/23/47/27/638392600314059672/file/638392600314059597.mp4",
    "aliPayTransfer":
        "Article/23/46/27/638392600141117912/file/638392600141117832.mp4",
    "weChatPayTransfer":
        "Article/23/47/27/638392600503714348/file/638392600503714223.mp4",
    "chatEnabled": "false"
  }
};

const merchant2 = {
  "appLogoSun":
      "Merchant/24/19/07/638402123514592271/file/638402123514592177.png",
  "appLogoMoon":
      "Merchant/24/19/07/638402123546945365/file/638402123546945297.png",
  "appBeforeLogoSun":
      "Merchant/24/23/18/638463289842798863/file/638463289842793234.png",
  "appBeforeLogoMoon":
      "Merchant/24/23/18/638463289914016822/file/638463289914016703.png",
  "colorScheme": "sun",
  "maintain": false,
  "maintainTimeEnd": "",
  "defaultAvatarApp": null,
  "startupImg": ["", "", "", ""],
  "openedSocialLogin": ["Google", "Line", "MetaMask", "Telegram"],
  "config": {
    "androidDownloadURL": "https://app.22all.net/mrcat-android.apk",
    "androidUpdateInfo": "fix bug\\n",
    "apiDomain": "https://www.mrcat2022.com/",
    "appResourceUrl": "https://static.dmcddv.cn/",
    "buildNO": "20240513.1",
    "cardCenterLink":
        "help-center/faq/1352283145656005?articleCode=1346512221962373",
    "comm100CampaignIds":
        "{\"en-us\":\"7196cadf-adf5-4184-bfd9-da5a2f10052d\",\"zh-cn\":\"942819d3-77d9-48d9-8212-5da53545edf0\",\"vi\":\"8aefa5af-43af-42ea-9bbd-cdd68db09f71\",\"th\":\"942819d3-77d9-48d9-8212-5da53545edf0\"}",
    "comm100HostUrl": "https://vue.ooooooo2.live",
    "comm100SiteId": "10200008",
    "domainArray":
        "[\"https://www.mcat188.app/\",\"https://www.mcat168.app/\",\"https://www.mrcat2022.com/\",\"https://www.mxspro.vip/\",\"https://www.mxs12.com/\",\"https://www.mrt16.com/\",\"https://www.mrcatgo.one/\",\"https://www.mct188.vip/\"]",
    "downloadPageUrl": "https://app2.casppxbo.com/",
    "fullNameCountries": "[\"CN\", \"HK\", \"TW\", \"MO\", \"VN\", \"TH\"]",
    "iOSDownloadURL": "https://app2.casppxbo.com/",
    "iOSUpdateInfo": "fix bug\\n",
    "maintenanceContactEmail": "cs@mrcat.com",
    "minBuildNO": "20240208.1",
    "noReceivedUrl":
        "help-center/faq/1352304028194501?articleCode=1346512103374985",
    "signalrURL": "https://www.mrcat2022.com/ws",
    "termsUrl": "help-center/faq/1346512219685001?articleCode=1346512235004041",
    "useAuth": "help-center/faq/1352281766235973?articleCode=1346512304341129",
    "referralFriend": "referral/home",
    "themeClass": "",
    "x5CoreDownloadDomain": "https://download.yaopan.online",
    "phoneVerifyCryptoDeposit": "false",
    "aliPaySecretRedPacket":
        "Article/23/47/27/638392600677835487/file/638392600677835258.mp4",
    "aliPayH5":
        "Article/23/47/27/638392600314059672/file/638392600314059597.mp4",
    "aliPayTransfer":
        "Article/23/46/27/638392600141117912/file/638392600141117832.mp4",
    "weChatPayTransfer":
        "Article/23/47/27/638392600503714348/file/638392600503714223.mp4",
    "chatEnabled": "false"
  }
};

final merchant5 = {
  "appLogoSun":
      "Merchant/24/32/13/638459119633078082/file/638459119633077973.png",
  "appLogoMoon":
      "Merchant/24/32/13/638459119660731465/file/638459119660731369.png",
  "appBeforeLogoSun":
      "Merchant/24/25/18/638463291084080951/file/638463291084075436.png",
  "appBeforeLogoMoon":
      "Merchant/24/25/18/638463291162432431/file/638463291162432322.png",
  "colorScheme": "sun",
  "maintain": false,
  "maintainTimeEnd": "",
  "defaultAvatarApp": null,
  "startupImg": ["", "", "", ""],
  "openedSocialLogin": ["Google", "Line", "MetaMask", "Telegram"],
  "config": {
    "apiDomain": "https://www.letou300.xyz/",
    "signalrURL": "https://www.letou300.xyz/ws",
    "buildNO": "20240513.1",
    "minBuildNO": "20240208.1",
    "iOSUpdateInfo": "优化用户体验\\n修复bug\\n",
    "iOSDownloadURL": "https://app5.casppxbo.com/",
    "androidUpdateInfo": "优化用户体验\\n修复bug\\n",
    "androidDownloadURL": "https://app.22all.net/letou-android.apk",
    "comm100SiteId": "10200007",
    "comm100CampaignIds":
        "{\"en-us\": \"1b8861a5-2937-4791-88d6-d31f8bf2b112\",\"zh-cn\": \"07ef8535-c278-4337-9096-5504f3426250\",\"vi\": \"0d75b903-c550-4124-a378-da08f6242a8d\",\"th\": \"cb99d091-b619-4b9e-9ce0-044901118454\"}",
    "termsUrl": "help-center/faq/1474378077192329?articleCode=1474378084647049",
    "cardCenterLink":
        "help-center/faq/1474378077192329?articleCode=1474378080960649",
    "useAuth": "help-center/faq/1486574819414725?articleCode=1474378145398917",
    "downloadPageUrl": "https://app5.casppxbo.com/",
    "appResourceUrl": "https://static.dmcddv.cn/",
    "maintenanceContactEmail": "cs@letou.me",
    "noReceivedUrl":
        "help-center/faq/1486576279311941?articleCode=1474377969287305",
    "ignoreGt": "0",
    "fullNameCountries":
        "[\"CN\", \"HK\", \"TW\", \"MO\", \"VN\", \"TH\", \"MY\"]",
    "comm100HostUrl": "https://vue.ooooooo2.live",
    "domainArray":
        "[\"https://www.letou9.vip/\",\"https://www.letou300.xyz/\",\"https://www.letouvip.website/\",\"https://www.letouvip.space/\",\"https://www.letou1.vip/\",\"https://www.letouvip2.online/\",\"https://www.letou3.vip/\",\"https://www.letou6.xyz/\"]",
    "referralFriend": "referral/home",
    "asiaCountries": "[\"CN\", \"HK\", \"TW\", \"MO\", \"VN\", \"TH\", \"MY\"]",
    "themeClass": "",
    "x5CoreDownloadDomain": "https://download.yaopan.online",
    "aliPaySecretRedPacket":
        "Article/23/47/27/638392600677835487/file/638392600677835258.mp4",
    "aliPayH5":
        "Article/23/47/27/638392600314059672/file/638392600314059597.mp4",
    "aliPayTransfer":
        "Article/23/46/27/638392600141117912/file/638392600141117832.mp4",
    "weChatPayTransfer":
        "Article/23/47/27/638392600503714348/file/638392600503714223.mp4",
    "chatEnabled": "false"
  }
};

class MerchantService {
  factory MerchantService() => _getInstance();

  static MerchantService get sharedInstance => _getInstance();

  static MerchantService? _instance;

  static const _cacheKey = 'merchant_service_cache_key';
  static final flutter_cache.BaseCacheManager _cacheManager =
      flutter_cache.DefaultCacheManager();

  static MerchantService _getInstance() {
    _instance ??= MerchantService._internal();
    return _instance!;
  }

  MerchantService._internal();

  MerchantConfigModel? _merchantConfigModel;
  MerchantConfigModel? get merchantConfigModel => _merchantConfigModel;

  Stream<MerchantConfigModel?> getMerchantConfig({bool force = false}) {
    if (force == true || _merchantConfigModel == null) {
      final Completer<MerchantConfigModel> completer = Completer();

      int requestCount = 0;

      Rx.combineLatestList(List.generate(
          Config.sharedInstance.environment.configUrlNum, (index) {
        return realGetMerchantConfig(index: index).flatMap((value) {
          if (value != null) {
            return Stream.value(value);
          }
          // 没有数据返回错误
          throw UnsupportedError('getMerchantConfig 没有数据');
        }).doOnData((event) {
          if (!completer.isCompleted) {
            completer.complete(event);
          }
        }).doOnError((p0, p1) {
          requestCount++;
        });
      })).doOnError((p0, p1) {
        // doOnError 会在每次Stream结束就调用，所以这里需要判断一下
        if (requestCount == Config.sharedInstance.environment.configUrlNum) {
          log('没数据，所有域名用完了，去读取缓存', name: 'MerchantService');
          getCacheConfig().asStream().flatMap((value) {
            final bool readCache = value != null;
            late MerchantConfigModel data;
            if (value == null) {
              data = getLocalConfig();
            } else {
              data = value;
            }
            Sentry.captureException(GetAllMerchantConfigError(
              Config.sharedInstance.environment.merchantConfigUrlList(),
              readCache,
            ));
            return Stream.value(data);
          }).doOnData((event) {
            if (!completer.isCompleted) {
              completer.complete(event);
            }
          }).listen(null, onError: (errr) {});
        }
      }).listen(null, onError: (err) {});

      // 返回StreamController的Stream
      return completer.future.asStream();
    } else {
      // 直接返回已有的配置
      return Stream.value(_merchantConfigModel!);
    }
  }

  Stream<MerchantConfigModel?> realGetMerchantConfig({int index = 0}) {
    return Stream.fromFuture(_getConfigFromServerResponse(index: index))
        .flatMap((value) {
      if (value is MerchantConfigModel) {
        return Stream.value(_storeMerchant(value));
      } else {
        // 请求失败或者返回null，发出null值的事件
        return Stream.value(null);
      }
    });
  }

  /// 读取本地维护的商户配置文件
  MerchantConfigModel getLocalConfig() {
    final merchantMap = {"1": merchant1, "18": merchant2, "21": merchant2};
    final merchantData =
        merchantMap[Config.tenantId] ?? merchantMap.values.first;
    MerchantConfigModel model = MerchantConfigModel.fromJson(merchantData);
    return model;
  }

  Future<MerchantConfigModel?> getCacheConfig() async {
    try {
      flutter_cache.FileInfo? file =
          await _cacheManager.getFileFromCache(_cacheKey);
      if (file == null) {
        return null;
      }
      String? jsonStr = await file.file.readAsString();
      if (jsonStr.isEmpty) return null;
      MerchantConfigModel model = MerchantConfigModel.fromJson(
          json.decode(jsonStr) as Map<String, dynamic>);
      return _storeMerchant(model);
    } catch (_) {
      return null;
    }
  }

  void setCacheConfig(Map<String, dynamic>? json) async {
    if (json == null) return;
    final jsonStr = jsonEncode(json);
    await _cacheManager.putFile(
        _cacheKey, Uint8List.fromList(utf8.encode(jsonStr)));
  }

  Future<MerchantConfigModel?> _getConfigFromServerResponse(
      {int index = 0}) async {
    String configUrl =
        Config.sharedInstance.environment.merchantConfigUrl(index: index);
    String parameter = 'timestamp=${DateTime.now().millisecondsSinceEpoch}';
    configUrl = UrlTool.addParameterToUrl(configUrl, parameter);
    final dio = Dio(
      BaseOptions(
        connectTimeout: 10000,
        receiveTimeout: 5000,
        // contentType: Headers.jsonContentType,
        // responseType: ResponseType.plain,
      ),
    );
    dio.interceptors.add(GGFailedInterceptor(
      errorCode: SpecialApiErrorCode.merchant.code,
    ));
    return dio.get<String>(configUrl).then((value) {
      if (value.data != null) {
        log('$configUrl ===> 有数据', name: 'MerchantService');
        setCacheConfig(json.decode(value.data!) as Map<String, dynamic>);
        return MerchantConfigModel.fromJson(
            json.decode(value.data!) as Map<String, dynamic>);
      } else {
        log('$configUrl ===> 无数据', name: 'MerchantService');
        // Sentry.captureException(MerchantConfigEmpty(configUrl));
        return null;
      }
    }).catchError((Object? e) {
      log('$configUrl ===> 请求失败', name: 'MerchantService');
      // Sentry.captureException(GetMerchantConfigError(configUrl, e));
      return null;
    });
  }

  MerchantConfigModel _storeMerchant(MerchantConfigModel model) {
    _merchantConfigModel = model;
    if (model.config?.apiDomain?.isNotEmpty ?? false) {
      Config.sharedInstance.updateApiUrl(model.config!.apiDomain!);
    }

    if (model.config?.signalrURL?.isNotEmpty ?? false) {
      Config.sharedInstance.updateSignalrUrl(model.config!.signalrURL!);
    }

    if (model.config?.appResourceUrl?.isNotEmpty ?? false) {
      Config.sharedInstance.updateResourceDoamin(model.config!.appResourceUrl!);
    }

    if (model.colorScheme != null) {
      ThemeManager.shareInstacne.defaultTheme =
          model.colorScheme! == 'sun' ? ThemeMode.light : ThemeMode.dark;
    }

    if (model.openedSocialLogin?.isNotEmpty == true) {
      OAuthService.sharedInstance.updateMethod(model.openedSocialLogin!);
    }

    if (model.config?.x5CoreDownloadDomain?.isNotEmpty == true) {
      X5CoreService.sharedInstance
          .updateDownloadDomain(model.config!.x5CoreDownloadDomain!);
    }
    return _merchantConfigModel!;
  }
}
