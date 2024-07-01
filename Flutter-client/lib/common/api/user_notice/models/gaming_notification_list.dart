import 'dart:convert';

import 'package:gogaming_app/common/tools/date_tool.dart';
import 'package:gogaming_app/common/utils/util.dart';

enum BusinessType {
  // 异常会员补充审核不通过
  abnormalMemberSupplementNoApproved('AbnormalMemberSupplementNoApproved'),
  // 风控评估问卷补充资料
  riskAssessmentCreate('RiskAssessmentCreate'),
  // 风控评估问卷审核不通过
  riskAssessmentNoApproved('RiskAssessmentNoApproved'),
  // 财富来源证明补充资料
  wealthSourceCreate('WealthSourceCreate'),
  // 财富来源证明审核不通过
  wealthSourceNoApproved('WealthSourceNoApproved'),
  // 补充文件审核不通过
  idVerificationNoApproved('IDVerificationNoApproved'),
  // 补充文件
  idVerification('IDVerification'),
  // 欧洲kyc高级邀请
  kycAdvancedForEuCreate('KycAdvancedForEuCreate');

  const BusinessType(this.value);
  final String value;
}

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingNotificationList {
  GamingNotificationList({
    this.total,
    this.list,
  });

  factory GamingNotificationList.fromJson(Map<String, dynamic> json) {
    final List<GamingNotificationItem>? list =
        json['list'] is List ? <GamingNotificationItem>[] : null;
    if (list != null) {
      for (final dynamic item in json['list'] as List) {
        if (item != null) {
          list.add(GamingNotificationItem.fromJson(
              asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GamingNotificationList(
      total: asT<int?>(json['total']),
      list: list,
    );
  }

  int? total;
  List<GamingNotificationItem>? list;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'total': total,
        'list': list,
      };
}

class GamingNotificationItem {
  GamingNotificationItem({
    this.id,
    this.noticeType,
    this.businessType,
    this.title,
    this.content,
    this.sendTime,
    this.isReaded,
    this.readedTime,
  });

  factory GamingNotificationItem.fromJson(Map<String, dynamic> json) =>
      GamingNotificationItem(
        id: asT<int?>(json['id']),
        noticeType: asT<String?>(json['noticeType']),
        businessType: asT<String?>(json['businessType']),
        title: asT<String?>(json['title']),
        content: asT<String?>(json['content']),
        sendTime: asT<int?>(json['sendTime']),
        isReaded: asT<bool?>(json['isReaded']),
        readedTime: asT<int?>(json['readedTime']),
      );

  int? id;
  String? noticeType;
  String? businessType;
  String? title;
  String? content;
  int? sendTime;
  bool? isReaded;
  int? readedTime;

  // 是否展示立即前往
  // TODO: 注释掉风控相关的业务
  bool get showGoNow {
    //  businessType ==
    //           BusinessType.abnormalMemberSupplementNoApproved.value ||
    //       businessType == BusinessType.riskAssessmentCreate.value ||
    //       businessType == BusinessType.riskAssessmentNoApproved.value ||
    //       businessType == BusinessType.wealthSourceCreate.value ||
    //       businessType == BusinessType.wealthSourceNoApproved.value ||
    return businessType == BusinessType.idVerification.value ||
        businessType == BusinessType.idVerificationNoApproved.value ||
        businessType == BusinessType.kycAdvancedForEuCreate.value;
  }

  String get getTime {
    return DateTool.timeAgo(DateTime.fromMillisecondsSinceEpoch(sendTime ?? 0));
  }

  // 接口返回的content可能是html标签，改成普通文本。图片用[image]代表
  String get defaultContent {
    if (GGUtil.parseStr(content).isEmpty) return '';
    RegExp exp = RegExp(r"<img[^>]*?>", multiLine: true, caseSensitive: false);
    String filteredContent =
        content!.replaceAll(exp, "[image]").replaceAll(RegExp(r"<[^>]*>"), "");
    return filteredContent;
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'noticeType': noticeType,
        'businessType': businessType,
        'title': title,
        'content': content,
        'sendTime': sendTime,
        'isReaded': isReaded,
        'readedTime': readedTime,
      };
}
