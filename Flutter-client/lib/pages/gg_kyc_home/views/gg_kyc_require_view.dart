import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_document_model.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_level_model.dart';
import 'package:gogaming_app/common/api/kyc/models/gg_kyc_power_limit.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';
import '../../../models/kyc/go_gaming_kyc_model.dart';
import '../gg_kyc_home_logic.dart';

class GGKycRequireView extends StatefulWidget {
  const GGKycRequireView({
    Key? key,
    required this.levelModel,
    this.rejectTips,
    required this.rejectOverlay,
  }) : super(key: key);

  final Widget? rejectTips;
  final GGKycLevelModel levelModel;
  final GamingOverlay rejectOverlay;

  @override
  State<GGKycRequireView> createState() => _GGKycRequireViewState();
}

class _GGKycRequireViewState extends State<GGKycRequireView> {
  GGKycHomeLogic get baseController => Get.find<GGKycHomeLogic>();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsetsDirectional.only(top: 34.dp),
      child: Column(
        children: [
          ..._buildRequire(),
          SizedBox(height: 20.dp),
          ..._buildLimits(),
          Obx(() {
            return _buildVerificationInformationItems();
          }),
          Obx(() {
            return _buildVerificationInformationItemsAdvanced(
                baseController.state.ggKycDocumentModel?.kycAdvanced);
          }),
          Obx(() {
            return _buildVSupplementaryDocumentsItems();
          }),
        ],
      ),
    );
  }

  List<Widget> _buildRequire() {
    return [
      Row(
        children: [
          Text(
            localized('require'),
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle,
              fontWeight: GGFontWeigh.medium,
              color: GGColors.textMain.color,
            ),
          ),
          const Spacer(),
          _buildStatusMark(),
        ],
      ),
      ...widget.levelModel.requires.map(
        (e) => Padding(
          padding: EdgeInsetsDirectional.only(top: 3.dp),
          child: Row(
            children: [
              Container(
                width: 18.dp,
                height: 20.dp,
                alignment: AlignmentDirectional.centerStart,
                child: SvgPicture.asset(
                  e.iconPath,
                  color: GGColors.textSecond.color,
                  width: 13.dp,
                  height: 13.dp,
                ),
              ),
              Text(
                localized(e.title),
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content,
                ),
              ),
            ],
          ),
        ),
      ),
    ];
  }

  Widget _buildStatusMark() {
    var backColor = GGColors.success.color.withOpacity(0.2);
    var iconPath = R.kycKycPass;
    var title = localized('cer');
    Color curTitleColor = GGColors.success.color;
    if (widget.levelModel.isReject) {
      backColor = Colors.transparent;
      iconPath = R.kycKycResultError;
      title = localized('veri_fail');
      curTitleColor = GGColors.error.color;
    } else if (widget.levelModel.isPending) {
      backColor = GGColors.error.color.withOpacity(0.2);
      iconPath = R.kycKycPendingIcon;
      title = localized("refunding");
      curTitleColor = GGColors.highlightButton.color;
    }

    return Visibility(
      visible: widget.levelModel.isPass ||
          widget.levelModel.isReject ||
          widget.levelModel.isPending,
      child: Transform.translate(
        offset: Offset(16.dp, 0),
        child: Container(
          constraints: BoxConstraints(minWidth: 90.dp, minHeight: 36.dp),
          decoration: BoxDecoration(
            color: backColor,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(32),
              bottomLeft: Radius.circular(32),
            ),
          ),
          child: GamingPopupLinkWidget(
            popup: widget.rejectTips,
            followerAnchor: Alignment.topRight,
            offset: Offset(-12.dp, 0),
            overlay: widget.rejectOverlay,
            child: Row(
              children: [
                SizedBox(width: 9.dp),
                SvgPicture.asset(
                  iconPath,
                  width: 18.dp,
                  height: 18.dp,
                ),
                SizedBox(width: 7.dp),
                Text(
                  localized(title),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    fontWeight: GGFontWeigh.medium,
                    color: curTitleColor,
                    decoration: widget.levelModel.isReject
                        ? TextDecoration.underline
                        : null,
                    decorationStyle: TextDecorationStyle.solid,
                  ),
                ),
                SizedBox(width: 10.dp),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildLimits() {
    return [
      Row(
        children: [
          Text(
            localized('feature_limit'),
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle,
              fontWeight: GGFontWeigh.medium,
              color: GGColors.textMain.color,
            ),
          ),
        ],
      ),
      ...widget.levelModel.powerAndLimits.map(
        (e) => _buildLimitItems(e),
      ),
    ];
  }

  Widget _buildLimitItems(KycPowerAndLimits limits) {
    var isPassLimit = widget.levelModel.isPass == true;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(height: 10.dp),
        Row(
          children: [
            Text(
              localized(limits.title),
              style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ],
        ),
        SizedBox(height: 20.dp),
        ...limits.info.map(
          (e) => Padding(
            padding: EdgeInsetsDirectional.only(
              bottom: 20.dp,
              end: 20.dp,
              start: 10.dp,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Visibility(
                      visible: isPassLimit,
                      child: SvgPicture.asset(
                        R.kycCircleCheckedGreen,
                        width: 14.dp,
                        height: 14.dp,
                      ),
                    ),
                    Visibility(
                      visible: isPassLimit,
                      child: SizedBox(width: 5.dp),
                    ),
                    Expanded(
                      flex: 1,
                      child: Text(
                        localized(e.name),
                        style: GGTextStyle(
                          color: GGColors.textSecond.color,
                          fontSize: GGFontSize.content,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 10.dp),
                Row(
                  children: [
                    Visibility(
                      visible: isPassLimit,
                      child: SizedBox(width: 25.dp),
                    ),
                    ...e.desc.map(
                      (desc) => Expanded(
                        flex: 1,
                        child: Text(
                          localized(desc),
                          style: GGTextStyle(
                            color: GGColors.textMain.color,
                            fontSize: GGFontSize.content,
                            fontWeight: GGFontWeigh.medium,
                          ),
                        ),
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        ),
        Divider(
          height: 1,
          color: GGColors.border.color,
          // endIndent: 15,
        ),
      ],
    );
  }

  // 验证信息
  Widget _buildVerificationInformationItems() {
    String idStatus = localized('approved');
    Color idColor = GGColors.success.color;
    String poaStatus = localized('approved');
    Color poaColor = GGColors.success.color;
    if (KycService.sharedInstance.userVerificationForEu?.idVerificationStatus ==
        KycVerifyStatus.pending) {
      idStatus = localized('under_review');
      idColor = GGColors.highlightButton.color;
    } else if (KycService
            .sharedInstance.userVerificationForEu?.idVerificationStatus ==
        KycVerifyStatus.reject) {
      idStatus = localized('reject');
      idColor = GGColors.error.color;
    }
    if (KycService.sharedInstance.userVerificationForEu?.poaVerificationStatus ==
        KycVerifyStatus.pending) {
      poaStatus = localized('under_review');
      poaColor = GGColors.highlightButton.color;
    } else if (KycService
        .sharedInstance.userVerificationForEu?.poaVerificationStatus ==
        KycVerifyStatus.reject) {
      poaStatus = localized('reject');
      poaColor = GGColors.error.color;
    }
    return Visibility(
      visible: !baseController.state.isAsia &&
          baseController.state.verificationIndex.value == 1 &&
          (baseController.state.ggKycProcessDetailForEu?.idcardProcessLog !=
                  null ||
              baseController.state.ggKycProcessDetailForEu?.poaProcessLog !=
                  null),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(height: 10.dp),
          Row(
            children: [
              Text(
                localized('verification_infor'),
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content,
                ),
              ),
            ],
          ),
          SizedBox(height: 20.dp),

          /// 政府发行的身份证
          Padding(
            padding: EdgeInsetsDirectional.only(
              end: 20.dp,
              start: 10.dp,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Visibility(
                      visible: widget.levelModel.isPass,
                      child: SvgPicture.asset(
                        R.kycCircleCheckedGreen,
                        width: 14.dp,
                        height: 14.dp,
                      ),
                    ),
                    Visibility(
                        visible: widget.levelModel.isPass, child: Gaps.hGap6),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${localized('gov_id')}:',
                          ),
                          TextSpan(
                            text: '($idStatus)',
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: idColor,
                            ),
                          ),
                        ],
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textSecond.color,
                        ),
                      ),
                    ),
                    Gaps.hGap10,
                    Visibility(
                        visible:
                            baseController.state.verificationIndex.value == 1 &&
                                (GGUtil.parseStr(baseController
                                        .state
                                        .ggKycProcessDetailForEu
                                        ?.userInfo
                                        ?.intermediateVerificationStatus) ==
                                    'R'),
                        child: GestureDetector(
                            onTap: _onClickSupplementaryDocumentsIdVerification,
                            child: _buildUpLoad())),
                  ],
                ),
                Text(
                  GGUtil.parseStr(baseController.state.ggKycProcessDetailForEu
                          ?.idcardProcessLog?.originalFileName)
                      .replaceAll("; ", '\n'),
                  style: GGTextStyle(
                      color: GGColors.textMain.color,
                      fontSize: GGFontSize.hint,
                      fontWeight: GGFontWeigh.bold),
                ),
                SizedBox(height: 10.dp),
              ],
            ),
          ),

          /// 地址证明
          Padding(
            padding: EdgeInsetsDirectional.only(
              end: 20.dp,
              start: 10.dp,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Visibility(
                      visible: widget.levelModel.isPass,
                      child: SvgPicture.asset(
                        R.kycCircleCheckedGreen,
                        width: 14.dp,
                        height: 14.dp,
                      ),
                    ),
                    Visibility(
                        visible: widget.levelModel.isPass, child: Gaps.hGap6),
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${localized('prof_ad')}:',
                          ),
                          TextSpan(
                            text: '($poaStatus)',
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: poaColor,
                            ),
                          ),
                        ],
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textSecond.color,
                        ),
                      ),
                    ),
                    Gaps.hGap10,
                    Visibility(
                        visible:
                            baseController.state.verificationIndex.value == 1 &&
                                (GGUtil.parseStr(baseController
                                        .state
                                        .ggKycProcessDetailForEu
                                        ?.userInfo
                                        ?.intermediateVerificationStatus) ==
                                    'R'),
                        child: GestureDetector(
                            onTap: _onClickSupplementaryDocumentsProofOfAddress,
                            child: _buildUpLoad())),
                  ],
                ),
                Text(
                  GGUtil.parseStr(baseController.state.ggKycProcessDetailForEu
                          ?.poaProcessLog?.originalFileName)
                      .replaceAll("; ", '\n'),
                  style: GGTextStyle(
                      color: GGColors.textMain.color,
                      fontSize: GGFontSize.hint,
                      fontWeight: GGFontWeigh.bold),
                ),
                SizedBox(height: 10.dp),
              ],
            ),
          ),
          Divider(
            height: 1,
            color: GGColors.border.color,
            // endIndent: 15,
          ),
        ],
      ),
    );
  }

  // 高级的验证信息 退休金，薪资证明等等
  Widget _buildVerificationInformationItemsAdvanced(Sow? model) {
    if (model == null) {
      return Container();
    }

    List<Widget> widgets = [];
    widgets.add(
      SizedBox(height: 10.dp),
    );

    widgets.add(
      Row(
        children: [
          Text(
            localized('verification_infor'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
            ),
          ),
        ],
      ),
    );

    widgets.add(
      SizedBox(height: 20.dp),
    );

    int length = GGUtil.parseInt(model.document?.typeList?.length);
    if (length > 0) {
      // 遍历 model.document?.typeList
      for (int i = 0; i < length; i++) {
        widgets.add(
          _buildDocumentItem(
            model.status,
            model.document?.typeList![i],
          ),
        );
      }
    }

    widgets.add(
      Divider(
        height: 1,
        color: GGColors.border.color,
        // endIndent: 15,
      ),
    );

    return Visibility(
      visible: !baseController.state.isAsia &&
          baseController.state.verificationIndex.value == 2,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: widgets,
      ),
    );
  }

  Widget _buildDocumentItem(String? status, Map<String, dynamic>? map) {
    if (map == null || map.isEmpty) return Container();
    String name = GGUtil.parseStr(map['name']);
    List<String> images = map['images'] as List<String>;

    String statusStr = localized('click_upload');
    Color titleColor = GGColors.error.color;
    if (status == KycDocumentStatus.pending) {
      statusStr = localized('under_review');
      titleColor = GGColors.highlightButton.color;
    } else if (status == KycDocumentStatus.normal) {
      statusStr = localized('click_upload');
      titleColor = GGColors.error.color;
    } else if (status == KycDocumentStatus.finish) {
      statusStr = localized('approved');
      titleColor = GGColors.success.color;
    } else {
      statusStr = localized('reject');
      titleColor = GGColors.error.color;
    }

    String imagesStr = images.join('\n');
    return Padding(
      padding: EdgeInsetsDirectional.only(
        end: 20.dp,
        start: 10.dp,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Visibility(
                visible: status == KycDocumentStatus.finish,
                child: SvgPicture.asset(
                  R.kycCircleCheckedGreen,
                  width: 14.dp,
                  height: 14.dp,
                ),
              ),
              Visibility(
                  visible: status != KycDocumentStatus.finish,
                  child: Gaps.hGap6),
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: name,
                    ),
                    TextSpan(
                      text: ' ($statusStr)',
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: titleColor,
                      ),
                    ),
                  ],
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
              Gaps.hGap10,
              Visibility(
                  visible: status == KycDocumentStatus.normal ||
                      status == KycDocumentStatus.rejected,
                  child: GestureDetector(
                      onTap: _onClickVerificationInformation,
                      child: _buildUpLoad())),
            ],
          ),
          Text(
            imagesStr,
            style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.hint,
                fontWeight: GGFontWeigh.bold),
          ),
          SizedBox(height: 10.dp),
        ],
      ),
    );
  }

  Widget _buildVSupplementaryDocumentsItems() {
    List<Widget> widgets = [];
    widgets.add(
      SizedBox(height: 10.dp),
    );
    widgets.add(
      Row(
        children: [
          Text(
            localized('supplementary_document'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
            ),
          ),
        ],
      ),
    );
    widgets.add(
      SizedBox(height: 10.dp),
    );
    widgets.add(
      baseController.showDocumentPayMethod.value
          ? _buildVerificationItem(
              '${localized('payment_method')} ${GGUtil.parseStr(baseController.state.ggKycDocumentModel?.paymentMethod?.document?.paymentName)}',
              GGUtil.parseStr(baseController
                  .state.ggKycDocumentModel?.paymentMethod?.status),
              GGUtil.parseStr(baseController.state.ggKycDocumentModel
                  ?.paymentMethod?.document?.originalFileName),
              callback: _onClickSupplementaryDocumentsPayMethod)
          : Container(),
    );
    widgets.add(
      baseController.showDocumentIdVerification.value
          ? _buildVerificationItem(
              localized('identity_document'),
              GGUtil.parseStr(baseController
                  .state.ggKycDocumentModel?.idVerification?.status),
              GGUtil.parseStr(baseController.state.ggKycDocumentModel
                  ?.idVerification?.document?.originalFrontImageName),
              backFileName: GGUtil.parseStr(baseController
                  .state
                  .ggKycDocumentModel
                  ?.idVerification
                  ?.document
                  ?.originalBackImageName),
              callback: _onClickSupplementaryDocumentsIdVerification)
          : Container(),
    );

    widgets.add(
      baseController.showDocumentProofOfAddress.value
          ? _buildVerificationItem(
              localized('prof_ad'),
              GGUtil.parseStr(baseController
                  .state.ggKycDocumentModel?.proofOfAddress?.status),
              GGUtil.parseStr(baseController.state.ggKycDocumentModel
                  ?.proofOfAddress?.document?.originalFileName),
              callback: _onClickSupplementaryDocumentsProofOfAddress)
          : Container(),
    );

    widgets.add(
      baseController.showDocumentCustomize.value
          ? _buildVerificationItem(
              GGUtil.parseStr(baseController.state.ggKycDocumentModel?.customize
                  ?.document?.customizeName),
              GGUtil.parseStr(
                  baseController.state.ggKycDocumentModel?.customize?.status),
              GGUtil.parseStr(baseController.state.ggKycDocumentModel?.customize
                  ?.document?.originalFileName),
              callback: _onClickSupplementaryDocumentsCustomize)
          : Container(),
    );
    int length = GGUtil.parseInt(baseController
        .state.ggKycDocumentModel?.sow?.document?.typeList?.length);

    if (baseController.showDocumentSow.value) {
      // 遍历 model.document?.typeList
      String statusSowStr = localized('click_upload');
      Color sowTitleColor = GGColors.error.color;
      String sowStatus =
          baseController.state.ggKycDocumentModel?.sow?.status ?? '';
      if (sowStatus == KycDocumentStatus.pending) {
        statusSowStr = localized('under_review');
        sowTitleColor = GGColors.highlightButton.color;
      } else if (sowStatus == KycDocumentStatus.normal) {
        statusSowStr = localized('click_upload');
        sowTitleColor = GGColors.error.color;
      } else if (sowStatus == KycDocumentStatus.finish) {
        statusSowStr = localized('approved');
        sowTitleColor = GGColors.success.color;
      } else {
        statusSowStr = localized('reject');
        sowTitleColor = GGColors.error.color;
      }

      widgets.add(
        Padding(
          padding: EdgeInsetsDirectional.only(
            end: 20.dp,
            start: 10.dp,
          ),
          child: Row(
            children: [
              Visibility(
                visible: sowStatus == KycDocumentStatus.finish,
                child: SvgPicture.asset(
                  R.kycCircleCheckedGreen,
                  width: 14.dp,
                  height: 14.dp,
                ),
              ),
              Visibility(
                  visible: sowStatus != KycDocumentStatus.rejected &&
                      sowStatus != KycDocumentStatus.pending,
                  child: Gaps.hGap6),
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: '${localized('proof_of_wealth')}:',
                    ),
                    TextSpan(
                      text: ' ($statusSowStr)',
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: sowTitleColor,
                      ),
                    ),
                  ],
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
              Gaps.hGap10,
              Visibility(
                  visible: sowStatus == KycDocumentStatus.normal ||
                      sowStatus == KycDocumentStatus.rejected,
                  child: GestureDetector(
                      onTap: _onClickSupplementaryDocumentsSow,
                      child: _buildUpLoad())),
            ],
          ),
        ),
      );
      if (length > 0) {
        for (int i = 0; i < length; i++) {
          widgets.add(
            Padding(
              padding: EdgeInsetsDirectional.only(
                end: 20.dp,
                top: 6.dp,
              ),
              child: _buildDocumentSowItem(
                baseController.state.ggKycDocumentModel?.sow?.status,
                baseController
                    .state.ggKycDocumentModel?.sow?.document?.typeList![i],
              ),
            ),
          );
        }
      }
    }

    widgets.add(
      Divider(
        height: 1,
        color: GGColors.border.color,
        // endIndent: 15,
      ),
    );

    return Visibility(
      visible: baseController.showDocument.value,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: widgets,
      ),
    );
  }

  Widget _buildDocumentSowItem(String? status, Map<String, dynamic>? map) {
    if (map == null || map.isEmpty) return Container();
    String name = GGUtil.parseStr(map['name']);
    List<String> images = map['images'] as List<String>;
    String imagesStr = images.join('\n');
    return Padding(
      padding: EdgeInsetsDirectional.only(
        end: 20.dp,
        start: 10.dp,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${localized(name)}:\n$imagesStr',
            style: GGTextStyle(
                color: GGColors.textMain.color, fontSize: GGFontSize.hint),
          ),
          SizedBox(height: 10.dp),
        ],
      ),
    );
  }

  Widget _buildVerificationItem(String str, String status, String fileName,
      {String backFileName = '', void Function()? callback}) {
    String statusStr = localized('click_upload');
    Color titleColor = GGColors.error.color;
    if (status == KycDocumentStatus.pending) {
      statusStr = localized('under_review');
      titleColor = GGColors.highlightButton.color;
    } else if (status == KycDocumentStatus.normal) {
      statusStr = localized('click_upload');
      titleColor = GGColors.error.color;
    } else if (status == KycDocumentStatus.finish) {
      statusStr = localized('approved');
      titleColor = GGColors.success.color;
    } else {
      statusStr = localized('reject');
      titleColor = GGColors.error.color;
    }
    if (str.isEmpty) {
      return Container();
    }
    return Padding(
      padding: EdgeInsetsDirectional.only(
        end: 20.dp,
        start: 10.dp,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Visibility(
                visible: status == KycDocumentStatus.finish,
                child: SvgPicture.asset(
                  R.kycCircleCheckedGreen,
                  width: 14.dp,
                  height: 14.dp,
                ),
              ),
              Visibility(
                visible: status == KycDocumentStatus.finish,
                child: Gaps.hGap6,
              ),
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: str,
                    ),
                    TextSpan(
                      text: ' ($statusStr)',
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: titleColor,
                      ),
                    ),
                  ],
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
              Gaps.hGap10,
              Visibility(
                  visible: status == KycDocumentStatus.normal ||
                      status == KycDocumentStatus.rejected,
                  child:
                      GestureDetector(onTap: callback, child: _buildUpLoad())),
            ],
          ),
          Visibility(visible: fileName.isNotEmpty, child: Gaps.vGap6),
          Visibility(
            visible: fileName.isNotEmpty,
            child: Text(
              fileName,
              style: GGTextStyle(
                  color: GGColors.textMain.color,
                  fontSize: GGFontSize.hint,
                  fontWeight: GGFontWeigh.bold),
            ),
          ),
          Visibility(visible: backFileName.isNotEmpty, child: Gaps.vGap6),
          Visibility(
            visible: backFileName.isNotEmpty,
            child: Text(
              backFileName,
              style: GGTextStyle(
                  color: GGColors.textMain.color,
                  fontSize: GGFontSize.hint,
                  fontWeight: GGFontWeigh.bold),
            ),
          ),
          SizedBox(height: 20.dp),
        ],
      ),
    );
  }

  Widget _buildUpLoad() {
    return Container(
      width: 30.dp,
      height: 20.dp,
      color: GGColors.textHint.color.withOpacity(0.3),
      padding: EdgeInsets.only(top: 3.dp, bottom: 3.dp),
      child: Image.asset(
        R.iconAvatarUpload,
        width: 16.dp,
        height: 6.dp,
        color: GGColors.highlightButton.color,
      ),
    );
  }
}

