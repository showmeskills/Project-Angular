import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/crypto_address/models/crypto_address_model.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/secure_service.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/gg_multi_line_button.dart';
import 'package:gogaming_app/generated/r.dart';

import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/service/account_service.dart';
import '../../../common/service/kyc_service.dart';
import '../../../common/widgets/gaming_popup.dart';
import 'crypto_address_list_logic.dart';
import 'crypto_address_list_state.dart';
import 'views/crypto_address_item_view.dart';

class CryptoAddressListPage extends BaseView<CryptoAddressListLogic>
    with BaseRefreshViewDelegate {
  const CryptoAddressListPage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const CryptoAddressListPage(),
    );
  }

  CryptoAddressListState get state => Get.find<CryptoAddressListLogic>().state;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      title: localized('dc_add_management'),
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;
  @override
  bool resizeToAvoidBottomInset() => false;

  @override
  RefreshViewController get renderController => controller.controller;

  @override
  String? get emptyText => localized('save');

  @override
  Widget body(BuildContext context) {
    Get.put(CryptoAddressListLogic());
    return GetBuilder(
      init: controller,
      builder: (logic) {
        return FocusDetector(
          onVisibilityGained: controller.reloadData,
          child: Container(
            padding: EdgeInsetsDirectional.only(
              top: 14.dp,
              start: 16.dp,
              end: 16.dp,
              bottom: Util.bottomMargin,
            ),
            decoration: BoxDecoration(
              color: GGColors.moduleBackground.color,
              borderRadius: const BorderRadiusDirectional.only(
                topStart: Radius.circular(25),
                topEnd: Radius.circular(25),
              ),
            ),
            child: Column(
              children: [
                _buildTopOperation(),
                _buildSearchRow(),
                Expanded(
                  child: Obx(() {
                    return RefreshView(
                      controller: controller,
                      delegate: this,
                      child: ListView.builder(
                        itemExtent: 225.dp,
                        padding: EdgeInsets.only(bottom: 12.dp),
                        itemCount: state.displayList.length,
                        itemBuilder: _buildItem,
                      ),
                    );
                  }),
                ),
                controller.isEditing.value
                    ? _buildEditButton(context)
                    : _buildAddButton(),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildItem(BuildContext context, int index) {
    final model = state.displayList[index];
    return GetBuilder(
      init: controller,
      id: model.id,
      builder: (logic) {
        return CryptoAddressItemView(
          model: model,
          onPressMore: _pressMore,
          isEditing: controller.isEditing.value,
          selected: controller.selected.contains(model.id),
          onPressSelected: _pressSelect,
        );
      },
    );
  }

  Widget imageIcon(String token) {
    return GamingImage.network(
      url: CurrencyService.sharedInstance[token]?.iconUrl,
      width: 16,
      height: 16,
    );
  }

  Widget _buildTopOperation() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Obx(() {
          return Row(
            children: [
              SvgPicture.asset(
                state.openWhiteList.value
                    ? R.preferencesSelected
                    : R.preferencesNoSelected,
                width: 14.dp,
                height: 14.dp,
                color: state.openWhiteList.value
                    ? GGColors.success.color
                    : GGColors.textMain.color,
              ),
              Gaps.hGap8,
              Text(
                state.openWhiteList.value
                    ? localized("w_on")
                    : localized("w_off"),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                ),
              ),
              GamingPopupLinkWidget(
                followerAnchor: Alignment.bottomCenter,
                targetAnchor: Alignment.topCenter,
                popup: _buildTip(),
                offset: Offset(5.dp, 0),
                triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
                child: Container(
                  padding: EdgeInsets.only(left: 12.dp),
                  child: SvgPicture.asset(
                    R.iconTipIcon,
                    width: 14.dp,
                    height: 14.dp,
                  ),
                ),
              )
            ],
          );
        }),
        Gaps.vGap16,
        Row(
          children: [
            ScaleTap(
              onPressed: () => _onPressWhiteList(),
              opacityMinValue: 0.8,
              scaleMinValue: 0.98,
              child: Text(
                localized("ws"),
                style: GGTextStyle(
                  color: GGColors.highlightButton.color,
                  fontSize: GGFontSize.content,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
            Gaps.hGap16,
            _buildManager(),
          ],
        ),
        Gaps.vGap16,
      ],
    );
  }

  Widget _buildTip() {
    return SizedBox(
      width: 180.dp,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 160.dp),
        child: Text(
          localized("protect_safe"),
          style: GGTextStyle(
            color: GGColors.textBlackOpposite.color,
            fontSize: GGFontSize.content,
          ),
        ),
      ),
    );
  }

  Widget _buildManager() {
    return Obx(() {
      return Visibility(
        visible: state.displayList.isNotEmpty,
        child: _buildTextButton(
            _onPressManage,
            !controller.isEditing.value
                ? localized('manage_button')
                : localized('finish'),
            100.dp),
      );
    });
  }

  Widget _buildEditButton(BuildContext context) {
    return Obx(() {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          GamingCheckBox(
            value: controller.selectedAll,
            padding: EdgeInsets.symmetric(
              vertical: 4.dp,
              // horizontal: 6.dp,
            ),
            size: 20.dp,
            onChanged: (v) {
              _pressSelectAll(v);
            },
          ),
          Gaps.hGap4,
          Container(
            constraints: BoxConstraints(maxWidth: 60.dp),
            child: Text(
              localized('select_all'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
              maxLines: 2,
            ),
          ),
          const Spacer(),
          Obx(() {
            return Visibility(
              visible: controller.selected.isNotEmpty,
              child: Row(
                children: [
                  _buildWhiltManagaView(context),
                  Gaps.hGap4,
                  _buildTextButton(
                      _pressDeleteSelect, localized('delete'), 65.dp),
                ],
              ),
            );
          }),
        ],
      );
    });
  }

  Widget _buildWhiltManagaView(BuildContext context) {
    GGTextStyle style = GGTextStyle(
      fontSize: GGFontSize.content,
      color: GGColors.textMain.color,
    );
    Size size1 =
        boundingTextSize(localized("join_whitelist"), style, maxWidth: 100.dp);
    Size size2 = boundingTextSize(localized("remove_whitelist"), style,
        maxWidth: 100.dp);

    double width = (MediaQuery.of(context).size.width -
            32.dp -
            24.dp -
            4.dp -
            60.dp -
            70.dp) /
        2;
    bool high = size1.width > width || size2.width > width;
    return Row(
      children: [
        SizedBox(
          width: width,
          height: high ? 48.dp : 28.dp,
          child: GGMultiLineButton(
            onPressed: () {
              _updateWhiteList(true);
            },
            text: localized("join_whitelist"),
            textStyle: style,
          ),
        ),
        Gaps.hGap4,
        SizedBox(
          width: width,
          height: high ? 48.dp : 28.dp,
          child: GGMultiLineButton(
            onPressed: () {
              _updateWhiteList(false);
            },
            text: localized("remove_whitelist"),
            textStyle: style,
          ),
        ),
      ],
    );
  }

  Size boundingTextSize(String text, GGTextStyle style,
      {double maxWidth = 170}) {
    if (text.isEmpty) {
      return Size.zero;
    }
    final TextPainter textPainter = TextPainter(
        textDirection: TextDirection.ltr,
        text: TextSpan(text: text, style: style),
        maxLines: 1)
      ..layout(maxWidth: maxWidth);
    return textPainter.size;
  }

  Widget _buildTextButton(
      GestureTapCallback onPress, String title, double maxWidth) {
    return InkWell(
      onTap: onPress,
      child: Container(
        constraints: BoxConstraints(maxWidth: maxWidth),
        padding: EdgeInsetsDirectional.only(
            start: 16.dp, end: 16.dp, top: 4.dp, bottom: 4.dp),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(4),
          border: Border.all(
            color: GGColors.highlightButton.color,
            width: 1.dp,
          ),
        ),
        child: Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.highlightButton.color,
          ),
        ),
      ),
    );
  }

  Widget _buildAddButton() {
    return Row(
      children: [
        Expanded(
          child: GGButton.main(
            onPressed: _onPressAddAddress,
            text: localized('add_address'),
          ),
        ),
      ],
    );
  }

  Widget _buildSearchRow() {
    return Row(
      children: [
        SizedBox(
          width: 240.dp,
          child: GamingTextField(
            controller: state.search,
            fillColor: GGColors.transparent,
            hintText: localized('add_search'),
            contentPadding: EdgeInsets.only(
              left: 14.dp,
              top: 12.dp,
              bottom: 12.dp,
              right: 14.dp,
            ),
            prefixIcon: GamingTextFieldIcon(
              icon: R.iconSearch,
              padding: EdgeInsets.only(right: 10.dp, left: 10.dp),
            ),
            prefixIconConstraints: BoxConstraints.tightFor(
              height: 14.dp,
              width: 38.dp,
            ),
          ),
        ),
        IconButton(
          onPressed: _onFilter,
          padding: EdgeInsets.symmetric(
            vertical: 12.dp,
            horizontal: 16.dp,
          ),
          icon: SvgPicture.asset(
            R.commonFilter,
            width: 18.dp,
            height: 17.dp,
            color: GGColors.textSecond.color,
          ),
        ),
      ],
    );
  }
}

