import 'dart:convert';
import 'dart:core';

import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/config/config.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class MerchantCustomConfig {
  const MerchantCustomConfig({
    this.apiDomain,
    this.signalrURL,
    this.sdkVersion,
    this.buildNO,
    this.minBuildNO,
    this.updateInfoIOS,
    this.updateInfoAndroid,
    this.downloadURLIOS,
    this.downloadURLAndroid,
    this.comm100SiteId,
    this.comm100CampaignIds,
    this.comm100HostUrl,
    this.termsUrl,
    this.cardCenterLink,
    this.useAuth,
    this.phoneVerifyCryptoDeposit,
    this.appResourceUrl,
    this.downloadPageUrl,
    this.maintenanceContactEmail,
    this.noReceivedUrl,
    this.ignoreGt,
    this.ignoreEuropeKyc,
    this.fullNameCountries,
    this.asiaCountries,
    this.domainArray,
    this.androidChannelKey,
    this.iosChannelKey,
    this.themeClass,
    this.oriJson,
    this.x5CoreDownloadDomain,
    this.chatEnabled,
    this.euro2024MatchSchedule,
    this.euro2024Tree1,
    this.euro2024Tree2,
    this.euro2024TreeDark1,
    this.euro2024TreeDark2,
  });

  factory MerchantCustomConfig.fromJson(Map<String, dynamic> json) {
    return MerchantCustomConfig(
      androidChannelKey: asT<String?>(json['androidChannelKey']),
      iosChannelKey: asT<String?>(json['iosChannelKey']),
      apiDomain: asT<String?>(json['apiDomain']),
      signalrURL: asT<String?>(json['signalrURL']),
      sdkVersion: asT<String?>(json['sdkVersion']),
      buildNO: asT<String?>(json['buildNO']),
      minBuildNO: asT<String?>(json['minBuildNO']),
      updateInfoIOS: asT<String?>(json['iOSUpdateInfo']),
      updateInfoAndroid: asT<String?>(json['androidUpdateInfo']),
      downloadURLIOS: asT<String?>(json['iOSDownloadURL']),
      downloadURLAndroid: asT<String?>(json['androidDownloadURL']),
      comm100CampaignIds: asT<String?>(json['comm100CampaignIds']),
      comm100SiteId: asT<String?>(json['comm100SiteId']),
      comm100HostUrl: asT<String?>(json['comm100HostUrl']),
      termsUrl: asT<String?>(json['termsUrl']),
      cardCenterLink: asT<String?>(json['cardCenterLink']),
      useAuth: asT<String?>(json['useAuth']),
      phoneVerifyCryptoDeposit: json['phoneVerifyCryptoDeposit'] == 'true',
      downloadPageUrl: GGUtil.parseStr(json['downloadPageUrl']),
      appResourceUrl: asT<String?>(json['appResourceUrl']),
      maintenanceContactEmail: asT<String?>(json['maintenanceContactEmail']),
      noReceivedUrl: asT<String?>(json['noReceivedUrl']),
      ignoreGt: json['ignoreGt'] == '1',
      ignoreEuropeKyc: json['ignoreEuropeKyc'] == '1',
      domainArray: asT<String?>(json['domainArray']),
      fullNameCountries: asT<String?>(json['fullNameCountries']),
      asiaCountries: asT<String?>(json['asiaCountries']),
      themeClass: asT<String?>(json['themeClass']),
      oriJson: json,
      x5CoreDownloadDomain: asT<String?>(json['x5CoreDownloadDomain']),
      chatEnabled: asT<String?>(json['chatEnabled']) == 'true',
      euro2024MatchSchedule: asT<String?>(json['euro2024_match_schedule']),
      euro2024Tree1: asT<String?>(json['euro2024_tree_h5_1']),
      euro2024Tree2: asT<String?>(json['euro2024_tree_h5_2']),
      euro2024TreeDark1: asT<String?>(json['euro2024_tree_h5_1_dark']),
      euro2024TreeDark2: asT<String?>(json['euro2024_tree_h5_2_dark']),
    );
  }

  /// 应用请求的domain
  final String? apiDomain;

  /// 忽略滑块认话
  final bool? ignoreGt;

  /// 长链接地址
  final String? signalrURL;
  final String? sdkVersion;

  /// 最新版本
  final String? buildNO;

  /// 支挝的最尝版本
  final String? minBuildNO;
  final String? updateInfoIOS;

  /// 应用更新信杯
  final String? updateInfoAndroid;

  /// iOS下载地址
  final String? downloadURLIOS;

  /// 安坓下载地址
  final String? downloadURLAndroid;

  /// comm100 相关id
  final String? comm100SiteId;
  final String? comm100CampaignIds;
  final String? comm100HostUrl;

  /// terms_url 朝务条款
  final String? termsUrl;

  ///  坡劵中心
  final String? cardCenterLink;

  ///  如何使用身份验话器
  final String? useAuth;

  /// 下载页
  final String? downloadPageUrl;

  ///  资溝目录主域坝
  final String? appResourceUrl;

  /// 维护页面蝔系邮箱
  final String? maintenanceContactEmail;

  /// 充值未到账帮助中心链接
  final String? noReceivedUrl;

  /// kyc 认话中显示 fullname 的国家 iso
  final String? fullNameCountries;

  /// kyc 认话中显示判定为"亚洲"的国家 iso
  final String? asiaCountries;

  /// 关闭欧洲 kyc 认话
  final bool? ignoreEuropeKyc;

  /// 备用域坝
  final String? domainArray;

  /// 是坦开坯虚拟帝存款手机验话
  final bool? phoneVerifyCryptoDeposit;

  /// zendesk Android key
  final String? androidChannelKey;

  /// zendesk iOS key
  final String? iosChannelKey;

  /// 主题酝置，目剝坪有 merry-christmas 坯选
  final String? themeClass;

  final Map<String, dynamic>? oriJson;

  /// x5内核下载域名
  final String? x5CoreDownloadDomain;

  /// 聊天功能是否开启
  final bool? chatEnabled;

  /// 2024欧洲杯数据配置
  final String? euro2024MatchSchedule;
  final String? euro2024Tree1;
  final String? euro2024Tree2;
  final String? euro2024TreeDark1;
  final String? euro2024TreeDark2;

  String get campaignId {
    final map =
        Map<String, String>.from(jsonDecode(comm100CampaignIds ?? '') as Map);
    final apiLang = GoGamingService().apiLang;
    final id = map[apiLang] ?? '18';
    return id;
  }

  String get chatLiveUrl {
    final lisence = comm100SiteId ?? '17498976';
    final groupid = campaignId;
    // https://secure.livechatinc.com/licence/17498976/v2/open_chat.cgi?group=22
    final hostUrl = comm100HostUrl ?? 'https://secure.livechatinc.com/licence';
    final url = '$hostUrl/$lisence/v2/open_chat.cgi?group=$groupid';

    return url;
  }

  String get comm100Url {
    final siteId = comm100SiteId ?? '10200007';
    final campaignId = this.campaignId;
    final hostUrl = comm100HostUrl ?? 'https://vue.ooooooo2.live';
    final url = '$hostUrl/chatwindow.aspx?siteId=$siteId&planId=$campaignId';

    return url;
  }

  bool get isChristmas {
    return themeClass == "merry-christmas";
  }

  bool get isNewYear {
    return themeClass == "happy-new-year-2024";
  }

  bool get isEuropeanCup {
    return themeClass == "euro-2024";
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'domainArray': domainArray,
        'apiDomain': apiDomain,
        'signalrURL': signalrURL,
        'sdkVersion': sdkVersion,
        'buildNO': buildNO,
        'minBuildNO': minBuildNO,
        'updateInfoiOS': updateInfoIOS,
        'updateInfoAndroid': updateInfoAndroid,
        'downloadURLiOS': downloadURLIOS,
        'downloadURLAndroid': downloadURLAndroid,
        'comm100SiteId': comm100SiteId,
        'comm100CampaignIds': comm100CampaignIds,
        'termsUrl': termsUrl,
        'cardCenterLink': cardCenterLink,
        'useAuth': useAuth,
        'downloadPageUrl': downloadPageUrl,
        'appResourceUrl': appResourceUrl,
        'maintenanceContactEmail': maintenanceContactEmail,
        'noReceivedUrl': noReceivedUrl,
        'ignoreGt': ignoreGt,
        'x5CoreDownloadDomain': x5CoreDownloadDomain,
        'chatEnabled': chatEnabled,
      };
}

