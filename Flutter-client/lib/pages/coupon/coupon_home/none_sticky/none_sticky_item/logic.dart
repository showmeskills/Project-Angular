import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/coupon_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';

import '../../../../../R.dart';
import '../../../../../common/api/nonsticky/models/gaming_nonsticky_list_model.dart';
import '../../../../../common/api/nonsticky/nonsticky_api.dart';
import '../../../../../common/lang/locale_lang.dart';
import '../../../../../common/service/currency/currency_service.dart';
import '../../../../../common/widgets/gg_dialog/dialog_util.dart';
import '../../../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../../../../router/customer_middle_ware.dart';
import '../logic.dart';

class NonestickyItemLogic extends BaseController {
  NonestickyItemLogic({required this.item, required this.isCasino});

  final NonstickyItem item;
  final bool isCasino;

  final showDetail = false.obs;
  final detailContent = ''.obs;

  void openDetail() {
    if (detailContent.value.isNotEmpty) {
      showDetail.value = true;
    } else {
      SmartDialog.showLoading<void>();
      _loadDetailContent().listen((event) {
        detailContent.value = event;
        showDetail.value = true;
      });
    }
  }

  bool get isVerifyStatus {
    return KycService.sharedInstance.primaryPassed ||
        (AccountService.sharedInstance.gamingUser?.isBindMobile ?? false);
  }

  void freeSpinButtonClick() {
    /// 只有 false 需要弹窗，null 等同 true
    if (item.countryCheck == false) {
      _showKycErrorDialog();
      return;
    }

    if (item.isDeposit ?? false) {
      /// 存储活动 id 给到存款页面
      CouponService.sharedInstance.setBonusActivitiesNo(item.tmpCode);
      DepositRouterUtil.goDepositHome();
    } else {
      /// free spin 进入游戏前，用户默认钱包必须和 free spin 卡券一致，否则无法使用免费旋转次数
      final selectedCurrency = CurrencyService.sharedInstance[item.currency!];
      if (selectedCurrency != null) {
        CurrencyService.sharedInstance.selectedCurrency = selectedCurrency;
      }
      Get.offAndToNamed<void>(Routes.gamePlayReady.route, arguments: {
        'providerId': item.providerCatId,
        'gameId': item.gameId,
      });
    }
  }

  void buttonClick() {
    if ((item.countryCheck ?? false) == false) {
      _showKycErrorDialog();
      return;
    }

    if (item.isDeposit ?? false) {
      /// 存储活动 id 给到存款页面
      CouponService.sharedInstance.setBonusActivitiesNo(item.tmpCode);
      DepositRouterUtil.goDepositHome();
    } else {
      _activate();
    }
  }

  void _showKycErrorDialog() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('hint'),
      content: localized('bonus_wrong_region_tips'),
      contentMaxLine: 3,
      leftBtnName: localized('cancels'),
      rightBtnName: localized('online_cs'),
      onRightBtnPressed: () {
        CustomerServiceRouter().toNamed();
      },
      onLeftBtnPressed: () {
        Get.back<void>();
      },
    ).showNoticeDialogWithTwoButtons();
  }

  void _activate() {
    final listLogic = Get.find<NoneStickyLogic>();
    if ((listLogic.state.activatedModel.value.liveCasinoBonus != null &&
            !isCasino) ||
        (listLogic.state.activatedModel.value.casinoBonus != null &&
            isCasino)) {
      _showErrorDialog(isCasino);
      return;
    }
    SmartDialog.showLoading<void>();
    _activateRequest().listen((event) {
      SmartDialog.dismiss<void>();
      if (event) {
        final listLogic = Get.find<NoneStickyLogic>();
        listLogic.onRefresh!(1);
      }
    });
  }

  Stream<bool> _activateRequest() {
    return PGSpi(Nonsticky.activatewallet.toTarget(inputData: {
      'code': item.code,
    })).rxRequest<bool>((value) {
      final success = value['success'];
      if (success is bool) {
        return success;
      }
      return false;
    }).doOnError((err, p1) {
      SmartDialog.dismiss<void>();
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  void _showErrorDialog(bool isCasino) {
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('tips'),
      content:
          isCasino ? localized('casino_tips') : localized('live_casino_tips'),
      contentMaxLine: 5,
      leftBtnName: '',
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  void closeDetail() {
    showDetail.value = false;
  }

  Stream<String> _loadDetailContent() {
    return PGSpi(Nonsticky.getdetail.toTarget(inputData: {
      'code': item.code,
      'isDeposit': item.isDeposit,
      'isFreeSpin': item.isFreeSpin ?? false,
      'category': item.category,
    })).rxRequest<String>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        final content = data['content'];
        if (content is String) {
          return content;
        }
      }
      return '';
    }).doOnDone(() {
      SmartDialog.dismiss<void>();
    }).doOnError((err, p1) {
      SmartDialog.dismiss<void>();
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }
}
