import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';

import '../../../common/api/base/go_gaming_pagination.dart';
import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import 'exchange_coupon_state.dart';

class ExchangeCouponLogic extends BaseController with RefreshControllerMixin {
  final ExchangeCouponState state = ExchangeCouponState();

  late final GamingTextFieldController codeController =
      GamingTextFieldController(
    validator: [
      GamingTextFieldValidator.length(min: 8, max: 8),
      // GamingTextFieldValidator(
      //   reg: RegExp(
      //     r"[^\u4E00-\u9FA5]+$",
      //   ),
      // ),
    ],
    onChanged: (text) {
      state.buttonEnable.value = codeController.isPass;
    },
    obscureText: false,
  );

  @override
  LoadCallback get onLoadMore => (p) async {
        refreshCompleted(
          state: LoadState.loading,
        );
        _loadCouponHistory(pageIndex: p)
            .doOnData((event) {
              state.data.addAll(event);
            })
            .listen((event) {})
            .onError((Object err) {
              if (err is GoGamingResponse) {
                Toast.showFailed(err.message);
              } else {
                Toast.showTryLater();
              }
            });
      };

  Stream<List<GamingCouponExchangeRecord>> _loadCouponHistory(
      {int pageIndex = 1}) {
    Map<String, dynamic> req = {
      'pageIndex': pageIndex,
      'pageSize': 20,
    };
    return PGSpi(Bonus.exchangeReceiveInfo.toTarget(
      input: req,
    )).rxRequest<List<GamingCouponExchangeRecord>>((value) {
      final pagination =
          GoGamingPagination<GamingCouponExchangeRecord>.fromJson(
        itemFactory: (e) => GamingCouponExchangeRecord.fromJson(e),
        json: value['data'] as Map<String, dynamic>,
      );
      return pagination.list;
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  @override
  LoadCallback? get onRefresh => (p) {
        refreshCompleted(
          state: LoadState.loading,
        );
        _loadCouponHistory(pageIndex: 1).doOnData((event) {
          state.data.assignAll(event);
        }).listen((event) {
          refreshCompleted(
            state: event.isEmpty ? LoadState.empty : LoadState.successful,
            hasMoreData: false,
          );
        }).onError((err) {
          refreshCompleted(
            state: LoadState.failed,
            hasMoreData: false,
          );
        });
      };

  Stream<bool> _exchangCoupon(String exchangeCode) {
    Map<String, dynamic> req = {
      'exchangeCode': exchangeCode,
    };
    return PGSpi(Bonus.exchangeReceive.toTarget(
      inputData: req,
    )).rxRequest<bool>((value) {
      return (value['data'] as bool?) ?? false;
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  void onExchange() {
    showLoading();
    _exchangCoupon(codeController.text.value).listen((event) {
      hideLoading();
      Get.back<bool>(result: event);
      if (event) {
        Toast.showSuccessful(localized("exchange_succ"));
      } else {
        Toast.showFailed(localized("exchange_fail"));
      }
    });
  }
}
