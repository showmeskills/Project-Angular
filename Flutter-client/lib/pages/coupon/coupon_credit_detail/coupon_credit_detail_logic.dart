import 'package:gogaming_app/controller_header.dart';

import '../../../common/api/base/go_gaming_pagination.dart';
import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import 'package:gogaming_app/widget_header.dart';

import 'coupon_credit_detail_state.dart';

class CouponCreditDetailLogic extends BaseController
    with RefreshControllerMixin {
  final CouponCreditDetailState state = CouponCreditDetailState();

  late int bonusId;

  @override
  LoadCallback? get onRefresh => (p) {
        refreshCompleted(state: LoadState.loading);
        _loadData(p)
            .doOnData((event) {
              state.data.value = event;
              refreshCompleted(
                  state: LoadState.successful,
                  total: event.total,
                  count: event.list.length);
            })
            .doOnDone(() {})
            .listen((event) {})
            .onError((err) {
              refreshCompleted(
                state: LoadState.failed,
              );
            });
      };

  @override
  LoadCallback? get onLoadMore => (p) async {
        _loadData(p)
            .doOnData((event) {
              state.data.value = state.data.value.apply(event);
              loadMoreCompleted(
                state: LoadState.successful,
                total: event.list.length,
                count: event.count,
              );
            })
            .listen((event) {})
            .onError((err) {
              refreshCompleted(
                state: LoadState.failed,
              );
            });
      };

  Stream<GoGamingPagination<GamingCouponCreditDetailModel>> _loadData(
      int pageIndex) {
    Map<String, dynamic> req = {
      'bonusId': bonusId,
      'pageIndex': pageIndex,
      'pageSize': 20,
    };
    return PGSpi(Bonus.bonusFlow.toTarget(input: req))
        .rxRequest<GoGamingPagination<GamingCouponCreditDetailModel>>((value) {
      final pagination =
          GoGamingPagination<GamingCouponCreditDetailModel>.fromJson(
        itemFactory: (e) => GamingCouponCreditDetailModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
      return pagination;
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }
}
