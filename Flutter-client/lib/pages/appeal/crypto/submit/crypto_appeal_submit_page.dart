import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/appeal/common/appeal_common_ui_mixin.dart';
import 'package:gogaming_app/pages/appeal/common/views/appeal_base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'crypto_appeal_submit_logic.dart';

class CryptoAppealSubmitPage extends AppealBaseView<CryptoAppealSubmitLogic>
    with AppealCommonUIMixin {
  const CryptoAppealSubmitPage({super.key});

  CryptoAppealSubmitState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const CryptoAppealSubmitPage(),
    );
  }

  @override
  String get title => localized('rech_arriv_inqu01');

  @override
  Widget body(BuildContext context) {
    Get.put(CryptoAppealSubmitLogic());
    return bodyContainer(
      child: SingleChildScrollView(
        child: Column(
          children: [
            Gaps.vGap20,
            _buildHeader(),
            Gaps.vGap50,
            _buildCurrencySelector(),
            Gaps.vGap28,
            _buildNetworkSelector(),
            Gaps.vGap28,
            _buildNumberTextField(),
            Gaps.vGap28,
            _buildTXIDTextField(),
            Gaps.vGap32,
            _buildButton(),
            Gaps.vGap20,
            Obx(() {
              if (!state.exist) {
                return Gaps.empty;
              }
              return buildTips(localized('txid_exist'));
            }),
            Gaps.vGap12,
            _buildViewRecordButton(),
            SafeArea(
              minimum: EdgeInsets.only(bottom: 24.dp),
              child: Gaps.empty,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildViewRecordButton() {
    return ScaleTap(
      onPressed: _back,
      child: Text(
        localized('view_recent_record'),
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.brand.color,
          decoration: TextDecoration.underline,
        ),
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
              enable: state.enable,
              isLoading: state.loading,
              onPressed: _submit,
              text: localized('confirm_button'),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildCurrencySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('curr')),
        Gaps.vGap10,
        GamingSelectorWidget(
          onPressed: controller.selectCurrency,
          builder: (context) {
            return Obx(() {
              if (state.currency == null) {
                return Text(
                  localized('choose_depo'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textHint.color,
                  ),
                );
              }
              return Row(
                children: [
                  GamingImage.network(
                    url: state.currency?.iconUrl,
                    width: 18.dp,
                    height: 18.dp,
                  ),
                  Gaps.hGap10,
                  Text(
                    state.currency!.currency!,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                      fontFamily: GGFontFamily.dingPro,
                      fontWeight: GGFontWeigh.bold,
                    ),
                  ),
                  Gaps.hGap4,
                  Text(
                    state.currency!.name ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                      fontFamily: GGFontFamily.dingPro,
                    ),
                  ),
                ],
              );
            });
          },
        ),
      ],
    );
  }

  Widget _buildNetworkSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('sel_net')),
        Gaps.vGap10,
        GamingSelectorWidget(
          onPressed: controller.selectNetwork,
          builder: (context) {
            return Obx(() {
              if (state.network == null) {
                return Text(
                  localized('select_re_net'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textHint.color,
                  ),
                );
              } else {
                return Row(
                  children: [
                    Text(
                      state.network!.name,
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textMain.color,
                        fontFamily: GGFontFamily.dingPro,
                        fontWeight: GGFontWeigh.bold,
                      ),
                    ),
                    Gaps.hGap4,
                    Text(
                      state.network!.desc ?? '',
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                        fontFamily: GGFontFamily.dingPro,
                      ),
                    ),
                  ],
                );
              }
            });
          },
        ),
      ],
    );
  }

  Widget _buildNumberTextField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('recharge_num00')),
        Gaps.vGap10,
        GamingTextField(
          controller: controller.numberTextFieldController,
          hintText: localized('fill_rechar_num'),
          contentPadding: EdgeInsets.symmetric(
            horizontal: 14.dp,
            vertical: 14.dp,
          ),
          fillColor: GGColors.transparent,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [
            FilteringTextInputFormatter.allow(
              RegExp(r'([1-9]\d*\.?\d*)|(^(0){1}$)|(0\.\d*)'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTXIDTextField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle('TxID/TxHash'),
        Gaps.vGap10,
        GamingTextField(
          controller: controller.txidTextFieldController,
          hintText: localized('enter_texid'),
          contentPadding: EdgeInsets.symmetric(
            horizontal: 14.dp,
            vertical: 14.dp,
          ),
          fillColor: GGColors.transparent,
        ),
      ],
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Text(
          localized('fill_help'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap20,
        ScaleTap(
          onPressed: _onPressedHelp,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              SvgPicture.asset(
                R.iconHelpGuide,
                width: 18.dp,
                height: 18.dp,
              ),
              Text(
                localized('self_guide'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                ),
              ),
            ],
          ),
        ),
        Gaps.vGap20,
        buildTips(localized('note_return_info')),
      ],
    );
  }
}

extension _Action on CryptoAppealSubmitPage {
  void _submit() {
    controller.checkTXIDExists();
  }

  void _back() {
    Get.back<void>();
  }

  void _onPressedHelp() {
    String helpUrl = '';
    if (MerchantService.sharedInstance.merchantConfigModel?.config
            ?.noReceivedUrl?.isNotEmpty ??
        false) {
      helpUrl = WebUrlService.url2(MerchantService
              .sharedInstance.merchantConfigModel?.config?.noReceivedUrl ??
          '');
    }
    H5WebViewManager.sharedInstance.openWebView(
      url: helpUrl,
      title: localized('dep_crypto'),
    );
  }
}
