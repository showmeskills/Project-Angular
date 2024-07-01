import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/crypto_address/models/crypto_address_model.dart';
import 'package:gogaming_app/common/api/currency/currency_api.dart';
import 'package:gogaming_app/common/api/currency/models/ewallet_payment_list_model.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/secure_service.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/coin_selector/coin_selector_page.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_network_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

import 'crypto_address_add_logic.dart';

class CryptoAddressAddPage extends BaseView<CryptoAddressAddLogic> {
  const CryptoAddressAddPage({
    Key? key,
    required this.addressList,
    required this.ewalletPaymentList,
  }) : super(key: key);

  final List<CryptoAddressModel> addressList;

  /// 电子钱包支付方式
  final List<EWalletPaymentListModel> ewalletPaymentList;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          CryptoAddressAddPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory CryptoAddressAddPage.argument(Map<String, dynamic> arguments) {
    return CryptoAddressAddPage(
      addressList: arguments['addressList'] as List<CryptoAddressModel>,
      ewalletPaymentList:
          arguments['ewalletPaymentList'] as List<EWalletPaymentListModel>,
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(title: localized('add_wd_address'));
  }

  @override
  Widget body(BuildContext context) {
    Get.put(CryptoAddressAddLogic(ewalletPaymentList));
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: 16.dp,
        end: 16.dp,
        bottom: 36.dp - Util.iphoneXBottom,
      ),
      child: Column(
        children: [
          Expanded(child: _buildDataList()),
          _buildBottomButtons(),
        ],
      ),
    );
  }

  Widget _buildDataList() {
    return Obx(() {
      final type = controller.paymentModel.value.code;
      List<Widget> content = [];
      if (type is String && type.isNotEmpty) {
        if (type == '0') {
          content = _buildCryptList();
        } else {
          content = _buildEWallletList();
        }
      }
      return ListView(
        children: [
          Gaps.vGap24,
          _buildInputTF(
            localized('add_remark'),
            controller.remarkController,
            hintText: localized('enter_tip00'),
          ),
          Gaps.vGap24,
          _buildInputSelect(
            localized('pay_method'),
            _selectPayment,
            leftView: _buildPaymentView(),
          ),
          ...content,
        ],
      );
    });
  }

  List<Widget> _buildEWallletList() {
    return [
      Gaps.vGap24,
      Obx(() {
        return _buildInputSelect(
          localized('curr'),
          selectCoin,
          leftView: _buildCoinView(),
        );
      }),
      Gaps.vGap24,
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  localized('wd_curr_add'),
                  style: GGTextStyle(
                    color: GGColors.textSecond.color,
                    fontSize: GGFontSize.content,
                  ),
                ),
              ),
            ],
          ),
          Gaps.vGap4,
          GamingTextField(
            controller: controller.addressController,
            hintText: localized('enter_wd_curr_ad'),
            hintStyle: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textHint.color,
            ),
            suffixIcon: ScaleTap(
              onPressed: controller.onPressScan,
              child: SvgPicture.asset(
                R.iconScan,
                color: GGColors.textSecond.color,
                height: 18.dp,
              ),
            ),
          ),
        ],
      )
    ];
  }

  List<Widget> _buildCryptList() {
    return [
      Gaps.vGap24,
      Obx(() {
        return _buildInputSelect(
          localized('curr'),
          selectCoin,
          leftView: _buildCoinView(),
          enable: controller.isUniversalAddress.value == false,
        );
      }),
      Gaps.vGap8,
      _buildUniversalRow(),
      Gaps.vGap24,
      _buildInputSelect(
        localized('select_net'),
        selectNetwork,
        leftView: _buildNetworkView(),
      ),
      _buildAutoMatchHint(),
      Gaps.vGap24,
      Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  localized('wd_curr_add'),
                  style: GGTextStyle(
                    color: GGColors.textSecond.color,
                    fontSize: GGFontSize.content,
                  ),
                ),
              ),
            ],
          ),
          Gaps.vGap4,
          GamingTextField(
            controller: controller.addressController,
            hintText: localized('enter_wd_curr_ad'),
            hintStyle: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textHint.color,
            ),
            suffixIcon: ScaleTap(
              onPressed: controller.onPressScan,
              child: SvgPicture.asset(
                R.iconScan,
                color: GGColors.textSecond.color,
                height: 18.dp,
              ),
            ),
          ),
        ],
      )
    ];
  }

  Widget _buildAutoMatchHint() {
    return Obx(() {
      return Visibility(
        visible: controller.showAutoMatchHint,
        child: Padding(
          padding: EdgeInsetsDirectional.only(top: 8.dp),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  localized('choo_main01'),
                  style: GGTextStyle(
                    color: GGColors.successText.color,
                    fontSize: GGFontSize.hint,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildPaymentView() {
    return Obx(() {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (controller.isSelectPayment) ...[
            Text(
              controller.paymentName,
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ],
          if (!controller.isSelectPayment)
            Text(
              localized('sen_de'),
              style: GGTextStyle(
                color: GGColors.textHint.color,
                fontSize: GGFontSize.content,
              ),
            )
        ],
      );
    });
  }

  Widget _buildNetworkView() {
    return Obx(() {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (controller.isSelectNetwork) ...[
            Text(
              controller.networkModel.value.network ?? '',
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
            Gaps.hGap8,
            Text(
              controller.networkModel.value.desc ?? '',
              style: GGTextStyle(
                color: GGColors.textHint.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ],
          if (!controller.isSelectNetwork)
            Text(
              localized('choo_main00'),
              style: GGTextStyle(
                color: GGColors.textHint.color,
                fontSize: GGFontSize.content,
              ),
            )
        ],
      );
    });
  }

  Widget _buildCoinView() {
    final currency = controller.currency.value?.currency ?? '';
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (!controller.isUniversalAddress.value && currency.isNotEmpty) ...[
          GamingImage.network(
            url: CurrencyService.sharedInstance.getIconUrl(currency),
            height: 20.dp,
            width: 20.dp,
          ),
          Gaps.hGap10,
          Text(
            currency,
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.content,
            ),
          ),
          Gaps.hGap8,
          Text(
            controller.currency.value?.name ?? '',
            style: GGTextStyle(
              color: GGColors.textHint.color,
              fontSize: GGFontSize.content,
            ),
          ),
        ],
        if (controller.isUniversalAddress.value)
          Text(
            localized('enter_wd_curr_ad'),
            style: GGTextStyle(
              color: GGColors.textHint.color,
              fontSize: GGFontSize.content,
            ),
          )
      ],
    );
  }

  Widget _buildUniversalRow() {
    return Row(
      children: [
        Obx(() {
          return GamingCheckBox(
            value: controller.isUniversalAddress.value,
            padding: EdgeInsets.only(right: 6.dp),
            size: 20.dp,
            onChanged: onPressUniversal,
          );
        }),
        Expanded(
          child: Text(
            localized('sel_coin_tip00'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
        GamingPopupLinkWidget(
          targetAnchor: Alignment.topRight,
          triangleInset: EdgeInsetsDirectional.only(end: 3.dp),
          popup: SizedBox(
            width: 226.dp,
            child: Row(
              children: [
                Expanded(
                    child: Text(
                  localized('sel_coin_tip01'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textBlackOpposite.color,
                  ),
                ))
              ],
            ),
          ),
          child: Padding(
            padding: EdgeInsetsDirectional.only(
              start: 5.dp,
              top: 5.dp,
              bottom: 5.dp,
            ), //扩大点击范围
            child: SvgPicture.asset(
              R.iconTipIcon,
              width: 20.dp,
              height: 20.dp,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInputSelect(
    String title,
    VoidCallback onPress, {
    bool enable = true,
    required Widget leftView,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content,
                ),
              ),
            ),
          ],
        ),
        Gaps.vGap4,
        InkWell(
          onTap: enable ? onPress : null,
          child: Container(
            decoration: BoxDecoration(
              color:
                  enable ? GGColors.transparent.color : GGColors.border.color,
              borderRadius: BorderRadius.circular(4.dp),
              border: Border.all(color: GGColors.border.color, width: 1),
            ),
            child: Row(
              children: [
                SizedBox(
                  height: 48.dp,
                  width: 13.5.dp,
                ),
                Expanded(child: leftView),
                SvgPicture.asset(
                  R.iconDown,
                  height: 7.dp,
                  color: GGColors.textSecond.color,
                ),
                SizedBox(width: 13.5.dp),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInputTF(
    String title,
    GamingTextFieldController textController, {
    String? hintText,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content,
                ),
              ),
            ),
          ],
        ),
        Gaps.vGap4,
        GamingTextField(
          controller: textController,
          hintText: hintText,
          hintStyle: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textHint.color,
          ),
        ),
      ],
    );
  }

  Widget _buildBottomButtons() {
    return Row(
      children: [
        Expanded(
          child: GGButton.minor(
            onPressed: _onPressCancel,
            text: localized('cancels'),
          ),
        ),
        Gaps.hGap10,
        Obx(() {
          return Expanded(
            child: GGButton.main(
              onPressed: _onPressSave,
              text: localized('save_btn'),
              isLoading: controller.addLoading.value,
              enable: controller.saveEnable.value,
            ),
          );
        }),
      ],
    );
  }
}

extension _Action on CryptoAddressAddPage {
  void _onPressCancel() {
    Get.back<dynamic>();
  }

  void onPressUniversal(bool value) {
    controller.isUniversalAddress.value = !controller.isUniversalAddress.value;
  }

  void _selectPayment() {
    GamingSelector.simple<EWalletPaymentListModel?>(
      title: localized('pay_method'),
      fixedHeight: false,
      itemBuilder: (context, e, index) {
        return ScaleTap(
          onPressed: () {
            Get.back(result: e);
          },
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 16.dp),
            height: 48.dp,
            alignment: Alignment.centerLeft,
            child: Text(
              e?.name ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: controller.paymentName == e?.name
                    ? GGColors.highlightButton.color
                    : GGColors.textMain.color,
              ),
            ),
          ),
        );
      },
      original: controller.paymentList,
    ).then((value) {
      if (value != null) {
        controller.setPayment(value);
      }
    });
  }

  void selectCoin() {
    GamingBottomSheet.show<GamingCurrencyModel?>(
      title: localized('select_cur'),
      builder: (context) {
        return CoinSelectorPage(
          list: controller.currencyList,
        );
      },
    ).then((value) {
      if (value != null) {
        controller.setCoins(value);
      }
    });
  }

  void selectNetwork() {
    final currency = controller.currency.value?.currency;
    final list = controller.selectedNetworkList()?.networks;
    GamingCurrencyNetworkSelector.show(
      category: CurrencyCategory.withdraw,
      currency: currency ?? '',
      original: list,
      address: controller.addressController.textController.text,
    ).then((value) {
      if (value != null) {
        controller.setNetWork(value);
      }
    });
  }

  void _onPressSave() {
    // 检查地址是否已存在
    final address = controller.addressController.text.value;
    final isAddressExist =
        addressList.firstWhereOrNull((e) => e.address == address) != null;
    if (isAddressExist) {
      Toast.showFailed(localized('adds_has_tip00'));
      return;
    }
    // 需进行2fa认证
    if (SecureService.sharedInstance.checkSecure()) {
      Get.toNamed<dynamic>(Routes.secure.route, arguments: {
        'isLogin': false,
        'otpType': VerifyAction.addTokenAddress,
        'on2FaSuccess': (String token) {
          debugPrint('on2FaSuccess: token=$token');
          if (controller.paymentModel.value.code == '0') {
            controller.addAddress(token);
          } else {
            controller.addEWalletAddress(token);
          }
        },
      });
    }
  }
}
