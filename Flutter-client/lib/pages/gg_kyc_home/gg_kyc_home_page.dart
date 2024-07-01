import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_level_model.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_country_selector/gaming_country_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/gg_kyc_home/views/gg_kyc_rights_pop_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/theme/theme_manager.dart';
import 'gg_kyc_home_logic.dart';

import 'views/gg_kyc_level_view.dart';
import 'views/gg_kyc_require_view.dart';

class GGKycHomePage extends BaseView<GGKycHomeLogic> {
  const GGKycHomePage({Key? key, this.defaultIndex = 0}) : super(key: key);

  // 默认tab
  final int defaultIndex;

  GGKycHomeState get state => Get.find<GGKycHomeLogic>().state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () {
        if (Get.arguments != null) {
          Map<String, dynamic> arguments =
              Get.arguments as Map<String, dynamic>;
          int index = GGUtil.parseInt(arguments['defaultIndex']);
          return GGKycHomePage(
            defaultIndex: index,
          );
        } else {
          return const GGKycHomePage(
            defaultIndex: 0,
          );
        }
      },
      // page: () => const GGKycHomePage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      bottomBackgroundColor: GGColors.background.color,
      titleWidget: _buildTopButtons(context),
      bottomHeight: 65.dp,
      // title: localized('personal_ver'),
      // bottomHeight: 65.dp,
      // trailingWidgets: [_buildTopButtons(context)],
    );
  }

  @override
  bool showTopTips() => false;

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  Widget body(BuildContext context) {
    Get.put(GGKycHomeLogic(defaultIndex: defaultIndex, isAutoChangeToTab: true),
        permanent: true);
    controller.context = context;
    return FocusDetector(
      onFocusGained: () => controller.reloadData(),
      child: GetBuilder(
        init: controller,
        dispose: (GetBuilderState<GGKycHomeLogic> builderState) {
          builderState.controller?.setLevelIndex(0);
          controller.context = null;
          controller.isChangeToTab = true;
        },
        builder: (logic) {
          return Column(
            children: [
              Expanded(
                child: _buildContent(context),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.moduleBackground.color,
        borderRadius: const BorderRadiusDirectional.only(
          topStart: Radius.circular(25),
          topEnd: Radius.circular(25),
        ),
      ),
      child: Obx(() {
        final currentLevelModel = state.currentLevelModel;
        return ListView(
          padding: EdgeInsetsDirectional.only(
            top: 24.dp,
            start: 16.dp,
            end: 16.dp,
            bottom: 16.dp,
          ),
          physics: const ClampingScrollPhysics(),
          children: [
            Obx(() {
              return Visibility(
                  visible: controller.shouldSupplementIntermediate.value ||
                      controller.shouldSupplementAdvanced.value,
                  child: _buildSupplementTips());
            }),
            _buildLevel(),
            if (currentLevelModel is GGKycLevelModel)
              GGKycRequireView(
                levelModel: currentLevelModel,
                rejectOverlay: state.rejectOverlay,
                rejectTips:
                    currentLevelModel.isReject ? _buildRejectTips() : null,
              ),
            // if (currentLevelModel is GGKycLevelModel )
            //   GGKycRequireEuropeView(
            //     levelModel: currentLevelModel,
            //     rejectOverlay: state.rejectOverlay,
            //     rejectTips:
            //         currentLevelModel.isReject ? _buildRejectTips() : null,
            //   ),
            _buildBottomHint(context),
            Obx(() {
              return _buildBottomHintEurope(context);
            }),
            Gaps.safeArea(),
          ],
        );
      }),
    );
  }

  Widget _buildNotVerify() {
    return SizedBox(
      width: 188.dp,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(height: 40.dp),
          SvgPicture.asset(
            R.kycKycNotVerify,
            width: 48.dp,
            height: 56.dp,
          ),
          SizedBox(height: 17.dp),
          _buildWrapText(Text(
            localized('no_pass'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.medium,
              color: GGColors.textBlackOpposite.color,
            ),
            textAlign: TextAlign.center,
          )),
          SizedBox(height: 6.dp),
          _buildWrapText(Text(
            localized('acc_ser'),
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textBlackOpposite.color,
            ),
            textAlign: TextAlign.center,
          )),
          SizedBox(height: 46.dp),
        ],
      ),
    );
  }

  Widget _buildWrapText(Text textView) {
    return Row(
      children: [Expanded(child: textView)],
    );
  }

  Widget _buildProtectTips() {
    return Row(
      children: [
        Container(
          constraints: BoxConstraints(maxWidth: 258.dp),
          child: Text(
            localized('info_protected'),
            style: GGTextStyle(
              color: GGColors.textBlackOpposite.color,
              fontSize: GGFontSize.content,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSupplementTips() {
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: EdgeInsets.symmetric(horizontal: 18.dp, vertical: 10.dp),
          decoration: BoxDecoration(
            color: GGColors.error.color
                .withOpacity(ThemeManager.shareInstacne.isDarkMode ? 0.2 : 0.8),
            borderRadius: BorderRadius.circular(4.dp),
          ),
          child: Text(
            (controller.shouldSupplementIntermediate.value &&
                    controller.shouldSupplementAdvanced.value)
                ? localized('supplementary_document_tip_Intermediate_advanced')
                : controller.shouldSupplementIntermediate.value
                    ? localized('supplementary_document_tip_Intermediate')
                    : localized('supplementary_document_tip_advanced'),
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.tabBarHighlightButton.color,
            ),
          ),
        ),
        Gaps.vGap20,
      ],
    );
  }

  Widget _buildRejectTips() {
    return Row(
      children: [
        Container(
          constraints: BoxConstraints(maxWidth: 226.dp),
          child: Text(
            state.verificationIndex.value == 1
                ? localized("verify_faild_mid")
                : localized("verify_faild_adv"),
            style: GGTextStyle(
              color: GGColors.textBlackOpposite.color,
              fontSize: GGFontSize.content,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomHint(BuildContext context) {
    final levelModel = state.currentLevelModel;
    final isPreLevelPass = levelModel?.isPreLevelPass == true;
    final index = state.verificationIndex.value;
    return Visibility(
      visible: controller.state.isAsia && levelModel?.canGoVerify == true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              SizedBox(height: 52.dp),
              Text(
                localized(levelModel?.reviewTime ?? ''),
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content,
                ),
              ),
            ],
          ),
          Row(
            children: [
              Expanded(
                child: GGButton.main(
                  onPressed: () {
                    if (isPreLevelPass) {
                      controller.onPressGoVerification(context, index);
                    }
                  },
                  text: isPreLevelPass
                      ? localized('start_now')
                      : localized('unavailable'),
                  backgroundColor:
                      isPreLevelPass ? null : GGColors.border.color,
                  enable: isPreLevelPass,
                  textColor: (isPreLevelPass
                          ? GGColors.buttonTextWhite
                          : GGColors.textMain)
                      .color,
                ),
              ),
            ],
          ),
          Row(
            children: [
              SizedBox(height: 50.dp),
              SvgPicture.asset(
                R.kycKycCheck,
                width: 16.dp,
                height: 16.dp,
              ),
              SizedBox(width: 10.dp),
              Expanded(
                child: Text(
                  localized('secure_info'),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GGTextStyle(
                    color: GGColors.textSecond.color,
                    fontSize: GGFontSize.hint,
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  //欧洲的底部btn
  Widget _buildBottomHintEurope(BuildContext context) {
    final levelModel = state.currentLevelModel;
    // 这里只是一个接口的数据。欧洲版本要两个接口组合使用
    bool canGoVerifyFirst = levelModel?.canGoVerify ?? false;
    final isPreLevelPass = levelModel?.isPreLevelPass == true;
    final index = state.verificationIndex.value;
    // 按钮显示字符串 默认立即开始
    String str = localized('start_now');
    str = isPreLevelPass ? localized('start_now') : localized('unavailable');
    int btnType = !canGoVerifyFirst
        ? 0
        : isPreLevelPass
            ? 3
            : 1;
    if (index == 0) {
      //初级 和默认一样
    } else if (index == 1) {
      if (GGUtil.parseStr(controller.state.ggKycProcessDetailForEu?.userInfo
              ?.intermediateVerificationStatus) ==
          'R') {
        str = localized('veri_again');
        btnType = 2;
      }
    } else {
      // 高级
      if (state.currentLevelModel?.isPass == true ||
          state.currentLevelModel?.isPending == true) {
        //高级已通过 或者审核中，不显示
        btnType = 0;
        str = localized('unavailable');
      } else if (canGoVerifyFirst) {
        // 中级已经通过
        if (controller.isShouldKycAdvanced.value == true) {
          //高级需要做认证
          if (GGUtil.parseStr(controller.state.ggKycProcessDetailForEu?.userInfo
                  ?.advancedVerificationStatus) ==
              'R') {
            str = localized('veri_again');
            btnType = 2;
          } else {
            btnType = 3;
            str = localized('start_now');
          }
        } else {
          btnType = 1;
          str = localized('unavailable');
        }
      } else {
        //中级没通过
        btnType = 1;
        str = localized('unavailable');
      }
    }

    return Visibility(
      visible: !controller.state.isAsia && btnType > 0,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              SizedBox(height: 52.dp),
              Text(
                localized(levelModel?.reviewTime ?? ''),
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content,
                ),
              ),
            ],
          ),
          //欧洲
          Visibility(
            visible: !controller.state.isAsia,
            child: Row(
              children: [
                Expanded(
                  child: GGButton.main(
                    onPressed: () {
                      if (isPreLevelPass) {
                        controller.onPressGoVerification(context, index);
                      }
                    },
                    text: str,
                    backgroundColor:
                        isPreLevelPass && (btnType == 2 || btnType == 3)
                            ? null
                            : GGColors.border.color,
                    enable: btnType == 2 || btnType == 3,
                    textColor: (btnType == 3
                            ? GGColors.buttonTextWhite
                            : GGColors.textMain)
                        .color,
                  ),
                ),
              ],
            ),
          ),
          Row(
            children: [
              SizedBox(height: 50.dp),
              SvgPicture.asset(
                R.kycKycCheck,
                width: 16.dp,
                height: 16.dp,
              ),
              SizedBox(width: 10.dp),
              Expanded(
                child: Text(
                  localized('secure_info'),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GGTextStyle(
                    color: GGColors.textSecond.color,
                    fontSize: GGFontSize.hint,
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildLevel() {
    final currentIndex = state.verificationIndex.value;
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          ...state.levels
              .map(
                (e) => InkWell(
                  onTap: () => _onPressLevelIndex(state.levels.indexOf(e)),
                  child: GGKycLevelView(
                    index: state.levels.indexOf(e),
                    kycLevelModel: e,
                    isSelected: currentIndex == state.levels.indexOf(e),
                  ),
                ),
              )
              .toList(),
        ],
      ),
    );
  }

  Widget _buildTopButtons(BuildContext context) {
    return Obx(() {
      return SizedBox(
        width: double.infinity,
        child: Row(
          // mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Expanded(
              child: Text(
                localized('personal_ver'),
                style: GGTextStyle(
                  fontSize: GGFontSize.bigTitle20,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.bold,
                ),
                maxLines: 2,
              ),
            ),
            Visibility(
              visible: state.kycInfo.value != null,
              child: GamingPopupLinkWidget(
                overlay: state.avatarOverlay,
                followerAnchor: Alignment.topRight,
                triangleSize: Size.zero,
                targetAnchor: Alignment.bottomCenter,
                popup: state.kycInfo.value?.primaryPassed() == true
                    ? GGKycRightsPopView(
                        modelInfo: state.kycInfo.value!,
                        isAsia: state.isAsia,
                      )
                    : _buildNotVerify(),
                offset: Offset(0, 20.dp),
                triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
                child: SvgPicture.asset(
                  R.kycKycAvatar,
                  width: 22.dp,
                  height: 22.dp,
                  color: state.avatarOverlay.isShowing.value
                      ? GGColors.brand.color
                      : null,
                ),
              ),
            ),
            SizedBox(width: 17.dp),
            GamingPopupLinkWidget(
              overlay: state.protectOverlay,
              popup: _buildProtectTips(),
              followerAnchor: Alignment.topRight,
              offset: Offset(20.dp, 20.dp),
              triangleInset: EdgeInsetsDirectional.only(end: 30.dp),
              child: SvgPicture.asset(
                R.kycKycPrivacy,
                width: 22,
                height: 22,
                color: state.protectOverlay.isShowing.value
                    ? GGColors.brand.color
                    : null,
              ),
            ),
            SizedBox(width: 20.dp),
          ],
        ),
      );
    });
  }
}

extension _Action on GGKycHomePage {
  void _onPressLevelIndex(int index) {
    controller.setLevelIndex(index);
  }

  void _onPressCountry() {
    _showCountrySelector().then((value) {
      if (value != null) {
        controller.setCurrentCountry(value);
      }
    });
  }

  Future<GamingCountryModel?> _showCountrySelector() async {
    return GamingBottomSheet.show<GamingCountryModel?>(
      title: localized('select_country'),
      builder: (context) {
        return const CountrySelectorListView(
          showAreaCode: false,
        );
      },
    );
  }
}
