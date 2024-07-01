part of '../currency_deposit_submit_page.dart';

class _FaqView extends StatelessWidget with BaseSingleRenderViewDelegate {
  const _FaqView();

  @override
  SingleRenderViewController get renderController => controller.controller;

  CurrencyDepositSubmitLogic get controller =>
      Get.find<CurrencyDepositSubmitLogic>();

  CurrencyDepositSubmitState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return SingleRenderView(
      delegate: this,
      controller: controller,
      child: Obx(() => Column(
            children: state.data.map((e) {
              return _buildFAQItem(model: e);
            }).toList(),
          )),
    );
  }

  Widget _buildFAQItem({
    required GamingFaqModel model,
  }) {
    return Container(
      margin: EdgeInsets.only(top: 16.dp),
      alignment: Alignment.centerLeft,
      child: ScaleTap(
        opacityMinValue: 0.8,
        scaleMinValue: 0.98,
        onPressed: () {
          H5WebViewManager.sharedInstance.openWebView(
            url: model.webUrl,
            title: localized('faq'),
          );
        },
        child: Text(
          model.title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
            decoration: TextDecoration.underline,
          ),
        ),
      ),
    );
  }
}
