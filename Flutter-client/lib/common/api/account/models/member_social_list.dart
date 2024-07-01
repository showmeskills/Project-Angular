import 'dart:convert';

import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class MemberSocialList {
  MemberSocialList({
    this.areaCode,
    this.mobile,
    this.socialInfoList,
  });

  factory MemberSocialList.fromJson(Map<String, dynamic> json) {
    final List<SocialInfoList>? socialInfoList =
        json['socialInfoList'] is List ? <SocialInfoList>[] : null;
    if (socialInfoList != null) {
      for (final dynamic item in json['socialInfoList'] as List) {
        if (item != null) {
          socialInfoList
              .add(SocialInfoList.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return MemberSocialList(
      areaCode: asT<String?>(json['areaCode']),
      mobile: asT<String?>(json['mobile']),
      socialInfoList: socialInfoList,
    );
  }

  String? areaCode;
  String? mobile;
  List<SocialInfoList>? socialInfoList;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'areaCode': areaCode,
        'mobile': mobile,
        'socialInfoList': socialInfoList,
      };
}

class SocialInfoList {
  SocialInfoList({
    this.socialUserId,
    this.socialUserName,
    this.socialUserType,
  });

  factory SocialInfoList.fromJson(Map<String, dynamic> json) => SocialInfoList(
        socialUserId: asT<String?>(json['socialUserId']),
        socialUserName: asT<String?>(json['socialUserName']),
        socialUserType: asT<String?>(json['socialUserType']),
      );

  String? socialUserId;
  String? socialUserName;
  String? socialUserType;

  bool get isBind {
    return GGUtil.parseStr(socialUserName).isNotEmpty;
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'socialUserId': socialUserId,
        'socialUserName': socialUserName,
        'socialUserType': socialUserType,
      };
}