extension _Action on CryptoAddressListPage {
  void _pressSelectAll(bool selected) {
    controller.setSelectAll(selected);
  }

  void _updateWhiteList(bool isJoin) {
    if ((AccountService.sharedInstance.gamingUser?.hasWhiteList ?? false) ==
        false) {
      final title = localized('hint');
      final content =
          localized('bef_add_white00') + localized("bef_add_white01");
      final dialog = DialogUtil(
        context: Get.overlayContext!,
        iconPath: R.commonDialogErrorBig,
        iconWidth: 80.dp,
        iconHeight: 80.dp,
        title: title,
        content: content,
        rightBtnName: localized('g_t_open00'),
        leftBtnName: localized('cancels'),
        onRightBtnPressed: () {
          Get.offAndToNamed<dynamic>(Routes.accountSecurity.route);
        },
      );
      dialog.showNoticeDialogWithTwoButtons();
      return;
    }

    if (isJoin) {
      _addWhiteList();
    } else {
      _removeWhiteList();
    }
  }

  void _addWhiteList() {
    final ids = controller.selected.toList();
    if (ids.isEmpty) {
      return;
    }

    if (SecureService.sharedInstance.checkSecure()) {
      Get.toNamed<dynamic>(Routes.secure.route, arguments: {
        'isLogin': false,
        'otpType': VerifyAction.joinWhiteList,
        'on2FaSuccess': (String token) {
          controller.updateWhiteList(ids, token, true);
        },
      });
      _onPressManage();
      return;
    }
  }

