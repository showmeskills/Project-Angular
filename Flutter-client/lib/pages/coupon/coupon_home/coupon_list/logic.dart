import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/controller_header.dart';
import '../../../../common/api/base/go_gaming_pagination.dart';
import '../../../../common/api/base/go_gaming_service.dart';
import '../../../../common/api/bonus/bonus_api.dart';
import '../../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import '../../../../common/tracker/event.dart';
import '../../../../common/lang/locale_lang.dart';
import '../../../../common/service/account_service.dart';
import '../../../../common/service/coupon_service.dart';
import '../../../../common/service/h5_webview_manager.dart';
import '../../../../common/service/merchant_service/merchant_config_model.dart';
import '../../../../common/service/merchant_service/merchant_service.dart';
import '../../../../common/service/web_url_service/web_url_service.dart';
import '../../../../common/theme/theme_manager.dart';
import '../../../../common/tools/url_tool.dart';
import '../../../../common/tracker/gaming_data_collection.dart';
import '../../../../common/widgets/gaming_overlay.dart';
import '../../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../coupon_filter/coupon_filter_logic.dart';
import '../../coupon_filter/coupon_filter_view.dart';
import 'state.dart';

class CouponListLogic extends BaseController
    with RefreshControllerMixin, GamingOverlayMixin {
  final CouponListState state = CouponListState();
  final filterLogic = Get.put(CouponFilterLogic());
  late Function disposeListen;

  @override
  final RefreshViewController controller = RefreshViewController(
    autoLoadData: AccountService.sharedInstance.isLogin,
  );

  /// 当前选中筛选卡券类型
  String? grantType;
  String? typeCode;

  /// 当前选中筛选卡券状态
  String? status = 'Unclaimed';

  /// 当前选中筛选卡券排序
  bool ascSort = false;

  @override
  void onInit() {
    super.onInit();

    disposeListen = AccountService.sharedInstance.cacheUser.getBox!()
        .listenKey(AccountService.sharedInstance.cacheUser.key, (value) {
      if (AccountService.sharedInstance.isLogin) {
        onRefresh?.call(1);
      }
    });

    GamingDataCollection.sharedInstance.startTimeEvent(TrackEvent.visitCoupon);
  }

  @override
  void onClose() {
    GamingDataCollection.sharedInstance.submitDataPoint(TrackEvent.visitCoupon);
    disposeListen.call();
    super.onClose();
  }

  @override
  LoadCallback? get onLoadMore => !AccountService.sharedInstance.isLogin
      ? null
      : (p) async {
          _loadCoupon(p)
              .doOnData((event) {
                state.data.value = state.data.value.apply(event);
                loadMoreCompleted(
                  state: LoadState.successful,
                  count: event.count,
                  total: event.total,
                );
              })
              .listen((event) {})
              .onError((err) {
                refreshCompleted(
                  state: LoadState.failed,
                );
              });
        };

  @override
  LoadCallback? get onRefresh => !AccountService.sharedInstance.isLogin
      ? null
      : (p) {
          state.isLoading.value = true;
          Rx.combineLatestList([
            _loadCoupon(p).doOnData((event) {
              state.data.value = event;
              refreshCompleted(
                state: LoadState.successful,
                count: event.count,
                total: event.total,
              );
            }),
          ]).doOnData((event) {
            state.isLoading.value = false;
            hideLoading();
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

  Stream<GoGamingPagination<GamingCouponModel>> _loadCoupon(int pageIndex) {
    Map<String, dynamic> req = {
      'pageIndex': pageIndex,
      'pageSize': 20,
    };
    if (status?.isNotEmpty ?? false) {
      req['status'] = status;
    }
    if (grantType?.isNotEmpty ?? false) {
      req['grantType'] = grantType;
    }
    if (typeCode?.isNotEmpty ?? false) {
      req['typeCode'] = typeCode;
    }
    req['ascSort'] = ascSort;

    return _loadBonusSelectStatus().flatMap((value) {
      state.couponSelectType.assignAll(value);
      return PGSpi(Bonus.bonusDetail.toTarget(
        input: req,
      )).rxRequest<GoGamingPagination<GamingCouponModel>>((value) {
        final pagination = GoGamingPagination<GamingCouponModel>.fromJson(
          itemFactory: (e) => GamingCouponModel.fromJson(e),
          json: value['data'] as Map<String, dynamic>,
        );
        return pagination;
      }).flatMap((value) {
        return Stream.value(value.data);
      });
    });
  }

  void onReceiveCoupon(GamingCouponModel model,
      {required void Function(bool) callback}) {
    SmartDialog.showLoading<void>();
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.receivedCoupon);
    Map<String, dynamic> req = {
      'bonusId': model.id,
    };
    PGSpi(Bonus.receiveBackWater.toTarget(
      input: req,
    )).rxRequest<bool>((value) {
      if ((value.isNotEmpty) && value['success'] == true) {
        return true;
      }
      return false;
    }).doOnData((event) {
      callback.call(event.success);
      CouponService.sharedInstance.refresh().listen((event) {});
      if (event.success) {
        onRefresh?.call(1);
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen((event) {}, onError: (err) {});
  }

  void _onReceiveAllCouponApi({required void Function(bool) callback}) {
    SmartDialog.showLoading<void>();
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.receivedCoupon);

    PGSpi(Bonus.batchReceiveBonus.toTarget()).rxRequest<bool>((value) {
      if ((value.isNotEmpty) && value['success'] == true) {
        return true;
      }
      return false;
    }).doOnData((event) {
      callback.call(event.success);
      CouponService.sharedInstance.refresh().listen((event) {});
      if (event.success) {
        onRefresh?.call(1);
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen((event) {}, onError: (err) {});
  }

  void onPressFilter() {
    Get.to<CouponFilterResult>(() => const CouponFilterPage())?.then((value) {
      if (value is CouponFilterResult) {
        grantType = value.grantType;
        status = value.status;
        ascSort = value.ascSort;
        typeCode = value.typeCode;
        onRefresh?.call(1);
      }
    });
  }

  void onExchange() {
    Get.toNamed<dynamic>(Routes.exchangeCoupon.route)?.then((value) {
      if (value is bool && value) {
        onRefresh?.call(1);
      }
    });
  }

  void onClickFAQ() {
    MerchantService().getMerchantConfig().listen((event) {
      if (event != null) {
        MerchantCustomConfig? model = event.config;
        String str = UrlTool.addParametersToUrl(
            "${WebUrlService.baseUrl}/"
            "${GoGamingService.sharedInstance.apiLang}/"
            "${model?.cardCenterLink ?? ''}",
            [
              "isApp=1&isDark=${ThemeManager.shareInstacne.isDarkMode ? 1 : 0}",
              GoGamingService.sharedInstance.curToken
            ]);
        H5WebViewManager.sharedInstance.openWebView(
          url: str,
          title: localized('card_center'),
        );
      }
    });
  }

  //一键领取
  void onReceiveAllCoupon() {
    _onReceiveAllCouponApi(callback: (success) {
      if (success) {
        Toast.showSuccessful(localized("coupon.get_succes"));
      } else {
        Toast.showFailed(localized('coupon.get_fail'));
      }
    });
  }
}
