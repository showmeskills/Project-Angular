import 'footer_disclaimer_model.dart';
import 'footer_menu_list_model.dart';

class FooterModel {
  String languageCode;
  FooterDisclaimerModel? disclaimer;
  Map<String, FooterMenuListModel> info;

  FooterModel({
    required this.languageCode,
    this.disclaimer,
    this.info = const {},
  });

  @override
  String toString() {
    return 'Footer(languageCode: $languageCode, disclaimer: $disclaimer, info: $info)';
  }

  factory FooterModel.fromJson(Map<String, Object?> json) => FooterModel(
        languageCode: json['languageCode'] as String,
        disclaimer: json['disclaimer'] == null
            ? null
            : FooterDisclaimerModel.fromJson(
                json['disclaimer']! as Map<String, Object?>),
        info: {
          for (var e in json['info'] as List<dynamic>? ?? [])
            e['footerType'] as String:
                FooterMenuListModel.fromJson(e as Map<String, Object?>)
        },
      );

  Map<String, Object?> toJson() => {
        'languageCode': languageCode,
        'disclaimer': disclaimer?.toJson(),
        'info': info.values.map((e) => e.toJson()).toList(),
      };

  FooterModel copyWith({
    String? languageCode,
    FooterDisclaimerModel? disclaimer,
    Map<String, FooterMenuListModel>? info,
  }) {
    return FooterModel(
      languageCode: languageCode ?? this.languageCode,
      disclaimer: disclaimer ?? this.disclaimer,
      info: info ?? this.info,
    );
  }
}
