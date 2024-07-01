import 'dart:convert';

/// 历史记录的状态
T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class WalletHistoryStatus {
  WalletHistoryStatus({
    required this.success,
    required this.code,
    this.message,
    required this.data,
  });

  factory WalletHistoryStatus.fromJson(Map<String, dynamic> json) {
    final List<HistoryStatus> data =
        json['data'] is List ? <HistoryStatus>[] : [];
    for (final dynamic item in json["data"] as List) {
      if (item != null) {
        data.add(HistoryStatus.fromJson(asT<Map<String, dynamic>>(item)!));
      }
    }

    return WalletHistoryStatus(
      success: asT<bool>(json['success'])!,
      code: asT<String>(json['code'])!,
      message: asT<Object?>(json['message']),
      data: data,
    );
  }

  bool success;
  String code;
  Object? message;
  List<HistoryStatus> data;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'success': success,
        'code': code,
        'message': message,
        'data': data,
      };
}

class HistoryStatus {
  HistoryStatus({
    required this.code,
    required this.description,
  });

  factory HistoryStatus.fromJson(Map<String, dynamic> json) => HistoryStatus(
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
