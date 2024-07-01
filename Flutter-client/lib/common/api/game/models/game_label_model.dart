class GameLabelModel {
  final String? code;
  final String? name;
  final String? description;
  final String? icon;
  final String? image;
  final String? menuIcon;

  GameLabelModel({
    this.code,
    this.name,
    this.description,
    this.icon,
    this.image,
    this.menuIcon,
  });

  GameLabelModel.fromJson(Map<String, dynamic> json)
      : code = json['code'] as String?,
        name = json['name'] as String?,
        description = json['description'] as String?,
        icon = json['icon'] as String?,
        image = json['image'] as String?,
        menuIcon = json['menuIcon'] as String?;

  Map<String, dynamic> toJson() => {
        'code': code,
        'name': name,
        'description': description,
        'icon': icon,
        'image': image,
        'menuIcon': menuIcon,
      };
}
