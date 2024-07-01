import 'dart:convert';

class FrontModel {
  int? id;
  String? bannerUrl;
  String? imageUrl;

  FrontModel({this.id, this.bannerUrl, this.imageUrl});

  @override
  String toString() {
    return 'FrontModel(id: $id, bannerUrl: $bannerUrl, imageUrl: $imageUrl)';
  }

  factory FrontModel.fromMap(Map<String, Object?> data) => FrontModel(
        id: data['id'] as int?,
        bannerUrl: data['bannerUrl'] as String?,
        imageUrl: data['imageUrl'] as String?,
      );

  Map<String, Object?> toMap() => {
        'id': id,
        'bannerUrl': bannerUrl,
        'imageUrl': imageUrl,
      };

  /// `dart:convert`
  ///
  /// Parses the string and returns the resulting Json object as [FrontModel].
  factory FrontModel.fromJson(String data) {
    return FrontModel.fromMap(json.decode(data) as Map<String, Object?>);
  }

  /// `dart:convert`
  ///
  /// Converts [FrontModel] to a JSON string.
  String toJson() => json.encode(toMap());

  FrontModel copyWith({
    int? id,
    String? bannerUrl,
    String? imageUrl,
  }) {
    return FrontModel(
      id: id ?? this.id,
      bannerUrl: bannerUrl ?? this.bannerUrl,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }
}
