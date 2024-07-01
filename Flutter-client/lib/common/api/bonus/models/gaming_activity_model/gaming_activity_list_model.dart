import 'gaming_activity_model.dart';

class GamingActivityListModel {
  String labelName;
  String labelCode;
  List<GamingActivityModel> list;

  GamingActivityListModel({
    this.labelName = '',
    this.labelCode = '',
    this.list = const [],
  });

  @override
  String toString() {
    return 'GamingActivityModel(labelName: $labelName, labelCode: $labelCode, list: $list)';
  }

  factory GamingActivityListModel.fromJson(Map<String, Object?> json) {
    return GamingActivityListModel(
      labelName: json['labelName'] as String? ?? '',
      labelCode: json['labelCode'] as String? ?? '',
      list: (json['list'] as List<dynamic>?)
              ?.map((e) =>
                  GamingActivityModel.fromJson(e as Map<String, Object?>))
              .toList() ??
          [],
    );
  }

  Map<String, Object?> toJson() => {
        'labelName': labelName,
        'labelCode': labelCode,
        'list': list.map((e) => e.toJson()).toList(),
      };

  GamingActivityListModel copyWith({
    String? labelName,
    String? labelCode,
    List<GamingActivityModel>? list,
  }) {
    return GamingActivityListModel(
      labelName: labelName ?? this.labelName,
      labelCode: labelCode ?? this.labelCode,
      list: list ?? this.list,
    );
  }
}
