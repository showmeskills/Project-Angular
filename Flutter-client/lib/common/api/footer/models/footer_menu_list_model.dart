import 'footer_menu_model.dart';

class FooterMenuListModel {
  String footerType;
  List<FooterMenuModel> detail;

  FooterMenuListModel({required this.footerType, this.detail = const []});

  @override
  String toString() => 'Info(footerType: $footerType, detail: $detail)';

  factory FooterMenuListModel.fromJson(Map<String, Object?> json) =>
      FooterMenuListModel(
        footerType: json['footerType'] as String,
        detail: (json['detail'] as List<dynamic>?)
                ?.map((e) => FooterMenuModel.fromJson(e as Map<String, Object?>,
                    footerType: json['footerType'] as String))
                .toList() ??
            [],
      );

  Map<String, Object?> toJson() => {
        'footerType': footerType,
        'detail': detail.map((e) => e.toJson()).toList(),
      };

  FooterMenuListModel copyWith({
    String? footerType,
    List<FooterMenuModel>? detail,
  }) {
    return FooterMenuListModel(
      footerType: footerType ?? this.footerType,
      detail: detail ?? this.detail,
    );
  }
}
