class GamingActivityModel {
  String? activitiesNo;
  String? activityImgUrl;
  String? detailImgUrl;
  String? bannerImgUrl;
  String? title;
  String? introduction;
  int sort;
  int? startTime;
  int? endTime;
  bool? isJoin;
  bool? isEnroll;
  String? labelName;
  String? labelCode;

  GamingActivityModel({
    this.activitiesNo,
    this.activityImgUrl,
    this.detailImgUrl,
    this.bannerImgUrl,
    this.title,
    this.introduction,
    this.sort = 0,
    this.startTime,
    this.endTime,
    this.isJoin,
    this.isEnroll,
    this.labelName,
    this.labelCode,
  });

  @override
  String toString() {
    return 'GamingActivityModel(activitiesNo: $activitiesNo, activityImgUrl: $activityImgUrl, detailImgUrl: $detailImgUrl, bannerImgUrl: $bannerImgUrl, title: $title, introduction: $introduction, startTime: $startTime, endTime: $endTime, isJoin: $isJoin, isEnroll: $isEnroll, labelName: $labelName, labelCode: $labelCode)';
  }

  factory GamingActivityModel.fromJson(Map<String, Object?> json) =>
      GamingActivityModel(
        activitiesNo: json['activitiesNo'] as String?,
        activityImgUrl: json['activityImgUrl'] as String?,
        detailImgUrl: json['detailImgUrl'] as String?,
        bannerImgUrl: json['bannerImgUrl'] as String?,
        title: json['title'] as String?,
        introduction: json['introduction'] as String?,
        sort: json['sort'] as int? ?? 0,
        startTime: json['startTime'] as int?,
        endTime: json['endTime'] as int?,
        isJoin: json['isJoin'] as bool?,
        isEnroll: json['isEnroll'] as bool?,
        labelName: json['labelName'] as String?,
        labelCode: json['labelCode'] as String?,
      );

  Map<String, Object?> toJson() => {
        'activitiesNo': activitiesNo,
        'activityImgUrl': activityImgUrl,
        'detailImgUrl': detailImgUrl,
        'bannerImgUrl': bannerImgUrl,
        'title': title,
        'introduction': introduction,
        'sort': sort,
        'startTime': startTime,
        'endTime': endTime,
        'isJoin': isJoin,
        'isEnroll': isEnroll,
        'labelName': labelName,
        'labelCode': labelCode,
      };

  GamingActivityModel copyWith({
    String? activitiesNo,
    String? activityImgUrl,
    String? detailImgUrl,
    String? bannerImgUrl,
    String? title,
    String? introduction,
    int? sort,
    int? startTime,
    int? endTime,
    bool? isJoin,
    bool? isEnroll,
    String? labelName,
    String? labelCode,
  }) {
    return GamingActivityModel(
      activitiesNo: activitiesNo ?? this.activitiesNo,
      activityImgUrl: activityImgUrl ?? this.activityImgUrl,
      detailImgUrl: detailImgUrl ?? this.detailImgUrl,
      bannerImgUrl: bannerImgUrl ?? this.bannerImgUrl,
      title: title ?? this.title,
      introduction: introduction ?? this.introduction,
      sort: sort ?? this.sort,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      isJoin: isJoin ?? this.isJoin,
      isEnroll: isEnroll ?? this.isEnroll,
      labelName: labelName ?? this.labelName,
      labelCode: labelCode ?? this.labelCode,
    );
  }
}
