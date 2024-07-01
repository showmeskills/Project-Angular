class FooterLicenseModel {
  int? id;
  String? licenseType;
  String? image;
  String? url;
  bool? isBlank;

  FooterLicenseModel(
      {this.id, this.licenseType, this.image, this.url, this.isBlank});

  @override
  String toString() {
    return 'License(id: $id, licenseType: $licenseType, image: $image, url: $url, isBlank: $isBlank)';
  }

  factory FooterLicenseModel.fromJson(Map<String, Object?> json) =>
      FooterLicenseModel(
        id: json['id'] as int?,
        licenseType: json['licenseType'] as String?,
        image: json['image'] as String?,
        url: json['url'] as String?,
        isBlank: json['isBlank'] as bool?,
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'licenseType': licenseType,
        'image': image,
        'url': url,
        'isBlank': isBlank,
      };

  FooterLicenseModel copyWith({
    int? id,
    String? licenseType,
    String? image,
    String? url,
    bool? isBlank,
  }) {
    return FooterLicenseModel(
      id: id ?? this.id,
      licenseType: licenseType ?? this.licenseType,
      image: image ?? this.image,
      url: url ?? this.url,
      isBlank: isBlank ?? this.isBlank,
    );
  }
}
