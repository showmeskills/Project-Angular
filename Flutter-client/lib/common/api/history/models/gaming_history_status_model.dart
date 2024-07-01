import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class StatusData {
  StatusData({
    required this.code,
    required this.description,
  });

  factory StatusData.fromJson(Map<String, dynamic> json) => StatusData(
        code: asT<String>(json['code'])!,
        description: asT<String>(json['description'])!,
      );

  String code;
  String description;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'code': code,
        'description': description,
      };
}
