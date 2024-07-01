class GamingActivityDetailModel {
  String? activityImgUrl;
  String? detailImgUrl;
  String? bannerImgUrl;
  String? title;
  int? startTime;
  int? endTime;
  String? activeObject;
  String? introduction;
  String? content;
  bool? isJoin;
  bool? isEnroll;
  String? labelCode;

  GamingActivityDetailModel({
    this.activityImgUrl,
    this.detailImgUrl,
    this.bannerImgUrl,
    this.title,
    this.startTime,
    this.endTime,
    this.activeObject,
    this.introduction,
    this.content,
    this.isJoin,
    this.isEnroll,
    this.labelCode,
  });

  @override
  String toString() {
    return 'ActivityDetailModel(activityImgUrl: $activityImgUrl, detailImgUrl: $detailImgUrl, bannerImgUrl: $bannerImgUrl, title: $title, startTime: $startTime, endTime: $endTime, activeObject: $activeObject, introduction: $introduction, content: $content, isJoin: $isJoin, isEnroll: $isEnroll, labelCode: $labelCode)';
  }

  factory GamingActivityDetailModel.fromJson(Map<String, Object?> json) {
    return GamingActivityDetailModel(
      activityImgUrl: json['activityImgUrl'] as String?,
      detailImgUrl: json['detailImgUrl'] as String?,
      bannerImgUrl: json['bannerImgUrl'] as String?,
      title: json['title'] as String?,
      startTime: json['startTime'] as int?,
      endTime: json['endTime'] as int?,
      activeObject: json['activeObject'] as String?,
      introduction: json['introduction'] as String?,
      content: json['content'] as String?,
      isJoin: json['isJoin'] as bool?,
      isEnroll: json['isEnroll'] as bool?,
      labelCode: json['labelCode'] as String?,
    );
  }

  Map<String, Object?> toJson() => {
        'activityImgUrl': activityImgUrl,
        'detailImgUrl': detailImgUrl,
        'bannerImgUrl': bannerImgUrl,
        'title': title,
        'startTime': startTime,
        'endTime': endTime,
        'activeObject': activeObject,
        'introduction': introduction,
        'content': content,
        'isJoin': isJoin,
        'isEnroll': isEnroll,
        'labelCode': labelCode,
      };

  GamingActivityDetailModel copyWith({
    String? activityImgUrl,
    String? detailImgUrl,
    String? bannerImgUrl,
    String? title,
    int? startTime,
    int? endTime,
    String? activeObject,
    String? introduction,
    String? content,
    bool? isJoin,
    bool? isEnroll,
    String? labelCode,
  }) {
    return GamingActivityDetailModel(
      activityImgUrl: activityImgUrl ?? this.activityImgUrl,
      detailImgUrl: detailImgUrl ?? this.detailImgUrl,
      bannerImgUrl: bannerImgUrl ?? this.bannerImgUrl,
      title: title ?? this.title,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      activeObject: activeObject ?? this.activeObject,
      introduction: introduction ?? this.introduction,
      content: content ?? this.content,
      isJoin: isJoin ?? this.isJoin,
      isEnroll: isEnroll ?? this.isEnroll,
      labelCode: labelCode ?? this.labelCode,
    );
  }
}
