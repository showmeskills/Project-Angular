import 'dart:math';

import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/config/config.dart';

import 'package:gogaming_app/common/utils/util.dart';

import 'gaming_preference_model.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingUserModel {
  GamingUserModel({
    this.uid,
    this.userName,
    this.isBindMobile,
    this.areaCode,
    this.mobile,
    this.mobileRegionCode,
    this.avater,
    this.isBindGoogleValid,
    this.isBindEmail,
    this.lastLoginTime,
    this.lastLoginIp,
    this.token,
    this.hasWhiteList,
    this.email,
    this.address,
    this.hasPassword,
    this.appBiometricKey,
    this.isVip,
    this.isSVip,
    this.vipGrade,
    this.vipGroupName,
    this.kycGrade,
    this.kycName,
    this.userSetting,
    this.isEurope,
  });

  factory GamingUserModel.fromJson(Map<String, dynamic> json) =>
      GamingUserModel(
        uid: asT<String?>(json['uid']),
        userName: asT<String?>(json['userName']),
        isBindMobile: asT<bool?>(json['isBindMobile']),
        areaCode: asT<String?>(json['areaCode']),
        mobile: asT<String?>(json['mobile']),
        mobileRegionCode: asT<String?>(json['mobileRegionCode']),
        avater: asT<String?>(json['avater']),
        isBindGoogleValid: asT<bool?>(json['isBindGoogleValid']),
        isBindEmail: asT<bool?>(json['isBindEmail']),
        lastLoginTime: asT<int?>(json['lastLoginTime']),
        lastLoginIp: asT<String?>(json['lastLoginIp']),
        token: asT<String?>(json['token']),
        hasWhiteList: asT<bool?>(json['hasWhiteList']),
        isEurope: asT<bool?>(json['isEurope']),
        email: asT<String?>(json['email']),
        address: asT<String?>(json['address']),
        hasPassword: GGUtil.parseBool(json['hasPassword']),
        appBiometricKey: asT<String?>(json['appBiometricKey']),
        isVip: asT<bool?>(json['isVip']),
        isSVip: asT<bool?>(json['isSvip']),
        vipGroupName: asT<String?>(json['vipGroupName']),
        vipGrade: asT<int?>(json['viPGrade']),
        kycGrade: asT<String?>(json['kycGrade']),
        kycName: asT<String?>(json['kycName']),
        userSetting: json['userSetting'] is Map
            ? GamingPreferenceModel.fromJson(
                json['userSetting'] as Map<String, dynamic>)
            : null,
      );

  String? uid;

  /// 用户名
  String? userName;

  /// 是否绑定手机
  bool? isBindMobile;

  /// 手机区号
  String? areaCode;

  /// 手机号码
  String? mobile;

  /// 手机区域Code
  String? mobileRegionCode;

  /// 头像地址
  String? avater;

  /// 是否绑定谷歌验证码
  bool? isBindGoogleValid;

  /// 是否绑定邮箱
  bool? isBindEmail;

  /// 最近一次登录时间（时间戳）
  int? lastLoginTime;

  /// 最后一次登录IP
  String? lastLoginIp;

  /// 是否开启提款白名单
  bool? hasWhiteList;

  /// 判断归属洲
  bool? isEurope;

  /// 用户token
  String? token;

  /// 用户绑定的邮箱
  String? email;

  ///地址
  String? address;

  ///是否有密码
  bool? hasPassword;

  /// 生物识别key
  String? appBiometricKey;

  /// 是否是vip
  bool? isVip;

  /// 是否是svip
  bool? isSVip;

  /// vip等级
  int? vipGrade;

  /// vipc 等级分组名称
  String? vipGroupName;

  /// kyc等级
  String? kycGrade;

  /// kyc名称
  String? kycName;

  /// 用户设置
  GamingPreferenceModel? userSetting;

  bool get secure {
    return (isBindGoogleValid ?? false) ||
        (isBindMobile ?? false) ||
        (isBindEmail ?? false);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'uid': uid,
        'userName': userName,
        'isBindMobile': isBindMobile,
        'areaCode': areaCode,
        'mobile': mobile,
        'mobileRegionCode': mobileRegionCode,
        'avater': avater,
        'isBindGoogleValid': isBindGoogleValid,
        'isBindEmail': isBindEmail,
        'lastLoginTime': lastLoginTime,
        'lastLoginIp': lastLoginIp,
        'hasWhiteList': hasWhiteList,
        'token': token,
        'email': email,
        'address': address,
        'hasPassword': hasPassword,
        'appBiometricKey': appBiometricKey,
        'isVip': isVip,
        'isSvip': isSVip,
        'viPGrade': vipGrade,
        'vipGroupName': vipGroupName,
        'kycGrade': kycGrade,
        'kycName': kycName,
        'userSetting': userSetting?.toJson(),
        'isEurope': isEurope,
      };

  bool get isAvatarLocalPath {
    return avater?.startsWith('avatar-') == true;
  }

  String get avatarLocalPath {
    return defaultAvatar(avater);
  }

  static String defaultAvatar(String? avater) {
    const Map<String, String> defaultAvatarAssetPathMap = {
      "avatar-1": "assets/images/preferences/avatar_1.png",
      "avatar-2": "assets/images/preferences/avatar_2.png",
      "avatar-3": "assets/images/preferences/avatar_3.png",
      "avatar-4": "assets/images/preferences/avatar_4.png",
      "avatar-5": "assets/images/preferences/avatar_5.png",
      // "avatar-6": "assets/preferences/avatar_7141.png",
    };
    String result = defaultAvatarAssetPathMap[avater] ??
        defaultAvatarAssetPathMap.values.first;
    final defaultAvatarApp =
        MerchantService().merchantConfigModel?.defaultAvatarApp;
    // avater = "avatar-21";
    if (defaultAvatarApp is List && defaultAvatarApp?.isNotEmpty == true) {
      int index = int.tryParse(avater?.replaceAll('avatar-', '') ?? '1') ?? 1;
      // 防止数组越界
      index = max(0, index - 1);
      index = min(index, defaultAvatarApp!.length - 1);
      final address = defaultAvatarApp[index];
      result = '${Config.currentConfig.resourceDomain}$address';
    }
    return result;
  }
}
