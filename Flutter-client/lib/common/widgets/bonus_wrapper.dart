import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_bonus_activity_model.dart';
import 'package:gogaming_app/common/service/bonus_service.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_bonus_selector.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

import 'bonus_code_view.dart';
import 'bonus_code_wraper.dart';
import 'bonus_select_view.dart';

class BonusWrapperLogic extends BaseController {
  final String tag;
  final bool usedPIQ;
  final String? bonusActivitiesNo;
  bool unknowtmpcode;

  BonusWrapperLogic({
    required this.tag,
    this.unknowtmpcode = false,
    this.usedPIQ = false,
    this.bonusActivitiesNo,
  });

  final state = BonusWrapperState();

  BonusCodeViewController? get codeController =>
      Get.findOrNull<BonusCodeViewController>(tag: tag);

  void setBonus(GamingBonusActivityModel? model) {
    state.bonusObs.value = model;
  }

  void changeBonusIndex(int index) {
    setBonus(null);
    codeController?.onPressReEnter((model) {});
  }

  void openBonusSelector({
    required String currency,
    required double amount,
  }) {
    if (state.bonusLoading) {
      Toast.showTryLater();
      return;
    }
    primaryFocus?.unfocus();
    // 商户1特殊的红利选择器
    if (tag == 'CurrencyDepositPreSubmitLogicM1') {
      GamingBonusSelector.show2(
        currency: currency,
        amount: amount,
        original: state.bonusList,
        selected: state.bonus,
        unknowtmpcode: unknowtmpcode,
        usedPIQ: usedPIQ,
        selectedNo: bonusActivitiesNo,
        onLoadComplate: (event, selected) {
          state.bonusListObs.value = event;
          setBonus(selected);
        },
        onConfirm: ((value) {
          setBonus(value);
        }),
      );
    } else {
      GamingBonusSelector.show(
        original: state.bonusList ?? [],
        selected: state.bonus,
        usedPIQ: usedPIQ,
        amount: amount,
        currency: currency,
        onConfirm: ((value) {
          setBonus(value);
        }),
      );
    }
  }

  void resetBonusList([bool loading = true]) {
    state.bonusListObs.value = null;
    state.bonusLoadingObs.value = loading && !unknowtmpcode;
  }

  void resetBonus() {
    if (!unknowtmpcode) {
      state.bonusObs.value = null;
    }
  }

  /// [filter] removeWhere过滤
  Stream<void> loadBonus({
    required String currency,
    double? amount,
    String? payment,
    bool Function(GamingBonusActivityModel)? filter,
  }) {
    resetBonusList(!unknowtmpcode);
    return BonusService.loadBonus(
      currency: currency,
      payment: payment,
      amount: amount,
      filter: filter,
    ).doOnData((event) {
      state.bonusListObs.value = event;
      setBonus(BonusService.setDefaultBonus(
        list: event,
        bonus: state.bonus,
        bonusActivitiesNo: bonusActivitiesNo,
        unknowtmpcode: unknowtmpcode,
      ));
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
      resetBonus();
    }).doOnDone(() {
      if (!unknowtmpcode) {
        state.bonusLoadingObs.value = false;
      }
    });
  }
}

class BonusWrapperState {
  final RxBool bonusLoadingObs = false.obs;
  bool get bonusLoading => bonusLoadingObs.value;

  late final bonusListObs = () {
    List<GamingBonusActivityModel>? model;
    return model.obs;
  }();
  List<GamingBonusActivityModel>? get bonusList => bonusListObs.value;

  late final bonusObs = () {
    GamingBonusActivityModel? model;
    return model.obs;
  }();
  GamingBonusActivityModel? get bonus => bonusObs.value;

  bool get hasCode =>
      bonusList?.firstWhereOrNull(
          (e) => e.bonusActivitiesNo == 'couponcodedeposit') !=
      null;

  // 是否不需要红利
  // 为true时只加载红利反之可选择
  bool unknowtmpcode = false;
}

class BonusWrapper extends StatelessWidget {
  const BonusWrapper({
    super.key,
    required this.tag,
    required this.currency,
    required this.amount,
    this.codeAmount,
  });

  final String tag;
  final String currency;
  final double amount;
  final double? codeAmount;

  BonusWrapperLogic get logic => Get.find<BonusWrapperLogic>(tag: tag);

  BonusWrapperState get state => logic.state;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      return BonusCodeWrapper(
        enable: !state.bonusLoading,
        bonusSelectView: BonusSelectView(
          onPressed: () {
            logic.openBonusSelector(
              currency: currency,
              amount: amount,
            );
          },
          hiddenTitle: state.hasCode,
          bonusLoading: state.bonusLoading,
          showMinDeposit: logic.usedPIQ,
          selected: state.bonus,
        ),
        codeView: BonusCodeView(
          tag: tag,
          onConfirm: logic.setBonus,
          currency: currency,
          codeAmount: codeAmount,
        ),
        changeIndex: logic.changeBonusIndex,
        hasCode: state.hasCode,
      );
    });
  }
}
