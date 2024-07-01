part of 'coupon_sort_logic.dart';

class CouponSortState {
  final _data = GoGamingPagination<GamingCouponModel>().obs;
  GoGamingPagination<GamingCouponModel> get data => _data.value;

  final _isLoading = false.obs;
  bool get isLoading => _isLoading.value;

  final _enable = false.obs;
  bool get enable => _enable.value;
}
