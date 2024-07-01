class FooterMenuModel {
  int? id;
  String? title;
  String? url;
  bool? isBlank;
  String? footerType;

  FooterMenuModel(
      {this.id, this.title, this.url, this.isBlank, this.footerType});

  @override
  String toString() {
    return 'Detail(id: $id, title: $title, url: $url, isBlank: $isBlank)';
  }

  factory FooterMenuModel.fromJson(Map<String, Object?> json,
          {String? footerType}) =>
      FooterMenuModel(
        id: json['id'] as int?,
        title: json['title'] as String?,
        url: json['url'] as String?,
        isBlank: json['isBlank'] as bool?,
        footerType: footerType,
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'title': title,
        'url': url,
        'isBlank': isBlank,
      };

  FooterMenuModel copyWith({
    int? id,
    String? title,
    String? url,
    bool? isBlank,
    String? footerType,
  }) {
    return FooterMenuModel(
      id: id ?? this.id,
      title: title ?? this.title,
      url: url ?? this.url,
      isBlank: isBlank ?? this.isBlank,
      footerType: footerType ?? this.footerType,
    );
  }
}
