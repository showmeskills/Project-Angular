import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/widget_header.dart';

import 'bank_card_add_logic.dart';

class BankCardAddPage extends StatelessWidget {
  const BankCardAddPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const BankCardAddPage(),
    );
  }

  BankCardAddLogic get logic => Get.put(BankCardAddLogic());

  @override
  Widget build(BuildContext context) {
    Get.put(BankCardAddLogic());
    return Scaffold(
      backgroundColor: GGColors.background.color,
      appBar: GGAppBar.normal(
        title: localized('add_bc'),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: 16.dp),
              child: Column(
                children: [
                  Gaps.vGap24,
                  _buildItem(
                    title: localized('curr'),
                    child: _buildCurrencySelector(),
                  ),
                  Gaps.vGap24,
                  _buildItem(
                    isRequired: false,
                    title: localized('acc_name'),
                    child: _buildAccountName(),
                  ),
                  Gaps.vGap24,
                  _buildItem(
                    title: localized('card_num'),
                    child: Obx(
                      () => GamingTextField(
                        controller: logic.cardNumberController,
                        enabled: logic.currency != null,
                        hintText: localized('enter_card_num'),
                      ),
                    ),
                  ),
                  Gaps.vGap24,
                  _buildItem(
                    title: localized('bn'),
                    child: _buildBankSelector(),
                  ),
                ],
              ),
            ),
          ),
          Material(
            color: GGColors.background.color,
            child: SafeArea(
              child: Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(horizontal: 16.dp).copyWith(
                  bottom: 32.dp,
                  top: 16.dp,
                ),
                child: Obx(() => GGButton.main(
                      onPressed: logic.submit,
                      enable: logic.isEnable,
                      isLoading: logic.isLoading,
                      text: localized('add_bc'),
                    )),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItem({
    required String title,
    bool isRequired = true,
    required Widget child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          textAlign: TextAlign.left,
          text: TextSpan(
            children: [
              TextSpan(text: title),
              if (isRequired)
                TextSpan(
                  text: ' *',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.highlightButton.color,
                  ),
                ),
            ],
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
        ),
        Gaps.vGap4,
        child,
      ],
    );
  }

  Widget _buildContainer({
    required Widget child,
    Color? color,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: 14.dp,
        vertical: color == null ? 16.dp : 17.dp,
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4.dp),
        border: color == null
            ? Border.all(
                color: GGColors.border.color,
                width: 1.dp,
              )
            : null,
      ),
      child: child,
    );
  }

  Widget _buildBankSelector() {
    return Obx(() {
      return GamingSelectorWidget(
        onPressed: logic.selectBank,
        enable: logic.currency != null,
        padding: EdgeInsets.symmetric(
          horizontal: 14.dp,
          vertical: 16.dp,
        ),
        builder: (context) {
          return Row(
            children: [
              Obx(() {
                if (logic.bank == null) {
                  return Gaps.empty;
                }
                return Container(
                  margin: EdgeInsets.only(right: 8.dp),
                  child: Image.asset(
                    logic.bank!.bankIcon,
                    width: 18.dp,
                    height: 18.dp,
                  ),
                );
              }),
              Expanded(
                child: Obx(() {
                  return Text(
                    logic.bank?.bankNameLocal ?? localized('select_bname'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: logic.bank?.bankNameLocal == null
                          ? GGColors.textHint.color
                          : GGColors.textMain.color,
                    ),
                  );
                }),
              ),
            ],
          );
        },
      );
    });
  }

  Widget _buildCurrencySelector() {
    return GamingSelectorWidget(
      onPressed: logic.selectCurrency,
      padding: EdgeInsets.symmetric(
        horizontal: 14.dp,
        vertical: 16.dp,
      ),
      builder: (context) {
        return Row(
          children: [
            Obx(() {
              if (logic.currency == null) {
                return Gaps.empty;
              }
              return Container(
                margin: EdgeInsets.only(right: 8.dp),
                child: GamingImage.network(
                  url: logic.currency!.iconUrl,
                  width: 18.dp,
                  height: 18.dp,
                ),
              );
            }),
            Expanded(
              child: Obx(() {
                return Text(
                  logic.currency?.currency ?? localized('please_select'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: logic.currency?.currency == null
                        ? GGColors.textHint.color
                        : GGColors.textMain.color,
                  ),
                );
              }),
            ),
          ],
        );
      },
    );
  }

  Widget _buildAccountName() {
    return _buildContainer(
      color: GGColors.popBackground.color.withOpacity(0.5),
      child: Text(
        logic.kycName ?? '',
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textMain.color.withOpacity(0.5),
        ),
      ),
    );
  }
}
