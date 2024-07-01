import 'footer_model.dart';
import 'footer_license_model.dart';

class FooterResponseDataModel {
  List<FooterLicenseModel>? license;
  List<FooterModel>? footer;

  FooterResponseDataModel({this.license, this.footer});

  @override
  String toString() => 'FooterModel(license: $license, footer: $footer)';

  factory FooterResponseDataModel.fromJson(Map<String, Object?> json) =>
      FooterResponseDataModel(
        license: (json['license'] as List<dynamic>?)
            ?.map((e) => FooterLicenseModel.fromJson(e as Map<String, Object?>))
            .toList(),
        footer: (json['footer'] as List<dynamic>?)
            ?.map((e) => FooterModel.fromJson(e as Map<String, Object?>))
            .toList(),
      );

  Map<String, Object?> toJson() => {
        'license': license?.map((e) => e.toJson()).toList(),
        'footer': footer?.map((e) => e.toJson()).toList(),
      };

  FooterResponseDataModel copyWith({
    List<FooterLicenseModel>? license,
    List<FooterModel>? footer,
  }) {
    return FooterResponseDataModel(
      license: license ?? this.license,
      footer: footer ?? this.footer,
    );
  }
}
