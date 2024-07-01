import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';

class TournamentPagination<T> extends IGoGamingPagination<T> {
  final int size;
  final int current;
  final int pages;

  const TournamentPagination({
    this.size = 0,
    this.current = 0,
    this.pages = 0,
    int total = 0,
    List<T> list = const [],
  }) : super(
          total: total,
          list: list,
        );

  factory TournamentPagination.fromJson({
    required T Function(Map<String, dynamic>) itemFactory,
    required Map<String, dynamic> json,
  }) {
    return TournamentPagination(
      size: json['size'] as int? ?? 0,
      current: json['current'] as int? ?? 0,
      pages: json['pages'] as int? ?? 0,
      total: json['total'] as int? ?? 0,
      list: (json['records'] as List<dynamic>?)
              ?.map((e) => itemFactory(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  TournamentPagination<T> apply(TournamentPagination<T> other) {
    return TournamentPagination(
      total: other.total,
      list: [...list, ...other.list],
      size: other.size,
      current: other.current,
      pages: other.pages,
    );
  }

  TournamentPagination<T> removeAt(int index) {
    return copyWith(
      total: total - 1,
      list: list..removeAt(index),
    );
  }

  TournamentPagination<T> removeWhere(bool Function(T) test) {
    final index = list.indexWhere(test);
    if (index == -1) {
      return this;
    }
    return removeAt(index);
  }

  TournamentPagination<T> insert(int index, T data) {
    return copyWith(
      total: total + 1,
      list: list..insert(index, data),
    );
  }

  TournamentPagination<T> copyWith({
    List<T>? list,
    int? total,
    int? size,
    int? current,
    int? pages,
  }) {
    return TournamentPagination(
      total: total ?? this.total,
      list: list ?? this.list,
      size: size ?? this.size,
      current: current ?? this.current,
      pages: pages ?? this.pages,
    );
  }
}
