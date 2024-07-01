import 'dart:ui';

import 'package:intl/intl.dart';

import 'gg_kyc_power_limit.dart';
import 'gg_kyc_status.dart';

class GGKycLevelModel {
  String status;
  List<KycIconTitle> requires;
  List<KycPowerAndLimits> powerAndLimits;
  KycLevelBanner banner;

  /// 预计审核时间
  String reviewTime;

  ///开始认证时间
  int? verificationCreateTime;

  /// 上一级认证是否通过
  bool isPreLevelPass = true;

  bool get isPass => status == KycVerifyStatus.passed;

  bool get isReject => status == KycVerifyStatus.reject;

  bool get isPending => status == KycVerifyStatus.pending;

  String get pendingTime {
    if (verificationCreateTime != null) {
      var date = DateTime.fromMillisecondsSinceEpoch(verificationCreateTime!);
      var format = DateFormat('yyyy-MM-dd');
      return '${format.format(date)}(UTC)';
    } else {
      return '';
    }
  }

  bool get canGoVerify =>
      isReject || status == KycVerifyStatus.initial || status.isEmpty == true;

  // true;

  GGKycLevelModel(
    this.status,
    this.requires,
    this.powerAndLimits,
    this.banner,
    this.reviewTime, {
    this.verificationCreateTime,
  });
}

class KycLevelBanner {
  String title;
  String? subTitle;
  String rightIconPath;
  Size rightIconSize;

  KycLevelBanner(
      this.title, this.subTitle, this.rightIconPath, this.rightIconSize);
}

class KycIconTitle {
  KycIconTitle({required this.iconPath, required this.title, this.tag});

  final String iconPath;
  final String title;
  final String? tag;
}
