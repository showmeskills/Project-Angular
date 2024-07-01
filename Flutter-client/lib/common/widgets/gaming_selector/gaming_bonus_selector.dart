import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_bonus_activity_model.dart';
import 'package:gogaming_app/common/components/extensions/gg_reg_exp.dart';
import 'package:gogaming_app/common/painting/bonus_shape_border.dart';
import 'package:gogaming_app/common/painting/r_dotted_line_border.dart';
import 'package:gogaming_app/common/service/bonus_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_selector.dart';

class GamingBonusSelectorController
    extends GamingSelectorController<GamingBonusActivityModel> {
  GamingBonusSelectorController({
    List<GamingBonusActivityModel>? original,
    Stream<List<GamingBonusActivityModel>> Function()? onLoadDataStream,
    GamingBonusActivityModel? selected,
    String? selectedNo,
  }) : super(
          original: original ?? [],
          onLoadDataStream: original != null ? null : onLoadDataStream,
        ) {
    _selected.value = selected;
    if (original?.isNotEmpty ?? false) {
      final result = original?.firstWhereOrNull(
          (element) => (element.bonusActivitiesNo == selectedNo));
      if (result != null) {
        _selected.value = result;
      }
    }
  }

  final _selected = () {
    GamingBonusActivityModel? selected;
    return selected.obs;
  }();
  GamingBonusActivityModel? get selected => _selected.value;
  late final bonusTitle = localized('use_coupon').obs;
  bool get isUseCode => bonusTitle.value == localized('use_coupon_code');
  late final GamingTextFieldController codeController =
      GamingTextFieldController(
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.couponCodeRule,
      ),
    ],
    onChanged: (text) {
      codeButtonEnable.value = codeController.isPass;
    },
    obscureText: false,
  );
  final codeButtonEnable = false.obs;
  final codeLoading = false.obs;
  String? currency;
  double? codeAmount;

  /// 是否显示使用券码/使用优化券的tab
  final showTab = false.obs;

  void checkCouponCodeExist() {
    list.removeWhere((element) {
      final result = element.bonusActivitiesNo == 'couponcodedeposit';
      if (result) {
        showTab.value = true;
      }
      return result;
    });
  }

  void setBonusTitle(String text) {
    if (bonusTitle.value == text) return;

    bonusTitle.value = text;
    codeController.textController.clear();
  }

  void pressCouponCode(
      void Function(GamingBonusActivityModel? model) onConfirm) {
    //领取code对应红利并返回给上级页面
    codeLoading.value = true;
    _exchangCoupon(codeController.text.value).listen((event) {
      codeLoading.value = false;
      Get.back(result: event);
      onConfirm(event);
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

  @override
  void select(int index) {
    if (selected == list[index]) {
      _selected.value = null;
      return;
    }
    _selected.value = list[index];
  }
}

class GamingBonusSelector {
  static Future<GamingBonusActivityModel?> show2({
    required String currency,
    double? amount,
    void Function(List<GamingBonusActivityModel>, GamingBonusActivityModel?)?
        onLoadComplate,
    List<GamingBonusActivityModel>? original,
    GamingBonusActivityModel? selected,
    // 部分代码只能获取到红利活动编号，所以需要传入编号
    String? selectedNo,
    // 是否不需要红利，默认需要
    bool unknowtmpcode = false,
    bool usedPIQ = false,
    required void Function(GamingBonusActivityModel? model) onConfirm,
  }) {
    late GamingBonusSelectorController controller;
    controller = GamingBonusSelectorController(
      selected: selected,
      original: original,
      onLoadDataStream: () {
        return BonusService.loadBonus(
          currency: currency,
          amount: amount,
        ).doOnData((event) async {
          // _GamingSelectorData.list数据同时在doOnData刷新，存在时序问题
          // 所以使用异步delay处理
          await Future<void>.delayed(Duration.zero);
          controller.checkCouponCodeExist();
          controller._selected.value = BonusService.setDefaultBonus(
            list: event,
            bonus: controller._selected.value,
            bonusActivitiesNo: selectedNo,
            unknowtmpcode: unknowtmpcode,
          );

          onLoadComplate?.call(event, controller.selected);
        });
      },
    );
    controller.currency = currency;
    controller.codeAmount = 0.0; //欧洲版本默认传十万，这里用到卡券的参数传0.0
    if (original?.isNotEmpty == true) {
      controller.checkCouponCodeExist();
    }
    return _show(
      controller: controller,
      usedPIQ: usedPIQ,
      onConfirm: onConfirm,
    );
  }

  static Future<GamingBonusActivityModel?> show({
    required List<GamingBonusActivityModel> original,
    GamingBonusActivityModel? selected,
    bool usedPIQ = false,
    required void Function(GamingBonusActivityModel? model) onConfirm,
    String? currency,
    double? amount,
  }) {
    final controller = GamingBonusSelectorController(
      original: original,
      selected: selected,
    );
    controller.currency = currency;
    controller.codeAmount = amount;
    controller.checkCouponCodeExist();
    return _show(
      controller: controller,
      usedPIQ: usedPIQ,
      onConfirm: onConfirm,
    );
  }

  static Future<GamingBonusActivityModel?> _show({
    required GamingBonusSelectorController controller,
    bool usedPIQ = false,
    required void Function(GamingBonusActivityModel? model) onConfirm,
  }) {
    return GamingBottomSheet.showModalBottomSheet2<GamingBonusActivityModel?>(
      title: localized('select_bonus00'),
      useCloseButton: true,
      centerTitle: false,
      fixedHeight: false,
      isDismissible: true,
      builder: (context) {
        return SizedBox(
          width: double.infinity,
          height: (Get.height - 58.dp) * 0.6,
          child: GamingSelectorView<GamingBonusActivityModel>(
            safeAreaBottom: false,
            headerBuilder: GamingSelectorHeaderContentView(
              builder: (context) {
                return _buildHeaderContent(controller, onConfirm);
              },
            ),
            itemBuilder: (context, e, index) {
              return Obx(
                () => Visibility(
                  visible: !controller.isUseCode,
                  child: _GamingBonusSelectorItem(
                    data: e,
                    selected: controller.selected?.bonusActivitiesNo ==
                        e.bonusActivitiesNo,
                    usedPIQ: usedPIQ,
                  ),
                ),
              );
            },
            controller: controller,
            isScrollControlled: true,
          ),
        );
      },
      footerExpandBuilder: (p0) {
        return Obx(
          () => Opacity(
            opacity: controller.isUseCode ? 0 : 1,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Gaps.hGap16,
                    Expanded(
                      child: GGButton.minor(
                        text: localized('no_thanks'),
                        onPressed: () {
                          Get.back(result: null);
                          onConfirm(null);
                        },
                      ),
                    ),
                    Gaps.hGap16,
                  ],
                ),
                Gaps.vGap20,
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.symmetric(horizontal: 16.dp),
                  child: Obx(
                    () => GGButton.main(
                      text: localized('confirm_button'),
                      enable: controller.selected != null,
                      onPressed: () {
                        Get.back(result: controller.selected);
                        onConfirm(controller.selected);
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  static Widget _buildHeaderContent(
    GamingBonusSelectorController controller,
    void Function(GamingBonusActivityModel? model) onConfirm,
  ) {
    Widget buildAmountButton(String text) {
      return Obx(() {
        final isSelected = controller.bonusTitle.value == text;
        return GGButton(
          backgroundColor: isSelected
              ? GGColors.brand.color
              : GGColors.bonusUnselected.color,
          height: 40.dp,
          radius: 20.dp,
          textStyle: GGTextStyle(
            color: isSelected
                ? GGColors.buttonTextWhite.color
                : GGColors.textMain.color,
            fontSize: GGFontSize.content,
          ),
          onPressed: () => controller.setBonusTitle(text),
          text: text,
        );
      });
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Flexible(
              child: Text(
                localized('select_bonus01'),
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textMain.color,
                ),
              ),
            ),
            ScaleTap(
              opacityMinValue: 0.8,
              scaleMinValue: 0.98,
              onPressed: () {
                Get.toNamed<dynamic>(Routes.couponHome.route);
              },
              child: Text(
                localized('g_t_view00'),
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.brand.color,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 20.dp),
        Obx(
          () => Visibility(
            visible: controller.showTab.value,
            child: Row(
              children: [
                Expanded(child: buildAmountButton(localized('use_coupon'))),
                SizedBox(width: 20.dp),
                Expanded(
                    child: buildAmountButton(localized('use_coupon_code'))),
              ],
            ),
          ),
        ),
        Obx(
          () => Visibility(
            visible: controller.isUseCode,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: EdgeInsets.only(top: 20.dp),
                  child: GamingTextField(
                    controller: controller.codeController,
                    hintText: localized("enter_coupon_code"),
                    maxLine: 1,
                  ),
                ),
                Gaps.vGap20,
                SizedBox(
                  width: double.infinity,
                  child: Obx(
                    () => GGButton.main(
                      text: localized('confirm_button'),
                      enable: controller.codeButtonEnable.value,
                      isLoading: controller.codeLoading.value,
                      onPressed: () {
                        controller.pressCouponCode(onConfirm);
                      },
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _GamingBonusSelectorItem extends StatelessWidget {
  const _GamingBonusSelectorItem({
    required this.data,
    this.selected = false,
    this.usedPIQ = false,
  });

  final GamingBonusActivityModel data;
  final bool selected;
  final bool usedPIQ;

  bool get hasLabel =>
      data.prizeTypeText != null ||
      data.activityTypeText != null ||
      data.labels.isNotEmpty;

  @override
  Widget build(BuildContext context) {
    final color = selected ? GGColors.brand.color : GGColors.border.color;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 8.dp),
      child: Container(
        decoration: ShapeDecoration(
          shape: BonusShapeBorder(
            color: color,
            iconColor: GGColors.buttonTextWhite.color,
            size: selected ? Size(32.dp, 32.dp) : Size.zero,
            aligemnt: Alignment.topRight,
            radius: 4.dp,
            holeSize: 20.dp,
            side: BorderSide(
              color: color,
              width: 1.dp,
            ),
          ),
        ),
        padding: EdgeInsets.symmetric(
          horizontal: 20.dp,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: EdgeInsets.only(top: 12.dp, bottom: 10.dp),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Text(
                      data.bonusActivityName,
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        fontWeight: GGFontWeigh.bold,
                        color: GGColors.textMain.color,
                      ),
                    ),
                  ),
                  Gaps.hGap10,
                  _buildRight(),
                ],
              ),
            ),
            if (hasLabel) _buildLables(),
            if (!usedPIQ &&
                (data.projectedIncome > 0 || data.bonusFixedUsdt > 0))
              Container(
                margin: EdgeInsets.only(top: 10.dp),
                child: _buildIncome(),
              ),
            Gaps.vGap10,
            _buildBottom(),
          ],
        ),
      ),
    );
  }

  Widget _buildBottom() {
    if (usedPIQ) {
      if (data.rateVos?.firstOrNull != null) {
        return Container(
          padding: EdgeInsets.only(bottom: 12.dp),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Flexible(
                child: Text(
                  '${localized('mini_deposit')} ${data.rateVos!.firstOrNull!.minDepositUsdt.toStringAsFixed(2)}',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
              Gaps.hGap4,
              GamingImage.network(
                url: CurrencyService.sharedInstance.getIconUrl('USDT'),
                width: 14.dp,
                height: 14.dp,
              )
            ],
          ),
        );
      }
    } else {
      if (data.projectedOrdNum != null && (data.projectedTotalNum ?? 0) > 1) {
        return Container(
          decoration: BoxDecoration(
            border: RDottedLineBorder(
              top: BorderSide(
                width: 1.dp,
                color: GGColors.border.color,
              ),
            ),
          ),
          padding: EdgeInsets.symmetric(vertical: 12.dp),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  localized('deposit_acitivity_count',
                      params: [data.projectedOrdNum!.toString()]),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
              // Gaps.hGap8,
              // GamingPopupLinkWidget(
              //   popup: _buildTips(),
              //   followerAnchor: Alignment.bottomRight,
              //   targetAnchor: Alignment.topRight,
              //   offset: Offset(20.dp, -7.dp),
              //   triangleInset: EdgeInsets.only(right: 22.5.dp),
              //   triangleSize: Size(10.dp, 6.dp),
              //   contentPadding: EdgeInsets.all(10.dp),
              //   child: SvgPicture.asset(
              //     R.iconQuestion,
              //     width: 14.dp,
              //     height: 14.dp,
              //     color: GGColors.textSecond.color,
              //   ),
              // ),
            ],
          ),
        );
      }
    }
    return Gaps.empty;
  }

  Widget _buildRight() {
    String? text;
    if (data.prizeAmountType == 2 && data.returnPercentage > 0) {
      text = '${data.returnPercentage.stripTrailingZeros()}%';
    }
    if (!usedPIQ && data.prizeAmountType == 1 && data.bonusFixedUsdt > 0) {
      text = '${data.bonusFixedUsdtText}USDT';
    }
    if (data.prizeType == 6) {
      text = '${data.freeSpinTimes} ${localized("times_for_none")}';
    }
    if (text != null) {
      return Text(
        text,
        style: GGTextStyle(
          fontSize: GGFontSize.bigTitle20,
          fontWeight: GGFontWeigh.bold,
          color: GGColors.textMain.color,
          height: 1.44,
        ),
      );
    }
    return Gaps.empty;
  }

  Widget _buildLables() {
    return Wrap(
      runSpacing: 8.dp,
      spacing: 10.dp,
      children: [
        if (data.activityTypeText != null)
          _buildLabel(
            data.activityTypeText!,
          ),
        if (data.prizeTypeText != null)
          _buildLabel(
            data.prizeTypeText!,
          ),
        ...data.labels.map(
          (e) => _buildLabel(e),
        ),
      ],
    );
  }

  Widget _buildIncome() {
    if (data.projectedIncome > 0) {
      return Container(
        height: 30.dp,
        alignment: Alignment.centerRight,
        child: _buildProjectedIncome(),
      );
    }
    return Gaps.empty;
  }

  // Widget _buildFixedIncome() {
  //   if (data.bonusFixedUsdtText == null) {
  //     return Gaps.empty;
  //   }
  //   return Row(
  //     children: [
  //       Text(
  //         localized('amo_bonu00'),
  //         style: GGTextStyle(
  //           fontSize: GGFontSize.content,
  //           color: GGColors.textSecond.color,
  //         ),
  //       ),
  //       Container(
  //         margin: EdgeInsets.only(left: 6.dp),
  //         child: Text(
  //           data.bonusFixedUsdtText!,
  //           style: GGTextStyle(
  //             fontSize: GGFontSize.content,
  //             fontWeight: GGFontWeigh.bold,
  //             color: GGColors.textMain.color,
  //           ),
  //         ),
  //       ),
  //       Container(
  //         margin: EdgeInsets.only(left: 6.dp),
  //         child: GamingImage.network(
  //           url: GamingCurrencyModel.usdt().iconUrl,
  //           width: 14.dp,
  //           height: 14.dp,
  //         ),
  //       ),
  //     ],
  //   );
  // }

  Widget _buildProjectedIncome() {
    return Row(
      children: [
        Text(
          localized('estimated_income'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Container(
          margin: EdgeInsets.only(left: 6.dp),
          child: Text(
            data.projectedIncomeText!,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.bold,
              color: GGColors.textMain.color,
            ),
          ),
        ),
        if (data.projectedCurrency != null)
          Container(
            margin: EdgeInsets.only(left: 6.dp),
            child: GamingImage.network(
              url: CurrencyService.sharedInstance
                  .getIconUrl(data.projectedCurrency!),
              width: 14.dp,
              height: 14.dp,
            ),
          ),
      ],
    );
  }

  // Widget _buildTips() {
  //   return Container(
  //     constraints: BoxConstraints(
  //       maxWidth: 195.dp,
  //     ),
  //     child: Text(
  //       localized('steps'),
  //       style: GGTextStyle(
  //         fontSize: GGFontSize.hint,
  //         color: GGColors.textBlackOpposite.color,
  //       ),
  //     ),
  //   );
  // }

  Widget _buildLabel(String text) {
    return UnconstrainedBox(
      child: Container(
        height: 30.dp,
        padding: EdgeInsets.symmetric(
          horizontal: 12.dp,
        ),
        decoration: ShapeDecoration(
          shape: const StadiumBorder(),
          color: GGColors.border.color,
        ),
        alignment: Alignment.center,
        child: Text(
          text,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
      ),
    );
  }
}
