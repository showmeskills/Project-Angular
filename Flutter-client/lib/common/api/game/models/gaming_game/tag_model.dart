class GamingGameTagModel {
  String code;
  String? description;

  GamingGameTagModel({required this.code, this.description});

  @override
  String toString() => 'GameLabel(code: $code, description: $description)';

  factory GamingGameTagModel.fromJson(Map<String, Object?> json) =>
      GamingGameTagModel(
        code: json['code'] as String,
        description: json['description'] as String?,
      );

  Map<String, Object?> toJson() => {
        'code': code,
        'description': description,
      };

  GamingGameTagModel copyWith({
    String? code,
    String? description,
  }) {
    return GamingGameTagModel(
      code: code ?? this.code,
      description: description ?? this.description,
    );
  }
}
