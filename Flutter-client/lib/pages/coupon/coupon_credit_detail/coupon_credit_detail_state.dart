import 'package:base_framework/base_controller.dart';
import '../../../common/api/base/go_gaming_pagination.dart';
import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';

class CouponCreditDetailState {
  final data = GoGamingPagination<GamingCouponCreditDetailModel>().obs;
}
