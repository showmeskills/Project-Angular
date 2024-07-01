import '../../../common/api/base/base_api.dart';
import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';

class CouponFilterState {
  /// 当前选中筛选卡券类型
  GamingCouponTypeModel? _type;
  late final selectType = _type.obs;

  /// 当前选中筛选卡券状态
  GamingCouponStatusModel? _status;
  late final selectStatus = _status.obs;

  /// 当前选中筛选卡券排序
  RxBool ascSort = false.obs;

  /// 可选卡券状态
  RxList<GamingCouponStatusModel> couponSelectStatus =
      <GamingCouponStatusModel>[].obs;

  /// 可选卡券类型
  RxList<GamingCouponTypeModel> couponSelectType =
      <GamingCouponTypeModel>[].obs;
}
