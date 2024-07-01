import 'dart:convert';

import 'feedback_enums.dart';

class GamingFeedbackList {
  GamingFeedbackList({
    required this.total,
    this.list = const [],
  });

  int total;
  List<GamingFeedbackBrief> list;

  factory GamingFeedbackList.fromJson(Map<String, dynamic> json) {
    var value = <dynamic>[];
    if (json["list"] is List) {
      value = json["list"] as List;
    }

    List<GamingFeedbackBrief> list = [];
    for (var i = 0; i < value.length; i++) {
      Map<String, dynamic> b = value[i] as Map<String, dynamic>;
      GamingFeedbackBrief model = GamingFeedbackBrief.fromJson(b);
      list.add(model);
    }

    return GamingFeedbackList(total: asT<int?>(json["total"]) ?? 0, list: list);
  }

  Map<String, dynamic> toJson() => {
        "total": total,
        "list": list,
      };
}

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingFeedbackBrief {
  GamingFeedbackBrief({
    this.id,
    this.title,
    this.feedbackType,
    this.createdTime,
  });

  factory GamingFeedbackBrief.fromJson(Map<String, dynamic> json) =>
      GamingFeedbackBrief(
        id: asT<int?>(json['id']),
        title: asT<String?>(json['title']),
        feedbackType: FeedbackType.c(json['feedbackType']?.toString() ?? ''),
        createdTime: asT<int?>(json['createdTime']),
      );

  int? id;
  String? title;
  FeedbackType? feedbackType;
  int? createdTime;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'title': title,
        'feedbackType': feedbackType,
        'createdTime': createdTime,
      };
}
