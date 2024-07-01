// ignore_for_file: file_names
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';

import '../../../service/web_url_service/web_url_model.dart';

class GamingFaqModel {
  int id;
  String? articleCode;
  String title;
  int? categoryParentId;
  int? categoryId;
  int? releaseTime;

  GamingFaqModel({
    required this.id,
    this.articleCode,
    this.title = '',
    this.categoryParentId,
    this.categoryId,
    this.releaseTime,
  });

  String get webUrl {
    String str = WebUrlService.url(WebUrl.helpCenterFaqArticle
        .toTarget(input: ["$categoryParentId", '$id']));
    return str;
  }

  @override
  String toString() {
    return 'GamingFaqModel(id: $id, articleCode: $articleCode, title: $title, categoryParentId: $categoryParentId, categoryId: $categoryId, releaseTime: $releaseTime)';
  }

  factory GamingFaqModel.fromJson(Map<String, Object?> json) {
    return GamingFaqModel(
      id: json['id'] as int,
      articleCode: json['articleCode'] as String?,
      title: json['title'] as String? ?? '',
      categoryParentId: json['categoryParentId'] as int?,
      categoryId: json['categoryId'] as int?,
      releaseTime: json['releaseTime'] as int?,
    );
  }

  Map<String, Object?> toJson() => {
        'id': id,
        'articleCode': articleCode,
        'title': title,
        'categoryParentId': categoryParentId,
        'categoryId': categoryId,
        'releaseTime': releaseTime,
      };

  GamingFaqModel copyWith({
    int? id,
    String? articleCode,
    String? title,
    int? categoryParentId,
    int? categoryId,
    int? releaseTime,
  }) {
    return GamingFaqModel(
      id: id ?? this.id,
      articleCode: articleCode ?? this.articleCode,
      title: title ?? this.title,
      categoryParentId: categoryParentId ?? this.categoryParentId,
      categoryId: categoryId ?? this.categoryId,
      releaseTime: releaseTime ?? this.releaseTime,
    );
  }
}
