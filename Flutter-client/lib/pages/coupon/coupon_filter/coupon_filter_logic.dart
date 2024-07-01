import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';

import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import '../../../common/lang/locale_lang.dart';
import 'coupon_filter_state.dart';

class CouponFilterLogic extends BaseController {
  final CouponFilterState state = CouponFilterState();

  @override
  void onInit() {
    if (!AccountService.sharedInstance.isLogin) {
      return;
    }
    showLoading();
    Rx.combineLatestList([
      _loadBonusSelectStatus().doOnData((event) {
        state.couponSelectStatus.assignAll(event);
        state.selectStatus(event.first);
      }),
      _loadBonusSelectType().doOnData((event) {
        state.couponSelectType.assignAll(event);
      }),
    ]).doOnData((event) {
      hideLoading();
    }).doOnError((err, p1) {
      hideLoading();
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).listen((event) {});
    super.onInit();
  }

  Stream<List<GamingCouponStatusModel>> _loadBonusSelectStatus() {
    return PGSpi(Bonus.getBonusSelect.toTarget())
        .rxRequest<List<GamingCouponStatusModel>>((value) {
      return (value['data'] as List?)
              ?.map((e) =>
                  GamingCouponStatusModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<List<GamingCouponTypeModel>> _loadBonusSelectType() {
    return PGSpi(Bonus.getBonusTypeList.toTarget())
        .rxRequest<List<GamingCouponTypeModel>>((value) {
      return (value['data'] as List?)
              ?.map((e) =>
                  GamingCouponTypeModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  void reset() {
    state.selectStatus.value = state.couponSelectStatus.first;
    state.selectType.value = null;
    state.ascSort.value = false;
  }

  void onChangeStatus(String title) {
    if (title == localized('all')) {
      state.selectStatus.value = null;
      return;
    }
    final type = state.couponSelectStatus.firstWhereOrNull(
        (element) => title.contains(element.categoryDescription ?? ''));
    state.selectStatus.value = type;
  }

  void onChangeSort(String title) {
    state.ascSort.value = (title.contains(localized("receive_card_early")));
  }

  void onChangeType(String title) {
    if (title == localized('all')) {
      state.selectType.value = null;
      return;
    }
    final type = state.couponSelectType.firstWhereOrNull((element) {
      return title.contains(element.title ?? '');
    });
    state.selectType.value = type;
  }
}
