class GamingBannerModel {
  int id;
  String bannerUrl;
  String? imageUrl;

  GamingBannerModel({required this.id, required this.bannerUrl, this.imageUrl});

  @override
  String toString() {
    return 'BannerModel(id: $id, bannerUrl: $bannerUrl, imageUrl: $imageUrl)';
  }

  factory GamingBannerModel.fromJson(Map<String, Object?> json) =>
      GamingBannerModel(
        id: json['id'] as int,
        bannerUrl: json['bannerUrl'] as String,
        imageUrl: json['imageUrl'] as String?,
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'bannerUrl': bannerUrl,
        'imageUrl': imageUrl,
      };

  GamingBannerModel copyWith({
    int? id,
    String? bannerUrl,
    String? imageUrl,
  }) {
    return GamingBannerModel(
      id: id ?? this.id,
      bannerUrl: bannerUrl ?? this.bannerUrl,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }
}