extension _Action on _GGKycRequireViewState {
  //  验证信息
  void _onClickVerificationInformation() {
    Get.toNamed<void>(Routes.kycMiddle.route);
  }

  // 补充文件 付款方式
  void _onClickSupplementaryDocumentsPayMethod() {
    Get.toNamed<void>(Routes.kycReplenish.route, arguments: {
      'paymentMethod': baseController.state.ggKycDocumentModel?.paymentMethod
    });
  }

  // 补充文件  身份证明
  void _onClickSupplementaryDocumentsIdVerification() {
    if (GGUtil.parseInt(
            baseController.state.ggKycDocumentModel?.idVerification?.id) ==
        0) {
      baseController.onPressGoVerification(
          Get.overlayContext!, baseController.state.verificationIndex.value);
    } else {
      Get.toNamed<void>(Routes.kycReplenishID.route, arguments: {
        'documentId':
            baseController.state.ggKycDocumentModel?.idVerification?.id
      });
    }
  }

  // 补充文件  地址证明
  void _onClickSupplementaryDocumentsProofOfAddress() {
    if (GGUtil.parseInt(
            baseController.state.ggKycDocumentModel?.proofOfAddress?.id) ==
        0) {
      baseController.onPressGoVerification(
          Get.overlayContext!, baseController.state.verificationIndex.value);
    } else {
      Get.toNamed<void>(Routes.kycReplenishPOA.route, arguments: {
        'documentId':
            baseController.state.ggKycDocumentModel?.proofOfAddress?.id
      });
    }
  }

  // 补充文件  自定义
  void _onClickSupplementaryDocumentsCustomize() {
    Get.toNamed<void>(Routes.kycReplenish.route, arguments: {
      'customize': baseController.state.ggKycDocumentModel?.customize
    });
  }

  // 补充文件  财富证明
  void _onClickSupplementaryDocumentsSow() {
    Get.toNamed<void>(Routes.wealthSourceCertificate.route, arguments: {
      'id': baseController.state.ggKycDocumentModel?.sow?.id ?? ''
    });
  }
}
