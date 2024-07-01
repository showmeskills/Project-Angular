import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../../common/api/base/go_gaming_pagination.dart';
import '../../../common/api/history/models/gaming_currency_history_model.dart';
import '../../../common/service/event_service.dart';
import 'fiat_withdraw_history_state.dart';
import 'package:gogaming_app/common/api/history/history_api.dart';

class FiatWithdrawHistoryLogic extends BaseController
    with SingleRenderControllerMixin {
  final FiatWithdrawHistoryState state = FiatWithdrawHistoryState();

  @override
  void onInit() {
    ever<GoGamingPagination<GamingCurrencyHistoryModel>>(state.data, (v) {
      loadCompleted(
        state: v.total == 0 ? LoadState.empty : LoadState.successful,
      );
    });

    GamingEvent.onWithdraw.subscribe(onWithdraw);
    super.onInit();
  }

  Stream<void> _onLoadStreamData() {
    final now = DateTime.now();
    final end =
        DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
    final start = end.subtract(const Duration(days: 30));
    return PGSpi(History.currency.toTarget(
      input: {
        'category': 'Withdraw',
        'StartTime': start.millisecondsSinceEpoch,
        'EndTime': end.millisecondsSinceEpoch,
      },
    )).rxRequest<GoGamingPagination<GamingCurrencyHistoryModel>>((value) {
      return GoGamingPagination<GamingCurrencyHistoryModel>.fromJson(
        itemFactory: (e) => GamingCurrencyHistoryModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
    }).doOnData((event) {
      if (event.data.list.length > 3) {
        state.data.value =
            event.data.copyWith(list: event.data.list.sublist(0, 3));
      } else {
        state.data.value = event.data;
      }
    });
  }

  void onWithdraw(Map<String, dynamic> data) {
    _onLoadStreamData().listen(null, onError: (p0, p1) {});
  }

  @override
  void Function()? get onLoadData => () {
        loadCompleted(state: LoadState.loading);
        _onLoadStreamData().doOnError((p0, p1) {
          loadCompleted(state: LoadState.failed);
        }).listen(null, onError: (p0, p1) {});
      };
}
