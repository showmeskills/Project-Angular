import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/controller_header.dart';
import '../../../../common/api/nonsticky/models/gaming_nonsticky_list_model.dart';
import '../../../../common/api/nonsticky/models/gaming_wallet_overview_model.dart';
import '../../../../common/api/nonsticky/nonsticky_api.dart';

import '../../../../common/lang/locale_lang.dart';
import '../../../../common/service/account_service.dart';
import '../../../../common/service/event_service.dart';
import '../../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../../../socket/gaming_signalr_provider.dart';
import 'state.dart';

class NoneStickyLogic extends BaseController with RefreshControllerMixin {
  final NoneStickyState state = NoneStickyState();

  @override
  final RefreshViewController controller = RefreshViewController(
    autoLoadData: AccountService.sharedInstance.isLogin,
  );

  @override
  void onInit() {
    SignalrProvider()
        .subscribe('OnNonStickyStatus', _subscribeUpdateNonStickyStatus);
    GamingEvent.kycPrimarySuccess.subscribe(_primarySuccess);
    super.onInit();
  }

  @override
  void onClose() {
    SignalrProvider()
        .off('OnNonStickyStatus', method: _subscribeUpdateNonStickyStatus);
    GamingEvent.kycPrimarySuccess.unsubscribe(_primarySuccess);
    super.onClose();
  }

  void _primarySuccess() {
    state.unactivatedModel.refresh();
  }

  void _subscribeUpdateNonStickyStatus(List<dynamic>? arguments) {
    onRefresh?.call(1);
  }

  void onExchange() {
    Get.toNamed<dynamic>(Routes.exchangeCoupon.route)?.then((value) {
      if (value is bool && value) {
        onRefresh?.call(1);
      }
    });
  }

  /// 一键领取
  void onReceiveAllSticky() {
    _onReceiveAllStickyApi(callback: (success) {
      if (success) {
        Toast.showSuccessful(localized("wd_success"));
      } else {
        Toast.showFailed(localized('wd_fail'));
      }
    });
  }

  void _onReceiveAllStickyApi({required void Function(bool) callback}) {
    SmartDialog.showLoading<void>();
    PGSpi(Nonsticky.batchwithdrawwallet.toTarget()).rxRequest<bool>((value) {
      if ((value.isNotEmpty) && value['success'] == true) {
        final data = value['data'];
        if (data is bool) {
          return data;
        }
      }
      return false;
    }).doOnData((event) {
      callback.call(event.data);
      if (event.data) {
        onRefresh?.call(1);
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen((event) {}, onError: (err) {});
  }

  Stream<GamingNonstickyWalletOverviewModel> _loadWalletOverview() {
    return PGSpi(Nonsticky.walletoverview.toTarget())
        .rxRequest<GamingNonstickyWalletOverviewModel>((value) {
      return GamingNonstickyWalletOverviewModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<GamingNonstickyModel> _loadActivatedList() {
    return PGSpi(Nonsticky.getactivated.toTarget())
        .rxRequest<GamingNonstickyModel>((value) {
      return GamingNonstickyModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Stream<GamingNonstickyListModel> _loadUnactivatedList() {
    return PGSpi(Nonsticky.getlist.toTarget())
        .rxRequest<GamingNonstickyListModel>((value) {
      return GamingNonstickyListModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  @override
  LoadCallback? get onRefresh => (p) {
        Rx.combineLatestList([
          _loadWalletOverview().doOnData((event) {
            state.walletOverview.value = event;
          }),
          _loadActivatedList().doOnData((event) {
            state.activatedModel.value = event;
          }),
          _loadUnactivatedList().doOnData((event) {
            /// 过滤已下架游戏
            state.unactivatedModel.value = GamingNonstickyListModel(
              casinoBonusList: event.casinoBonusList?.where((element) {
                return (element.providerCatId?.isNotEmpty ?? false);
              }).toList(),
              liveCasinoBonusList: event.liveCasinoBonusList?.where((element) {
                return (element.providerCatId?.isNotEmpty ?? false);
              }).toList(),
            );
          }),
        ]).doOnData((event) {
          hideLoading();
          refreshCompleted(
            state: LoadState.successful,
            hasMoreData: false,
          );
        }).doOnError((err, p1) {
          hideLoading();
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
          refreshCompleted(
            state: LoadState.failed,
          );
        }).listen((event) {});
      };
}
