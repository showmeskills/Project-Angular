import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../../R.dart';
import '../../../../../common/api/nonsticky/models/gaming_nonsticky_list_model.dart';
import '../../../../../common/api/nonsticky/nonsticky_api.dart';
import '../../../../../common/service/currency/currency_service.dart';
import '../../../../../common/widgets/gg_dialog/dialog_util.dart';
import '../../../../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../logic.dart';

class ActNonestickyItemLogic extends BaseController {
  ActNonestickyItemLogic({required this.item});

  final NonstickyItem item;

  final showDetail = false.obs;
  final detailContent = ''.obs;

  void openDetail() {
    if (detailContent.value.isNotEmpty) {
      showDetail.value = true;
    } else {
      SmartDialog.showLoading<void>();
      _loadDetailContent().listen((event) {
        SmartDialog.dismiss<void>();
        detailContent.value = event;
        showDetail.value = true;
      });
    }
  }

  void buttonClick() {
    if (receivedBonus()) {
      SmartDialog.showLoading<void>();
      _withdrawRequest().listen((event) {
        SmartDialog.dismiss<void>();
        if (event) {
          final listLogic = Get.find<NoneStickyLogic>();
          listLogic.onRefresh!(1);
        }
      });
    } else {
      Get.toNamed<void>(Routes.gameHome.route);
    }
  }

  bool receivedBonus() {
    if ((item.balance ?? 0) > 0 &&
        ((item.currentBetTurnover ?? 0) >= (item.targetBetTurnover ?? 0)) &&
        ((item.currentBetNum ?? 0) >= (item.targetBetNum ?? 0))) {
      return true;
    }
    return false;
  }

  String leftToWallet() {
    final amount = NumberPrecision(NumberPrecision(item.targetBetTurnover)
            .minus(NumberPrecision(item.currentBetTurnover)))
        .balanceText(
            CurrencyService.sharedInstance.isDigital(item.currency ?? ''));
    return amount.stripTrailingZeros();
  }

  Stream<bool> _withdrawRequest() {
    return PGSpi(Nonsticky.withdrawwallet.toTarget(inputData: {
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

  void giveUp() {
    final dialog = DialogUtil(
      context: Get.context!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      contentMaxLine: 10,
      title: localized('give_up_bonus'),
      content: localized('none_sticky_popup_1'),
      rightBtnName: localized('give_up_1'),
      leftBtnName: '',
      moreWidget: SizedBox(
        width: double.infinity,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  localized('none_sticky_popup_2'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                Text(
                  '${NumberPrecision(item.balance).balanceText(true)} ${item.currency}',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.brand.color,
                  ),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  localized('none_sticky_popup_3'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                Text(
                  "${NumberPrecision(NumberPrecision(item.targetBetTurnover).minus(NumberPrecision(item.currentBetTurnover))).balanceText(true)} ${item.currency}",
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.brand.color,
                  ),
                ),
              ],
            ),
            Gaps.vGap12,
          ],
        ),
      ),
      onRightBtnPressed: () {
        Get.back<void>();
        SmartDialog.showLoading<void>();
        _giveUpRequest().listen((event) {
          SmartDialog.dismiss<void>();
          if (event) {
            final listLogic = Get.find<NoneStickyLogic>();
            listLogic.onRefresh!(1);
          }
        });
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  Stream<bool> _giveUpRequest() {
    return PGSpi(Nonsticky.cancelwallet.toTarget(inputData: {
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

  void closeDetail() {
    showDetail.value = false;
  }

  Stream<String> _loadDetailContent() {
    return PGSpi(Nonsticky.getdetail.toTarget(inputData: {
      'code': item.code,
      'isDeposit': false,
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
