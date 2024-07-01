import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/risk_form/enum.dart';
import 'package:gogaming_app/common/api/risk_form/models/risk_form_normal_list_model.dart';
import 'package:gogaming_app/common/api/user_notice/models/gaming_notification_list.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/global_setting.dart';
import 'package:gogaming_app/pages/advanced_certification/task_list/verify_task_list_widget.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'gaming_setting_notify_detail_logic.dart';
import 'package:gogaming_app/pages/setting_notify/gaming_setting_notify_logic.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:flutter/gestures.dart';

class GamingSettingNotifyDetail
    extends BaseView<GamingSettingNotifyDetailLogic> {
  const GamingSettingNotifyDetail(this.data, {super.key});

  final GamingNotificationItem data;

  GamingSettingNotifyLogic get baseController =>
      Get.find<GamingSettingNotifyLogic>();

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    Get.put(GamingSettingNotifyDetailLogic());
    return GGAppBar.userBottomAppbar(
      title: localized("noti"),
      trailingWidgets: [
        const Spacer(),
        GestureDetector(
          onTap: _onClickToProfile,
          child: SvgPicture.asset(
            R.mainMenuSetting,
            height: 20.dp,
            fit: BoxFit.fitHeight,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.hGap14,
        GestureDetector(
          onTap: _readAll,
          child: SvgPicture.asset(
            R.iconIconRight,
            width: 18.dp,
            height: 18.dp,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.hGap14,
        GamingPopupLinkWidget(
          overlay: controller.limitOverlay,
          followerAnchor: Alignment.topRight,
          targetAnchor: Alignment.topLeft,
          popup: _buildClearRead(),
          offset: Offset(20.dp, 20.dp),
          triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
          child: SvgPicture.asset(
            R.iconMore,
            width: 18.dp,
            height: 18.dp,
            color: GGColors.textSecond.color,
          ),
        ),
        SizedBox(
          width: 16.dp,
        ),
      ],
    );
  }

  @override
  Widget body(BuildContext context) {
    return _buildContent(context);
  }

  Widget _buildContent(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width,
      padding: EdgeInsets.only(top: 24.dp, left: 12.dp, right: 12.dp),
      decoration: BoxDecoration(
          color: GGColors.darkPopBackground.color,
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(16.dp),
          )),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.hGap8,
          SingleChildScrollView(
            child: SizedBox(
              height: MediaQuery.of(context).size.height - 160.dp,
              width: MediaQuery.of(context).size.width - 50.dp,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildTitle(),
                  Gaps.vGap8,
                  _buildTime(),
                  Gaps.vGap8,
                  _buildContentItem(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClearRead() {
    return Container(
      height: 80.dp,
      padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
      decoration: BoxDecoration(
          borderRadius: BorderRadius.vertical(
        top: Radius.circular(4.dp),
      )),
      child: Column(children: [
        GestureDetector(
          onTap: _clearBeenRead,
          child: _buildMainText(localized('clear_all')),
        ),
        _buildMainTextTwo(),
      ]),
    );
  }

  Widget _buildMainTextTwo() {
    return GestureDetector(
        onTap: showBeenRead,
        child: Container(
          height: 40.dp,
          alignment: Alignment.center,
          child: Obx(() {
            return Text(
              baseController.state.showBeenReade.value
                  ? localized('hide_read_noti')
                  : localized('show_hide_read_noti'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textBlackOpposite.color,
                fontFamily: GGFontFamily.dingPro,
              ),
            );
          }),
        ));
  }

  Widget _buildMainText(String str) {
    return Container(
      height: 40.dp,
      alignment: Alignment.center,
      child: Text(
        str,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textBlackOpposite.color,
          fontFamily: GGFontFamily.dingPro,
        ),
      ),
    );
  }

  Widget _buildTitle() {
    return Text(GGUtil.parseStr(data.title),
        style: GGTextStyle(
          fontSize: GGFontSize.smallTitle,
          color: GGColors.textMain.color,
        ));
  }

  Widget _buildContentItem() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Html(
          data: data.content,
          style: {
            'body': Style(margin: Margins.zero, maxLines: 500),
          },
        ),
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: data.showGoNow ? '${localized('bind_p_g')}>>>' : '',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.brand.color,
                  decoration: TextDecoration.underline,
                ),
                recognizer: TapGestureRecognizer()
                  ..onTap = () {
                    _onClickGoNow();
                  },
              ),
            ],
          ),
          softWrap: true,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildTime() {
    return Text(
      data.getTime,
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textSecond.color,
      ),
    );
  }

  /// 删除所有已读通知弹窗
  void clickDelRead() {
    final title = localized('hint');
    final content = localized('sure_del_noti00');
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: title,
      content: content,
      rightBtnName: localized('sure'),
      leftBtnName: localized('cancels'),
      onRightBtnPressed: () {
        Get.back<dynamic>();
        baseController.deleteAll();
      },
      onLeftBtnPressed: () {
        Get.back<dynamic>();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  /// 已读所有通知弹窗
  void clickReadAll() {
    final title = localized('hint');
    final content = localized('sure_read_noti00');
    final dialog = DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: title,
      content: content,
      rightBtnName: localized('sure'),
      leftBtnName: localized('cancels'),
      onRightBtnPressed: () {
        Get.back<dynamic>();
        baseController.readAll();
      },
      onLeftBtnPressed: () {
        Get.back<dynamic>();
      },
    );
    dialog.showNoticeDialogWithTwoButtons();
  }

  /// 清除已读
  void _clearBeenRead() {
    controller.limitOverlay.hide();
    clickDelRead();
  }

  /// 显示/隐藏已读通知
  void showBeenRead() {
    controller.limitOverlay.hide();
    baseController.showBeenRead(!baseController.state.showBeenReade.value);
  }

  void _onClickToProfile() {
    Get.back<dynamic>();
    Get.toNamed<dynamic>(Routes.preferencePage.route);
  }

  /// 已读所有
  void _readAll() {
    clickReadAll();
  }

  /// 点击立即前往
  void _onClickGoNow() {
    // 补充资料。需要调用接口
    if (data.businessType == BusinessType.riskAssessmentCreate.value ||
        data.businessType == BusinessType.wealthSourceCreate.value) {
      GlobalSetting.sharedInstance.queryNormalRiskForm().listen((event) {
        if (event != null && event.isNotEmpty) {
          RiskFormNormalListModel model = event[0];
          if (model.curType == RiskFormNormalListModelType.riskAssessment &&
              data.businessType == BusinessType.riskAssessmentCreate.value) {
            // 风险评估
            Get.toNamed<void>(Routes.riskAssessment.route,
                arguments: {'id': model.id});
          } else if (model.curType ==
                  RiskFormNormalListModelType.wealthSource &&
              data.businessType == BusinessType.wealthSourceCreate.value) {
            // 财富来源
            Get.toNamed<void>(Routes.wealthSourceCertificate.route,
                arguments: {'id': model.id});
          } else {
            // 不跳转提示
            Toast.showFailed(localized('timeout'));
          }
        } else {
          // 不跳转提示
          Toast.showFailed(localized('timeout'));
        }
      }).onError((Object error) {});
    } else if (data.businessType ==
        BusinessType.riskAssessmentNoApproved.value) {
      Get.toNamed<void>(Routes.riskAssessment.route, arguments: {
        'status': AuditStatus.rejected,
      });
    } else if (data.businessType == BusinessType.wealthSourceNoApproved.value) {
      Get.toNamed<void>(Routes.wealthSourceCertificate.route, arguments: {
        'status': AuditStatus.rejected,
      });
    } else if (data.businessType ==
        BusinessType.abnormalMemberSupplementNoApproved.value) {
      // 异常会员补充审核不通过
      VerifyTaskListWidget.show();
    } else if (data.businessType == BusinessType.idVerification.value) {
      Get.toNamed<void>(Routes.kycHome.route);
    } else if (data.businessType ==
        BusinessType.idVerificationNoApproved.value) {
      Get.toNamed<void>(Routes.kycHome.route);
    } else if (data.businessType == BusinessType.kycAdvancedForEuCreate.value) {
      Get.toNamed<void>(Routes.kycHome.route);
    }
  }
}
