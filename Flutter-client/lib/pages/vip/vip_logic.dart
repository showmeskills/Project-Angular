import 'dart:math';

import 'package:card_swiper/card_swiper.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/vip/models/gaming_user_vip_model.dart';
import 'package:gogaming_app/common/api/vip/models/gaming_vip_benefits_model.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_config_model.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/tools/url_tool.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/widget_header.dart';

part 'vip_state.dart';

class VipLogic extends GetxController {
  final state = VipState();
  late Function disposeListen;

  final SwiperController swiperController = SwiperController();

  @override
  void onInit() {
    super.onInit();
    disposeListen = AccountService.sharedInstance.cacheUser.getBox!()
        .listenKey(AccountService.sharedInstance.cacheUser.key, (value) {
      // 只有页面未登录，但是用户已经登录时，刷新数据（userinfo和vipinfo），防止userinfo更新死循环
      if (AccountService.sharedInstance.isLogin && !state.isLogin) {
        _loadData();
      }
      state._isLogin.value = AccountService.sharedInstance.isLogin;
    });
    _loadData();
    GamingDataCollection.sharedInstance.startTimeEvent(TrackEvent.visitVipPage);
  }

  void _loadData() async {
    SmartDialog.showLoading<void>();
    Rx.combineLatestList([
      if (state.isLogin)
        VipService.sharedInstance.refresh().doOnData((event) {
          swiperController.move(state.initIndex);
          state._currentIndex.value = state.initIndex;
        }),
      VipService.sharedInstance.vipBenefit().doOnData((event) {
        state._benefits.value = event;
      }),
    ]).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      SmartDialog.dismiss<void>(status: SmartStatus.loading);
    }).listen(null, onError: (p0, p1) {});
  }

  String getVipCard(int index) {
    if (index > 9) {
      return "assets/images/vip/vip_s_card.png";
    } else {
      return "assets/images/vip/vip_${index}_card.png";
    }
  }

  String getVipDotBg() {
    if (state.isSVip) {
      return "assets/images/vip/s_vip_dot_bg.png";
    } else {
      return "assets/images/vip/vip_dot_bg.png";
    }
  }

  String getVipDot() {
    if (state.isSVip) {
      return "assets/images/vip/s_vip_dot_10.png";
    } else {
      return "assets/images/vip/vip_dot_${state.level}.png";
    }
  }

  void setupCurrentIndex(int index) {
    state._currentIndex.value = index;
  }

  void onPressedBounsFAQ() {
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

  @override
  void onClose() {
    super.onClose();
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.visitVipPage);
    disposeListen.call();
  }
}
