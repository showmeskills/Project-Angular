class GamingSortSelectModel {
  String? code;
  String? description;
  String? icon;

  GamingSortSelectModel({
    this.code,
    this.description,
    this.icon,
  });

  factory GamingSortSelectModel.fromJson(Map<String, Object?> json) {
    return GamingSortSelectModel(
      code: json['code'] as String?,
      description: json['description'] as String?,
      icon: json['icon'] as String?,
    );
  }

  Map<String, Object?> toJson() => {
        'code': code,
        'description': description,
        'icon': icon,
      };
}
