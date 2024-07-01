class FooterDisclaimerModel {
  int? id;
  String? disclaimer;

  FooterDisclaimerModel({this.id, this.disclaimer});

  @override
  String toString() => 'Disclaimer(id: $id, disclaimer: $disclaimer)';

  factory FooterDisclaimerModel.fromJson(Map<String, Object?> json) =>
      FooterDisclaimerModel(
        id: json['id'] as int?,
        disclaimer: json['disclaimer'] as String?,
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'disclaimer': disclaimer,
      };

  FooterDisclaimerModel copyWith({
    int? id,
    String? disclaimer,
  }) {
    return FooterDisclaimerModel(
      id: id ?? this.id,
      disclaimer: disclaimer ?? this.disclaimer,
    );
  }
}
