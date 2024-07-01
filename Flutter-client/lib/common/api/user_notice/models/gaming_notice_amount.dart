import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingNoticeAmount {
  GamingNoticeAmount({
    this.system,
    this.transaction,
    this.activity,
    this.information,
    this.all,
  });

  factory GamingNoticeAmount.fromJson(Map<String, dynamic> json) =>
      GamingNoticeAmount(
        system: asT<int?>(json['System']),
        transaction: asT<int?>(json['Transaction']),
        activity: asT<int?>(json['activity']),
        information: asT<int?>(json['Information']),
        all: asT<int?>(json['All']),
      );

  int? system;
  int? transaction;
  int? activity;
  int? information;
  int? all;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'System': system,
        'Transaction': transaction,
        'activity': activity,
        'Information': information,
        'All': all,
      };
}
