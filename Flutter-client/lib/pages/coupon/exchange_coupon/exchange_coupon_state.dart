import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';

class ExchangeCouponState {
  RxBool buttonEnable = false.obs;

  RxList<GamingCouponExchangeRecord> data = <GamingCouponExchangeRecord>[].obs;
}
