import 'package:gogaming_app/controller_header.dart';

import '../../../common/api/base/go_gaming_pagination.dart';
import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import 'coupon_rebate_detail_state.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import 'package:gogaming_app/widget_header.dart';

class CouponRebateDetailLogic extends BaseController
    with RefreshControllerMixin {
  final CouponRebateDetailState state = CouponRebateDetailState();

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

  Stream<GoGamingPagination<GamingCoupoRebateDetailModel>> _loadData(
      int pageIndex) {
    Map<String, dynamic> req = {
      'bonusId': bonusId,
      'pageIndex': pageIndex,
      'pageSize': 20,
    };
    return PGSpi(Bonus.queryBackWaterList.toTarget(input: req))
        .rxRequest<GoGamingPagination<GamingCoupoRebateDetailModel>>((value) {
      state.totalAmount.value = value['data']['totalAmount'] as num;
      final pagination =
          GoGamingPagination<GamingCoupoRebateDetailModel>.fromJson(
        itemFactory: (e) => GamingCoupoRebateDetailModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
      return pagination;
    }).flatMap((value) {
      // https://gbd730.atlassian.net/browse/WU2021-22222
      // 出现一个“审核失败”后，其他“待领取”的要变成“审核失败”
      if (value.data.list.isNotEmpty) {
        final hasRejected = value.data.list.firstWhereOrNull((element) =>
            gamingCouponStatusFromCardStatus(element.cardStatus ?? '') ==
            GamingCouponStatus.reject);
        if (hasRejected != null) {
          for (var element in value.data.list) {
            if (gamingCouponStatusFromCardStatus(element.cardStatus ?? '') ==
                GamingCouponStatus.pending) {
              element.cardStatus = 'Rejected';
            }
          }
        }
      }

      return Stream.value(value.data);
    });
  }
}
