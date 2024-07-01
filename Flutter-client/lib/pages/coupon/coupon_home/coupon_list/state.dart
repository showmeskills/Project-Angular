import '../../../../common/api/base/base_api.dart';
import '../../../../common/api/base/go_gaming_pagination.dart';
import '../../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';

class CouponListState {
  RxBool isLoading = false.obs;
  final data = GoGamingPagination<GamingCouponModel>().obs;

  RxList<GamingCouponStatusModel> couponSelectType =
      <GamingCouponStatusModel>[].obs;
}