  void _removeWhiteList() {
    final ids = controller.selected.toList();
    if (ids.isEmpty) {
      return;
    }

    if (SecureService.sharedInstance.checkSecure()) {
      Get.toNamed<dynamic>(Routes.secure.route, arguments: {
        'isLogin': false,
        'otpType': VerifyAction.removeWhiteList,
        'on2FaSuccess': (String token) {
          controller.updateWhiteList(ids, token, false);
        },
      });
      _onPressManage();
      return;
    }
  }

  void _pressDeleteSelect() {
    final ids = controller.selected.toList();
    if (ids.isEmpty) {
      Toast.showFailed(localized('dele_add_f'));
      return;
    }
    _showDeleteDialog(() {
      // 需进行2fa认证
      if (SecureService.sharedInstance.checkSecure()) {
        Get.toNamed<dynamic>(Routes.secure.route, arguments: {
          'isLogin': false,
          'otpType': VerifyAction.deleteTokenAddress,
          'on2FaSuccess': (String token) {
            controller.deleteAddress(ids, token);
          },
        });
        _onPressManage();
        return;
      }
    }, ids.length > 1);
  }

  void _pressSelect(CryptoAddressModel data, bool selected) {
    controller.select(data.id ?? 0, selected);
  }

  void _onPressManage() {
    controller.changeIsEditing();
    // controller.dropdownOpenedAddressId.value = "";
  }

  void _pressMore(CryptoAddressModel model) {
    final List<String> actionList = ['delete'];
    GamingSelector.simple(
      title: localized('more_text'),
      itemBuilder: (context, e, index) {
        return InkWell(
          onTap: () => _onPressActionTitle(e, model),
          child: Row(
            children: [
              SizedBox(height: 40.dp, width: 16.dp),
              Text(
                localized(e),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
              SizedBox(width: 16.dp),
            ],
          ),
        );
      },
      original: actionList,
    );
  }

  void _onPressActionTitle(String title, CryptoAddressModel model) {
    Get.back<dynamic>();
    if (title == 'delete') {
      _onPressDelete(model);
    }
  }

  void _onPressDelete(CryptoAddressModel model) {
    _showDeleteDialog(() {
      // 需进行2fa认证
      if (SecureService.sharedInstance.checkSecure()) {
        Get.toNamed<dynamic>(Routes.secure.route, arguments: {
          'isLogin': false,
          'otpType': VerifyAction.deleteTokenAddress,
          'on2FaSuccess': (String token) {
            controller.deleteAddress([model.id ?? 0], token);
          },
        });
        return;
      }
    }, false);
  }

  void _showDeleteDialog(void Function() onConfirmBtnClicked, bool isMulti) {
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: isMulti ? localized('del_addres00') : localized('del_addres01'),
      content: localized('oper_can_be00'),
      rightBtnName: localized('sure'),
      leftBtnName: localized('cancels'),
      onRightBtnPressed: () {
        Get.back<dynamic>();
        onConfirmBtnClicked();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  void _onPressAddAddress() {
    KycService.sharedInstance.checkPrimaryDialog(
      () {
        Get.toNamed<dynamic>(Routes.cryptoAddressAdd.route, arguments: {
          "addressList": state.addressList,
          "ewalletPaymentList": state.ewalletPaymentList,
        });
      },
      Get.overlayContext!,
      title: localized('safety_rem00'),
    );
  }

  void _onPressWhiteList() {
    /// 防止重复跳转，账户安全中心页面存在数字货币地址管理页面入口
    Get.offAndToNamed<dynamic>(Routes.accountSecurity.route);
  }

  void _onFilter() {
    Get.toNamed<void>(Routes.cryptoAddressFilter.route);
  }
}