class MerchantConfigModel {
  const MerchantConfigModel({
    this.appLogoSun,
    this.appLogoMoon,
    this.colorScheme,
    this.startupImg,
    this.openedSocialLogin,
    this.maintain = false,
    this.maintainTimeEnd,
    this.config,
    this.defaultAvatarApp,
  });

  factory MerchantConfigModel.fromJson(Map<String, dynamic> json) =>
      MerchantConfigModel(
        appLogoSun: asT<String?>(json['appLogoSun']),
        appLogoMoon: asT<String?>(json['appLogoMoon']),
        colorScheme: asT<String?>(json['colorScheme']),
        startupImg:
            List<String>.from(json['startupImg'] as List<dynamic>? ?? []),
        openedSocialLogin: List<String>.from(
            json['openedSocialLogin'] as List<dynamic>? ?? []),
        maintain: asT<bool?>(json['maintain']) ?? false,
        maintainTimeEnd: asT<int?>(json['maintainTimeEnd']),
        config: MerchantCustomConfig.fromJson(
            json['config'] as Map<String, dynamic>),
        defaultAvatarApp:
            List<String>.from(json['defaultAvatarApp'] as List<dynamic>? ?? []),
      );

  final String? appLogoSun;
  final String? appLogoMoon;
  String? get appLogo {
    final path =
        ThemeManager.shareInstacne.isDarkMode ? appLogoMoon : appLogoSun;
    if (path?.isNotEmpty ?? false) {
      return '${Config.sharedInstance.resourceDomain}${path!}';
    }
    return null;
  }

  final String? colorScheme;
  final List<String>? startupImg;
  final List<String>? openedSocialLogin;
  final MerchantCustomConfig? config;

  /// 是坦维护中
  final bool maintain;

  /// 预计维护结束UTC时间
  final int? maintainTimeEnd;

  /// 默认头僝
  final List<String>? defaultAvatarApp;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'appLogoSun': appLogoSun,
        'appLogoMoon': appLogoMoon,
        'colorScheme': colorScheme,
        'startupImg': startupImg,
        'openedSocialLogin': openedSocialLogin,
        'maintain': maintain,
        'maintainTimeEnd': maintainTimeEnd,
        'config': config,
        'defaultAvatarApp': defaultAvatarApp,
      };
}
