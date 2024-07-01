import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_bonus_activity_model.dart';
import 'package:gogaming_app/common/components/extensions/gg_reg_exp.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/widget_header.dart';

enum CodeStatus {
  /// 格式未通过娇艳
  unPass,

  /// 格式合格 可以校验
  passed,

  /// 已经通过校验
  verifyed,
}

class BonusCodeViewController extends BaseController {
  BonusCodeViewController({this.currency, this.codeAmount});

  String? currency;
  double? codeAmount;

  late final GamingTextFieldController codeController =
      GamingTextFieldController(
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.couponCodeRule,
      ),
    ],
    onChanged: (text) {
      if (CodeStatus.verifyed != status.value) {
        status.value =
            codeController.isPass ? CodeStatus.passed : CodeStatus.unPass;
      }
    },
    obscureText: false,
  );

  final status = CodeStatus.unPass.obs;

  String get statusText {
    switch (status.value) {
      case CodeStatus.unPass:
        return '';
      case CodeStatus.passed:
        return localized('voucher_verify');
      case CodeStatus.verifyed:
        return localized('re_enter');
    }
  }

  final codeLoading = false.obs;

  void getCoupon(void Function(GamingBonusActivityModel? model) onConfirm) {
    //领取code对应红利并返回给上级页面
    codeLoading.value = true;
    _exchangCoupon(codeController.text.value).listen((event) {
      codeLoading.value = false;
      onConfirm(event);
      status.value = CodeStatus.verifyed;

      /// 活动描述同步_BonusSelectView 在法币充值用description 其他使用bonusActivityName
      codeController.textController.text =
          codeAmount is double ? event.description : event.bonusActivityName;
    }, onError: (Object err) {
      codeLoading.value = false;
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showFailed(localized("exchange_fail"));
      }
    });
  }

  Stream<GamingBonusActivityModel> _exchangCoupon(String exchangeCode) {
    Map<String, dynamic> req = {
      'couponCode': exchangeCode,
      'amount': codeAmount ?? 0.0,
      if (currency != null) 'currency': currency,
    };
    return PGSpi(Bonus.getCouponDeposit.toTarget(
      input: req,
    )).rxRequest<GamingBonusActivityModel>((value) {
      return GamingBonusActivityModel.fromJson(
          value['data'] as Map<String, dynamic>);
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  void onPressReEnter(
      void Function(GamingBonusActivityModel? model) onConfirm) {
    codeController.textController.clear();
    onConfirm(null);
    status.value = CodeStatus.unPass;
  }
}

class BonusCodeView extends StatelessWidget {
  const BonusCodeView({
    super.key,
    required this.onConfirm,
    this.currency,
    this.codeAmount,
    this.tag,
  });

  final String? currency;
  final double? codeAmount;
  final void Function(GamingBonusActivityModel? model) onConfirm;

  final String? tag;

  BonusCodeViewController get controller =>
      Get.find<BonusCodeViewController>(tag: tag);

  @override
  Widget build(BuildContext context) {
    Get.put(BonusCodeViewController(), tag: tag);
    controller.currency = currency;
    controller.codeAmount = codeAmount;

    return Padding(
      padding: EdgeInsets.only(top: 12.dp),
      child: Obx(
        () => GamingTextField(
          controller: controller.codeController,
          hintText: localized("enter_coupon_code"),
          maxLine: 1,
          readOnly: controller.status.value == CodeStatus.verifyed,
          suffixIcon: ScaleTap(
            onPressed: onPressStatus,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  controller.statusText,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.brand.color,
                  ),
                ),
                Gaps.hGap10,
              ],
            ),
          ),
        ),
      ),
    );
  }

  void onPressStatus() {
    switch (controller.status.value) {
      case CodeStatus.unPass:
        break;
      case CodeStatus.passed:
        controller.getCoupon(onConfirm);
        break;
      case CodeStatus.verifyed:
        controller.onPressReEnter(onConfirm);
        break;
    }
  }
}
