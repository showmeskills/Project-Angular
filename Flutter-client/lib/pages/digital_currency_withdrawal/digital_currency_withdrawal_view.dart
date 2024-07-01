import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:gogaming_app/common/api/faq/models/gaming_faq_model.dart';
import 'package:gogaming_app/common/api/withdraw/models/gaming_withdraw_result_model.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/withdraw_router_util.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/digital_currency_withdrawal/digital_withdraw_history/digital_currency_withdrawal_history_view.dart';
import 'package:gogaming_app/pages/digital_currency_withdrawal/digital_withdraw_result/digital_withdrawal_result_logic.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:intl/intl.dart';

import '../main/main_logic.dart';
import 'digital_currency_withdrawal_logic.dart';

part 'digital_withdraw_result/digital_withdrawal_result_view.dart';
part 'withdrawal_last_confirm_sheet.dart';
part 'withdrawal_limit_tip_widget.dart';

class DigitalCurrencyWithdrawalPage
    extends BaseView<DigitalCurrencyWithdrawalLogic>
    with BaseSingleRenderViewDelegate {
  const DigitalCurrencyWithdrawalPage({Key? key, this.category = ''})
      : super(key: key);
  final String? category;

  DigitalCurrencyWithdrawalLogic get logic =>
      Get.find<DigitalCurrencyWithdrawalLogic>();

  DigitalCurrencyWithdrawalState get state => controller.state;

  @override
  SingleRenderViewController get renderController => logic.controller;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () {
        String category = '';
        if (Get.arguments != null) {
          Map<String, dynamic> arguments =
              Get.arguments as Map<String, dynamic>;
          if (arguments.containsKey('category')) {
            category = arguments['category'].toString();
          }
        }
        return DigitalCurrencyWithdrawalPage(
          category: category,
        );
      },
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      leadingIcon: const GamingCloseButton(
        onPressed: WithdrawRouterUtil.close,
      ),
      title: localized('wd_crypto'),
      centerTitle: false,
      actions: [_buildSwitchButton()],
    );
  }

  Widget _buildSwitchButton() {
    return GestureDetectorHitTestWithoutSizeLimit(
      extraHitTestArea: EdgeInsets.all(6.dp),
      onTap: WithdrawRouterUtil.goCurrencyWithdraw,
      child: Padding(
        padding: EdgeInsetsDirectional.only(end: 16.dp),
        child: GGButton.main(
          onPressed: WithdrawRouterUtil.goCurrencyWithdraw,
          backgroundColor: GGColors.border.color,
          text: localized('wd_fiat'),
          height: 33.dp,
          space: 5.dp,
          textStyle: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textMain.color,
          ),
          image: SvgPicture.asset(
            R.iconArrowRightAlt,
            width: 10.dp,
            height: 10.dp,
            color: GGColors.textSecond.color,
          ),
          imageAlignment: AlignmentDirectional.centerEnd,
        ),
      ),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(DigitalCurrencyWithdrawalLogic(inputCurrency: category));
    return SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Obx(() {
          return _buildContent(context);
        }));
  }

  Widget _buildContent(BuildContext context) {
    return Column(
      children: [
        _buildTitleWidget(context),
        _buildWithdrawal(),
      ],
    );
  }

  Widget _buildTitleWidget(BuildContext context) {
    if (state.hasFreeze.value) {
      return _buildFreezeWidget();
    } else {
      return _buildExplain(context);
    }
  }

  /// 提现说明
  Widget _buildExplain(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        Stack(
          children: [
            verticalLine(),
            _buildExplainDetail(context),
          ],
        ),
        _buildInstructions(),
        Gaps.vGap24,
      ],
    );
  }

  Widget _buildExplainDetail(BuildContext context) {
    return Column(
      children: [
        _buildStep(1, context),
        _buildStep(2, context),
        _buildStep(3, context),
        _buildStep(4, context),
      ],
    );
  }

  Widget _buildInstructions() {
    return RichText(
      textAlign: TextAlign.left,
      text: TextSpan(
        children: [
          TextSpan(
            text: localized('dc_info'),
            style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
                // fontFamily: GGFontFamily.c(),
                fontWeight: GGFontWeigh.regular),
          ),
          TextSpan(
              text: localized('heres'),
              style: GGTextStyle(
                  color: GGColors.highlightButton.color,
                  fontSize: GGFontSize.content,
                  // fontFamily: GGFontFamily.c(),
                  fontWeight: GGFontWeigh.regular),
              recognizer: TapGestureRecognizer()
                ..onTap = () {
                  Get.offAndToNamed<void>(Routes.fiatWithdraw.route);
                }),
        ],
      ),
    );
  }

  Widget verticalLine() {
    return Container(
      width: 24.dp,
      padding: EdgeInsets.only(top: 10.dp),
      alignment: Alignment.center,
      child: Container(
        width: 2.dp,
        height: 200.dp,
        color: GGColors.highlightButton.color,
      ),
    );
  }

  Widget _buildStep(int index, BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 24.dp,
          height: 24.dp,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: GGColors.highlightButton.color,
            borderRadius: BorderRadius.all(Radius.circular(12.0.dp)),
          ),
          child: Text('$index',
              style: GGTextStyle(
                color: GGColors.buttonTextWhite.color,
                fontSize: GGFontSize.smallTitle,
                fontWeight: GGFontWeigh.regular,
              )),
        ),
        Gaps.hGap12,
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(getStepStr(index),
                style: GGTextStyle(
                  color: GGColors.textMain.color,
                  fontSize: GGFontSize.content,
                  fontWeight: GGFontWeigh.regular,
                )),
            Gaps.vGap4,
            Container(
              constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width - 70.dp),
              child: Text(
                getStepStrHit(index),
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.hint,
                  fontWeight: GGFontWeigh.regular,
                ),
                maxLines: 2,
              ),
            ),
            Gaps.vGap24,
          ],
        ),
      ],
    );
  }

  String getStepStr(int index) {
    switch (index) {
      case 1:
        return localized('init_coin');
      case 2:
        return localized('get_add');
      case 3:
        return localized('net_comfirm');
      case 4:
        return localized('wd_success');
      default:
        return '';
    }
  }

  String getStepStrHit(int index) {
    switch (index) {
      case 1:
        return localized('wait_block_trans');
      case 2:
        return localized('paste_re_add');
      case 3:
        return localized('wait_confirm');
      case 4:
        return localized('wd_send_add');
      default:
        return '';
    }
  }

  /// 账户冻结
  Widget _buildFreezeWidget() {
    return Visibility(
        visible: state.hasFreeze.value,
        child: Column(
          children: [
            Image.asset(
              R.iconFreezeError,
              width: 54.dp,
              height: 54.dp,
              fit: BoxFit.contain,
            ),
            Gaps.vGap16,
            Text(
              localized('lock_part'),
              style: GGTextStyle(
                  color: GGColors.textMain.color,
                  fontSize: GGFontSize.content,
                  fontFamily: GGFontFamily.c(),
                  fontWeight: GGFontWeigh.regular),
            ),
            Gaps.vGap16,
            Container(
              padding: EdgeInsets.only(
                  left: 18.dp, right: 18.dp, top: 6.dp, bottom: 6.dp),
              decoration: BoxDecoration(
                color: GGColors.highlightButton.color.withOpacity(0.4),
                borderRadius: BorderRadius.all(Radius.circular(4.0.dp)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  SvgPicture.asset(
                    R.iconLock,
                    width: 18.dp,
                    height: 18.dp,
                  ),
                  Text(
                    '${localized('lock_total')}  ${NumberFormat("#.###############").format(state.limitModel?.freezeAmount)} ${state.currency?.currency}',
                    style: GGTextStyle(
                        color: GGColors.textMain.color,
                        fontSize: GGFontSize.hint,
                        fontFamily: GGFontFamily.c(),
                        fontWeight: GGFontWeigh.regular),
                  ),
                ],
              ),
            ),
            Gaps.vGap16,
            GestureDetector(
              onTap: () {
                Get.until((route) => Get.currentRoute == Routes.main.route);
                Get.find<MainLogic>().changeSelectIndex(4);
              },
              child: Text(
                localized('wiew_frozen_assets'),
                style: GGTextStyle(
                    color: GGColors.textHint.color,
                    fontSize: GGFontSize.hint,
                    fontFamily: GGFontFamily.c(),
                    fontWeight: GGFontWeigh.regular),
              ),
            ),
          ],
        ));
  }

  /// 转账，提币区域
  Widget _buildWithdrawal() {
    return Column(
      children: [
        _buildCurrencySelector(),
        Gaps.vGap24,
        _buildAddressWidget(),
        Gaps.vGap24,
        _buildNumOrMinWithdrawal(),
        const DigitalCurrencyWithdrawalHistoryView(),
        Gaps.vGap24,
        _buildBottom(),
      ],
    );
  }

  Widget _buildAddressWidget() {
    if (state.useNewAddress.value) {
      return Column(
        children: [
          _buildNetworkSelector(),
          Gaps.vGap24,
          _buildAddress(),
        ],
      );
    } else {
      return _buildAddressBook();
    }
  }

  /// 选择币种
  Widget _buildCurrencySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('curr'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: controller.selectCurrency,
          child: _buildContainer(
            child: Row(
              children: [
                Expanded(
                  child: Obx(() {
                    if (state.currency == null) {
                      return Text(
                        localized('select_cur'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textHint.color,
                        ),
                      );
                    } else {
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
                            state.currency!.name,
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textSecond.color,
                              fontFamily: GGFontFamily.dingPro,
                            ),
                          ),
                        ],
                      );
                    }
                  }),
                ),
                SvgPicture.asset(
                  R.iconDown,
                  height: 7.dp,
                  color: GGColors.textSecond.color,
                ),
              ],
            ),
          ),
        ),
        Gaps.vGap24,
        SizedBox(
            height: 32.dp,
            child: Row(
              children: [
                InkWell(
                  onTap: () {
                    controller.changeToNewAddress();
                  },
                  child: Container(
                    padding: EdgeInsets.only(
                        left: 8.dp, right: 8.dp, top: 6.dp, bottom: 6.dp),
                    decoration: BoxDecoration(
                      color: state.useNewAddress.value
                          ? GGColors.border.color
                          : null,
                      borderRadius: BorderRadius.circular(4.dp),
                    ),
                    child: Text(
                      localized('use_new_add'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                        fontFamily: GGFontFamily.dingPro,
                      ),
                    ),
                  ),
                ),
                InkWell(
                  onTap: () {
                    controller.changeToAddressBook();
                  },
                  child: Container(
                    padding: EdgeInsets.only(
                        left: 8.dp, right: 8.dp, top: 6.dp, bottom: 6.dp),
                    decoration: BoxDecoration(
                      color: !state.useNewAddress.value
                          ? GGColors.border.color
                          : null,
                      borderRadius: BorderRadius.circular(4.dp),
                    ),
                    child: Text(
                      localized('add_book'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                        fontFamily: GGFontFamily.dingPro,
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                Visibility(
                  visible: !state.useNewAddress.value,
                  child: InkWell(
                    onTap: () {
                      Get.toNamed<void>(Routes.cryptoAddressList.route);
                    },
                    child: Container(
                      padding: EdgeInsets.only(
                          left: 8.dp, right: 8.dp, top: 6.dp, bottom: 6.dp),
                      child: Text(
                        localized('address_management'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.highlightButton.color,
                          fontFamily: GGFontFamily.dingPro,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            )),
      ],
    );
  }

  /// 地址簿
  Widget _buildAddressBook() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('add_book'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: controller.addressBookSelect,
          child: _buildContainer(
            child: Row(
              children: [
                Expanded(
                  child: Obx(() {
                    return Row(
                      children: [
                        Container(
                          constraints: BoxConstraints(
                            maxWidth: 200.dp,
                          ),
                          child: Text(
                            state.selectAddress?.address ??
                                localized('select_add_book'),
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontWeight: GGFontWeigh.regular,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Gaps.hGap8,
                        Text(
                          state.selectAddress?.network ?? '',
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.textSecond.color,
                            fontFamily: GGFontFamily.dingPro,
                          ),
                        ),
                      ],
                    );
                  }),
                ),
                SvgPicture.asset(
                  R.iconDown,
                  height: 7.dp,
                  color: GGColors.textSecond.color,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// 提币地址
  Widget _buildAddress() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('wd_curr_add'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        GamingBaseTextField(
          hintText: localized('enter_wd_ad'),
          autofocus: true,
          controller: state.addressController.textController,
          suffixIconConstraints: BoxConstraints.tightFor(
            height: 40.dp,
          ),
          suffixIcon: ScaleTap(
            onPressed: logic.onPressScan,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                SvgPicture.asset(
                  R.iconScan,
                  color: GGColors.textSecond.color,
                  height: 18.dp,
                ),
                Gaps.hGap10,
              ],
            ),
          ),
        ),
        Gaps.vGap4,
        Visibility(
          visible: state.addressError.isNotEmpty,
          child: Text(
            state.addressError.value,
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.error.color,
            ),
          ),
        ),
      ],
    );
  }

  /// 转账网络
  Widget _buildNetworkSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('trans_network'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: controller.selectNetwork,
          child: _buildContainer(
            child: Row(
              children: [
                Expanded(
                  child: Obx(() {
                    if (state.network == null) {
                      return Text(
                        localized('select_net'),
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
                  }),
                ),
                SvgPicture.asset(
                  R.iconDown,
                  height: 7.dp,
                  color: GGColors.textSecond.color,
                ),
              ],
            ),
          ),
        ),
        Visibility(
          visible: controller.showNetworkMatch.value,
          child: Row(
            children: [
              Expanded(
                child: Text(
                  localized('choo_main01'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.success.color,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildNumOrMinWithdrawal() {
    if ((state.useNewAddress.value &&
            state.currency != null &&
            state.currency!.currency!.isNotEmpty &&
            state.network != null &&
            state.network!.name.isNotEmpty) ||
        (!state.useNewAddress.value && state.selectAddress?.address != null)) {
      return _buildQuantity();
    } else {
      return _buildMinWithdrawal();
    }
  }

  /// 可用余额，最小提币
  Widget _buildMinWithdrawal() {
    return Row(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              localized('ava_balance'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
                fontFamily: GGFontFamily.dingPro,
              ),
            ),
            Gaps.vGap4,
            Text(
              '${state.limit?.availQuota} ${state.currency?.currency}',
              style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontFamily: GGFontFamily.dingPro,
                  fontWeight: GGFontWeigh.medium),
            ),
          ],
        ),
        SizedBox(
          width: 85.dp,
        ),
        Visibility(
          visible: state.network?.name == null && controller.showMinCoin.value,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                localized('min_coin_wd'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                  fontFamily: GGFontFamily.dingPro,
                ),
              ),
              Gaps.vGap4,
              Text(
                '${GGUtil.parseDouble(state.network?.minAmount)} ${state.currency?.currency}',
                style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                    fontFamily: GGFontFamily.dingPro,
                    fontWeight: GGFontWeigh.medium),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// 数量
  Widget _buildQuantity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('number'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        GamingBaseTextField(
          hintText:
              '${localized('min_wd')} ${GGUtil.parseDouble(state.network?.minAmount ?? 0.0)}',
          autofocus: true,
          // 带有小数点的数字键盘
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          controller: state.numTextFieldController.textController,
          suffixIcon: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              GestureDetector(
                onTap: () {
                  state.numTextFieldController.textController.text =
                      GGUtil.parseStr(state.limit?.availQuota);
                  FocusScope.of(Get.overlayContext!).requestFocus(FocusNode());
                },
                child: Container(
                  padding: EdgeInsets.only(
                    left: 4.dp,
                  ),
                  child: Text(
                    localized('all'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.highlightButton.color,
                    ),
                  ),
                ),
              ),
              Gaps.hGap14,
              Text(
                state.currency?.currency ?? '',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textHint.color,
                ),
              ),
              Gaps.hGap12,
            ],
          ),
        ),
        Visibility(
          visible: controller.numTipStr.value.isNotEmpty,
          child: Container(
            padding: EdgeInsets.only(top: 4.dp, bottom: 2.dp),
            child: Text(
              controller.numTipStr.value, //localized('too_big'),
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.error.color,
              ),
            ),
          ),
        ),
        Gaps.vGap4,
        Row(
          children: [
            const Spacer(),
            Text(
              '${NumberPrecision(state.limit?.availQuota).balanceText(true)} ${state.currency?.currency} ${localized('ava_withdraw')} ',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
            _buildTopButtons(),
          ],
        ),
        _buildCanGetWidget(),
        _buildBottomBtn(),
      ],
    );
  }

  Widget _buildTopButtons() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Visibility(
          visible: true,
          child: GamingPopupLinkWidget(
            overlay: controller.limitOverlay,
            followerAnchor: Alignment.bottomRight,
            targetAnchor: Alignment.topLeft,
            popup: SizedBox(
              width: 300.dp,
              child: const WithdrawalLimitTipWidget(),
            ),
            offset: Offset(10.dp, 0.dp),
            triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
            child: SvgPicture.asset(
              R.iconTipIcon,
              width: 15.dp,
              height: 15.dp,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
      ],
    );
  }

  /// 能得到金额
  Widget _buildCanGetWidget() {
    return Visibility(
      visible: controller.enableNext.value,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${controller.getCanReceive.value} ${state.limit?.currency}',
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle20,
              color: GGColors.textMain.color,
            ),
          ),
          Text(
            '${state.network?.withdrawFee} ${state.limit?.currency} ${localized('includes_fee')}',
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap16,
        ],
      ),
    );
  }

  /// 底部按钮
  Widget _buildBottomBtn() {
    return Visibility(
      visible: controller.enableNext.value,
      child: GestureDetector(
        onTap: () {
          _withdraw();
        },
        child: SizedBox(
          width: double.infinity,
          height: 48.dp,
          child: GGButton(
            onPressed: () {
              _withdraw();
            },
            enable: controller.enableNext.value,
            isLoading: controller.isWithdraw.value,
            text: getLocalString('withdraw'),
          ),
        ),
      ),
    );
  }

  void _withdraw() {
    GamingBottomSheet.show<dynamic>(
        title: localized("withdraw"),
        builder: (context) {
          return const WithdrawalLastConfirmSheet();
        });
  }

  /// 尾部说明
  Widget _buildBottom() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('faq'),
          style: GGTextStyle(
            fontSize: GGFontSize.smallTitle,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.vGap16,
        _buildFAQWidget(),
      ],
    );
  }

  Widget _buildFAQWidget() {
    return Column(
      children:
          controller.state.faqData.map((e) => _buildBottomItem(e)).toList(),
    );
  }

  Widget _buildBottomItem(GamingFaqModel model) {
    return GestureDetector(
      onTap: () {
        H5WebViewManager.sharedInstance.openWebView(
          url: model.webUrl,
          title: localized('faq'),
        );
      },
      child: Container(
        padding: EdgeInsets.only(bottom: 20.dp),
        child: Row(
          children: [
            SvgPicture.asset(
              R.iconUseExplain,
              width: 18.dp,
              height: 18.dp,
            ),
            Gaps.hGap8,
            Text(
              model.title,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
                decoration: TextDecoration.underline,
              ),
            ),
          ],
        ),
      ),
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
}
