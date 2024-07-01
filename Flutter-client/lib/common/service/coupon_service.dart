import 'package:gogaming_app/common/api/bonus/bonus_api.dart';

import '../api/base/base_api.dart';
import 'restart_service.dart';

class CouponService extends RestartServiceInterface {
  factory CouponService() => _getInstance();

  static CouponService get sharedInstance => _getInstance();

  static CouponService? _instance;

  static CouponService _getInstance() {
    _instance ??= CouponService._internal();
    return _instance!;
  }

  CouponService._internal();

  int? _couponMessageCount;

  late final _messageCount = _couponMessageCount.obs;
  late final messageCount = _messageCount;

  String? _bonusActivitiesNo;

  String? get bonusActivitiesNo {
    return _bonusActivitiesNo;
  }

  Stream<int> refresh() {
    return PGSpi(Bonus.getBonusCount.toTarget()).rxRequest<int>((value) {
      final data = value['data'];
      if (data is int) {
        return data;
      } else {
        return 0;
      }
    }).flatMap((event) {
      return Stream.value(_store(event.data));
    });
  }

  int _store(int count) {
    _couponMessageCount = count;
    _messageCount.value = _couponMessageCount;
    return _couponMessageCount!;
  }

  void setBonusActivitiesNo(String? bonusActivitiesNo) {
    _bonusActivitiesNo = bonusActivitiesNo;
  }

  void clearBonusActivitiesNo() {
    _bonusActivitiesNo = null;
  }

  void reInit() {
    _couponMessageCount = null;
    _messageCount.value = null;
  }

  @override
  void onClose() {
    _instance = null;
  }
}
