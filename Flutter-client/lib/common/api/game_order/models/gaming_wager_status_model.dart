import 'package:gogaming_app/common/lang/locale_lang.dart';

class GamingWagerStatusModel {
  String code;
  String description;

  GamingWagerStatusModel({
    this.code = '',
    this.description = '',
  });

  static const allCode = 'all';

  factory GamingWagerStatusModel.all() {
    return GamingWagerStatusModel(
      code: allCode,
      description: localized('all'),
    );
  }

  bool get isAll => code == allCode;

  @override
  String toString() {
    return 'GamingGameOrderWagerStatusModel(code: $code, description: $description)';
  }

  factory GamingWagerStatusModel.fromJson(Map<String, Object?> json) {
    return GamingWagerStatusModel(
      code: json['code'] as String? ?? '',
      description: json['description'] as String? ?? '',
    );
  }

  Map<String, Object?> toJson() => {
        'code': code,
        'description': description,
      };

  GamingWagerStatusModel copyWith({
    String? code,
    String? description,
  }) {
    return GamingWagerStatusModel(
      code: code ?? this.code,
      description: description ?? this.description,
    );
  }

  @override
  bool operator ==(Object other) {
    return other is GamingWagerStatusModel &&
        code == other.code &&
        description == other.description;
  }

  @override
  int get hashCode {
    return code.hashCode ^ description.hashCode;
  }
}
