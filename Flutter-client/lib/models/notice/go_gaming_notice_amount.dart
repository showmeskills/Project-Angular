import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GoGamingNoticeAmount {
  GoGamingNoticeAmount({
    this.system,
    this.transaction,
    this.activity,
    this.information,
    this.all,
  });

  factory GoGamingNoticeAmount.fromJson(Map<String, dynamic> json) =>
      GoGamingNoticeAmount(
        system: asT<int>(json['System']),
        transaction: asT<int>(json['Transaction']),
        activity: asT<int>(json['Activity']),
        information: asT<int>(json['Information']),
        all: asT<int>(json['All']),
      );

  final int? system;
  final int? transaction;
  final int? activity;
  final int? information;
  final int? all;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'system': system,
        'Transaction': transaction,
        'Activity': activity,
        'Information': information,
        'All': all,
      };
}
