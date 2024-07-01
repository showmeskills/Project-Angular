class GamingDeviceLogModel {
  String? category;
  String? categoryType;
  String? result;
  String? source;
  String? createIp;
  String? createZone;
  int? createTime;

  GamingDeviceLogModel({
    this.category,
    this.categoryType,
    this.result,
    this.source,
    this.createIp,
    this.createZone,
    this.createTime,
  });

  @override
  String toString() {
    return 'GamingDeviceLogModel(category: $category, categoryType: $categoryType, result: $result, source: $source, createIp: $createIp, createZone: $createZone, createTime: $createTime)';
  }

  factory GamingDeviceLogModel.fromJson(Map<String, Object?> json) {
    return GamingDeviceLogModel(
      category: json['category'] as String?,
      categoryType: json['categoryType'] as String?,
      result: json['result'] as String?,
      source: json['source'] as String?,
      createIp: json['createIp'] as String?,
      createZone: json['createZone'] as String?,
      createTime: json['createTime'] as int?,
    );
  }

  Map<String, Object?> toJson() => {
        'category': category,
        'categoryType': categoryType,
        'result': result,
        'source': source,
        'createIp': createIp,
        'createZone': createZone,
        'createTime': createTime,
      };

  GamingDeviceLogModel copyWith({
    String? category,
    String? categoryType,
    String? result,
    String? source,
    String? createIp,
    String? createZone,
    int? createTime,
  }) {
    return GamingDeviceLogModel(
      category: category ?? this.category,
      categoryType: categoryType ?? this.categoryType,
      result: result ?? this.result,
      source: source ?? this.source,
      createIp: createIp ?? this.createIp,
      createZone: createZone ?? this.createZone,
      createTime: createTime ?? this.createTime,
    );
  }
}
