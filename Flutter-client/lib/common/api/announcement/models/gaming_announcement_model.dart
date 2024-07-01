// ignore_for_file: public_member_api_docs, sort_constructors_first

import 'package:gogaming_app/common/service/web_url_service/web_url_model.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';

class GamingAnnouncementModel {
  final int id;
  final String articleCode;
  final String title;
  final int categoryParentId;
  final int categoryId;
  final int? releaseTime;

  String get webUrl {
    String str = WebUrlService.url(
        WebUrl.helpCenterArticle.toTarget(input: ['$categoryParentId', '$id']));
    return str;
  }

  GamingAnnouncementModel({
    required this.id,
    this.articleCode = '',
    this.title = '',
    this.categoryParentId = 0,
    this.categoryId = 0,
    this.releaseTime,
  });

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'articleCode': articleCode,
      'title': title,
      'categoryParentId': categoryParentId,
      'categoryId': categoryId,
      'releaseTime': releaseTime,
    };
  }

  factory GamingAnnouncementModel.fromJson(Map<String, dynamic> map) {
    return GamingAnnouncementModel(
      id: map['id'] as int,
      articleCode: map['articleCode'] as String? ?? '',
      title: (map['title'] ?? '') as String,
      categoryParentId: (map['categoryParentId'] ?? 0) as int,
      categoryId: (map['categoryId'] ?? 0) as int,
      releaseTime: map['releaseTime'] as int?,
    );
  }
}
