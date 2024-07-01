T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class RegisterBonusContentModel {
  String? title;
  String? prizeName;

  RegisterBonusContentModel({
    this.title,
    this.prizeName,
  });

  factory RegisterBonusContentModel.fromJson(Map<String, Object?> json) {
    return RegisterBonusContentModel(
      title: json['title'] as String?,
      prizeName: json['prizeName'] as String?,
    );
  }

  Map<String, Object?> toJson() => {
        'title': title,
        'prizeName': prizeName,
      };
}

class RegisterBonusModel {
  String? prizeCode;
  String? tmpCode;
  String? tmpType;
  String? activityName;
  RegisterBonusContentModel? content;
  bool isDefault;

  RegisterBonusModel({
    this.prizeCode,
    this.tmpCode,
    this.tmpType,
    this.activityName,
    this.content,
    this.isDefault = false,
  });

  factory RegisterBonusModel.fromJson(Map<String, Object?> json) {
    return RegisterBonusModel(
      prizeCode: json['prizeCode'] as String?,
      tmpCode: json['tmpCode'] as String?,
      tmpType: json['tmpType'] as String?,
      activityName: json['activityName'] as String?,
      isDefault: asT<bool>(json['isDefault']) ?? false,
      content: json['content'] == null
          ? null
          : RegisterBonusContentModel.fromJson(
              json['content'] as Map<String, dynamic>),
    );
  }

  Map<String, Object?> toJson() => {
        'prizeCode': prizeCode,
        'tmpCode': tmpCode,
        'tmpType': tmpType,
        'activityName': activityName,
        'isDefault': isDefault,
        'content': content?.toJson(),
      };

  RegisterBonusModel copyWith({
    String? prizeCode,
    String? tmpCode,
    String? tmpType,
    String? activityName,
    bool? isDefault,
    RegisterBonusContentModel? content,
  }) {
    return RegisterBonusModel(
      prizeCode: prizeCode ?? this.prizeCode,
      tmpCode: tmpCode ?? this.tmpCode,
      tmpType: tmpType ?? this.tmpType,
      activityName: activityName ?? this.activityName,
      isDefault: isDefault ?? this.isDefault,
      content: content ?? this.content,
    );
  }
}
