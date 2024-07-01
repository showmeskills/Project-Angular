import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/appeal/common/appeal_common_ui_mixin.dart';
import 'package:gogaming_app/pages/appeal/common/views/appeal_base_view.dart';
import 'package:gogaming_app/pages/appeal/crypto/submit/crypto_appeal_submit_logic.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'crypto_appeal_confirm_logic.dart';

class CryptoAppealConfirmPage extends AppealBaseView<CryptoAppealConfirmLogic>
    with AppealCommonUIMixin {
  const CryptoAppealConfirmPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const CryptoAppealConfirmPage(),
    );
  }

  CryptoAppealSubmitState get state => controller.submitLogic.state;

  @override
  String get title => localized('rech_arriv_inqu01');

  @override
  Widget body(BuildContext context) {
    Get.put(CryptoAppealConfirmLogic());
    return bodyContainer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap20,
          buildTitle(
            localized('confirm_detail'),
          ),
          Gaps.vGap20,
          Container(
            decoration: BoxDecoration(
              color: GGColors.border.color,
              borderRadius: BorderRadius.circular(4.dp),
            ),
            padding: EdgeInsets.all(15.dp),
            child: Column(
              children: [
                _buildTXID(),
                Gaps.vGap24,
                _buildCurrency(),
                Gaps.vGap24,
                _buildNetwork(),
                Gaps.vGap24,
                _buildNumber(),
              ],
            ),
          ),
          Gaps.vGap30,
          Align(
            alignment: Alignment.center,
            child: Text(
              localized('sure_acc'),
              textAlign: TextAlign.center,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.highlightButton.color,
              ),
            ),
          ),
          Gaps.vGap20,
          _buildButton(),
          Gaps.vGap24,
          Align(
            alignment: Alignment.center,
            child: Text(
              localized('process_info'),
              textAlign: TextAlign.center,
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildButton() {
    return Row(
      children: [
        Expanded(
          flex: 53,
          child: GGButton.minor(
            onPressed: _back,
            text: localized('cancels'),
          ),
        ),
        Gaps.hGap8,
        Expanded(
          flex: 47,
          child: Obx(() {
            return GGButton.main(
              onPressed: _submit,
              isLoading: controller.loading,
              text: localized('confirm_button'),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildCurrency() {
    return Row(
      children: [
        buildSubTitle(localized('curr')),
        const Spacer(),
        Obx(() {
          return Text(
            state.currency!.currency!,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
              fontFamily: GGFontFamily.dingPro,
              fontWeight: GGFontWeigh.bold,
            ),
          );
        }),
        Gaps.hGap8,
        Obx(() {
          return GamingImage.network(
            url: state.currency!.iconUrl,
            width: 18.dp,
            height: 18.dp,
          );
        }),
      ],
    );
  }

  Widget _buildNetwork() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('rechar_net')),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Obx(() {
                return Text(
                  state.network!.desc ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                );
              }),
              Gaps.vGap4,
              Obx(() {
                return Text(
                  state.network!.name,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNumber() {
    return Row(
      children: [
        buildSubTitle(localized('quan_rechar')),
        const Spacer(),
        Obx(
          () {
            return Text(
              controller.submitLogic.numberTextFieldController.text.value,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                fontFamily: GGFontFamily.dingPro,
                fontWeight: GGFontWeigh.bold,
              ),
            );
          },
        ),
        Gaps.hGap8,
        Obx(() {
          return GamingImage.network(
            url: state.currency!.iconUrl,
            width: 18.dp,
            height: 18.dp,
          );
        }),
      ],
    );
  }

  Widget _buildTXID() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle('TxID/TxHash'),
        Gaps.vGap6,
        Obx(() {
          return Text(
            controller.submitLogic.txidTextFieldController.text.value,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          );
        }),
      ],
    );
  }
}

extension _Action on CryptoAppealConfirmPage {
  void _submit() {
    controller.submit();
  }

  void _back() {
    Get.back<void>();
  }
}
