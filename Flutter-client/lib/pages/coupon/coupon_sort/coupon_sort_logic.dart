import 'package:base_framework/base_framework.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/base/go_gaming_pagination.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';

part 'coupon_sort_state.dart';

class CouponSortLogic extends BaseController with SingleRenderControllerMixin {
  final state = CouponSortState();

  @override
  void Function()? get onLoadData => () {
        loadCompleted(state: LoadState.loading);
        _loadData().doOnData((event) {
          loadCompleted(
              state: event.total == 0 ? LoadState.empty : LoadState.successful);
          state._data.value = event;
        }).doOnError((p0, p1) {
          loadCompleted(state: LoadState.failed);
          if (p0 is GoGamingResponse) {
            Toast.showFailed(p0.message);
          } else {
            Toast.showTryLater();
          }
        }).listen((event) {}, onError: (err) {});
      };

  Stream<GoGamingPagination<GamingCouponModel>> _loadData() {
    return PGSpi(Bonus.bonusDetail.toTarget(
      input: {
        'status': 'InUse',
        'ascSort': false,
        'userSort': true,
        'isByPage': false,
      },
    )).rxRequest<GoGamingPagination<GamingCouponModel>>((value) {
      final pagination = GoGamingPagination<GamingCouponModel>.fromJson(
        itemFactory: (e) => GamingCouponModel.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
      return pagination;
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  void onReorder(int oldIndex, int newIndex) {
    final item = state.data.list[oldIndex];
    final int index = newIndex > oldIndex ? newIndex - 1 : newIndex;
    state._data.value = state.data.copyWith(
      list: List<GamingCouponModel>.from(state.data.list)
        ..removeAt(oldIndex)
        ..insert(index, item),
    );

    state._enable.value = oldIndex != newIndex;
  }

  void submit() {
    SmartDialog.showLoading<void>();
    state._isLoading.value = true;
    PGSpi(Bonus.bonusSort.toTarget(
      inputData: {
        'bonusSort': List.generate(state.data.list.length, (index) {
          return {
            'id': state.data.list[index].id!,
            'sort': state.data.list.length - index,
          };
        }),
      },
    )).rxRequest<Map<String, dynamic>>((value) {
      return value;
    }).doOnData((event) {
      if (event.success) {
        state._enable.value = false;
        Toast.showSuccessful(localized('sequence_order'));
      } else {
        Toast.showFailed(localized('sequence_fail'));
      }
    }).doOnError((p0, p1) {
      if (p0 is GoGamingResponse) {
        Toast.showFailed(p0.message);
      } else {
        Toast.showFailed(localized('sequence_fail'));
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
      state._isLoading.value = false;
    }).listen((event) {}, onError: (err) {});
  }
}
