abstract class IGoGamingPagination<T> {
  final int total;
  final List<T> list;

  int get count => list.length;

  const IGoGamingPagination({
    this.total = 0,
    this.list = const [],
  });
}

class GoGamingPagination<T> extends IGoGamingPagination<T> {
  GoGamingPagination({
    int total = 0,
    List<T> list = const [],
  }) : super(
          total: total,
          list: list,
        );

  factory GoGamingPagination.fromJson({
    required T Function(Map<String, dynamic>) itemFactory,
    required Map<String, dynamic> json,
  }) {
    return GoGamingPagination(
      total: json['total'] as int? ?? 0,
      list: (json['list'] as List<dynamic>?)
              ?.map((e) => itemFactory(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  factory GoGamingPagination.fromJsonCustomize({
    required T Function(Map<String, dynamic>) itemFactory,
    required Map<String, dynamic> json,
    required String key,
  }) {
    return GoGamingPagination(
      total: json['total'] as int? ?? 0,
      list: (json[key] as List<dynamic>?)
              ?.map((e) => itemFactory(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  GoGamingPagination<T> apply(GoGamingPagination<T> other) {
    return GoGamingPagination(
      total: other.total,
      list: [...list, ...other.list],
    );
  }

  GoGamingPagination<T> copyWith({
    List<T>? list,
    int? total,
  }) {
    return GoGamingPagination(
      total: total ?? this.total,
      list: list ?? this.list,
    );
  }
}
