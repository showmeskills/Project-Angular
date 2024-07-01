import 'dart:convert';

import 'feedback_enums.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingFeedbackDetail {
  GamingFeedbackDetail({
    this.id,
    this.feedbackType,
    this.productType,
    this.clientType,
    this.languageCode,
    this.device,
    this.version,
    this.title,
    this.detail,
    this.url,
    this.urlList,
    this.createdTime,
  });

  factory GamingFeedbackDetail.fromJson(Map<String, dynamic> json) {
    final List<String>? clientType =
        json['clientType'] is List ? <String>[] : null;
    if (clientType != null) {
      for (final dynamic item in json['clientType'] as List) {
        if (item != null) {
          clientType.add(asT<String>(item)!);
        }
      }
    }

    final List<String>? urlList = json['urlList'] is List ? <String>[] : null;
    if (urlList != null) {
      for (final dynamic item in json['urlList'] as List) {
        if (item != null) {
          urlList.add(asT<String>(item)!);
        }
      }
    }
    return GamingFeedbackDetail(
      id: asT<int?>(json['id']),
      feedbackType: FeedbackType.c(json['feedbackType']?.toString() ?? ''),
      productType: asT<String?>(json['productType']),
      clientType: clientType,
      languageCode: asT<String?>(json['languageCode']),
      device: asT<String?>(json['device']),
      version: asT<String?>(json['version']),
      title: asT<String?>(json['title']),
      detail: asT<String?>(json['detail']),
      url: asT<String?>(json['url']),
      urlList: urlList,
      createdTime: asT<int?>(json['createdTime']),
    );
  }

  int? id;
  FeedbackType? feedbackType;
  String? productType;
  List<String>? clientType;
  String? languageCode;
  String? device;
  String? version;
  String? title;
  String? detail;
  String? url;
  List<String>? urlList;
  int? createdTime;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'feedbackType': feedbackType,
        'productType': productType,
        'clientType': clientType,
        'languageCode': languageCode,
        'device': device,
        'version': version,
        'title': title,
        'detail': detail,
        'url': url,
        'urlList': urlList,
        'createdTime': createdTime,
      };
}
