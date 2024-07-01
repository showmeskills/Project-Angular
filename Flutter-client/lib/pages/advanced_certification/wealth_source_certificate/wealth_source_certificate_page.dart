import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/attachment_upload/attachment_upload.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/advanced_certification/common/views/advanced_certification_base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'wealth_source_certificate_logic.dart';

class WealthSourceCertificatePage
    extends AdvancedCertificationBaseView<WealthSourceCertificateLogic> {
  const WealthSourceCertificatePage({
    super.key,
    this.id,
  });

  final int? id;

  factory WealthSourceCertificatePage.argument(Map<String, dynamic> arguments) {
    final id = arguments['id'] as int?;
    return WealthSourceCertificatePage(id: id);
  }

  WealthSourceCertificateState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => WealthSourceCertificatePage.argument(
          Get.arguments as Map<String, dynamic>? ?? {}),
    );
  }

  @override
  String get title => localized('adv_ver');

  @override
  String get subTitle => localized('proof_of_wealth');

  @override
  Widget buildSubmitButton() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('upl_limits'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap12,
        SizedBox(
          width: double.infinity,
          child: Obx(() {
            return GGButton.main(
              enable: state.enable,
              isLoading: state.loading,
              onPressed: controller.submit,
              text: localized('continue'),
            );
          }),
        ),
      ],
    );
  }

  @override
  Widget buildContent(BuildContext context) {
    Get.put(WealthSourceCertificateLogic(id));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap20,
        // _buildQuota(),
        // Gaps.vGap44,
        _buildWealthSource(),
        Gaps.vGap40,
        Obx(() {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: state.wealthSource.map((e) {
              return _buildUploadItem(
                title: e.uploadTitle,
                tips: e.uploadTips,
                controller: state.controllers[e]!,
              );
            }).toList(),
          );
        }),
        // if (!readOnly) _buildStatement(),
        // if (!readOnly) Gaps.vGap24,
      ],
    );
  }

  // Widget _buildQuota() {
  //   return _buildItem(
  //     title: localized('select_quota'),
  //     tips: localized('select_quota_tips'),
  //     child: Obx(() {
  //       return Column(
  //         crossAxisAlignment: CrossAxisAlignment.start,
  //         children: [
  //           GamingSelectorWidget(
  //             backgroundColor: GGColors.transparent.color,
  //             border: Border.all(
  //               color: state.quotaError
  //                   ? GGColors.error.color
  //                   : GGColors.border.color,
  //               width: 1.dp,
  //             ),
  //             onPressed: controller.selectQuota,
  //             builder: (context) {
  //               return Obx(() {
  //                 if (state.quota != null) {
  //                   return Text(
  //                     state.quota!.text,
  //                     style: GGTextStyle(
  //                       fontSize: GGFontSize.content,
  //                       color: GGColors.textMain.color,
  //                     ),
  //                   );
  //                 }
  //                 return Container();
  //               });
  //             },
  //           ),
  //           if (state.quotaError)
  //             Text(
  //               localized('select_quota_error'),
  //               style: GGTextStyle(
  //                 fontSize: GGFontSize.hint,
  //                 color: GGColors.error.color,
  //                 fontWeight: GGFontWeigh.regular,
  //                 height: 1.4,
  //               ),
  //             ),
  //         ],
  //       );
  //     }),
  //   );
  // }

  Widget _buildWealthSource() {
    return _buildItem(
      title: localized('source_wealth'),
      child: GamingSelectorWidget(
        backgroundColor: GGColors.transparent.color,
        border: Border.all(
          color: GGColors.border.color,
          width: 1.dp,
        ),
        onPressed: controller.selectWealthSource,
        builder: (context) {
          return Obx(() {
            if (state.wealthSource.isEmpty) {
              return Container();
            }
            return Wrap(
              spacing: 10.dp,
              runSpacing: 8.dp,
              children: state.wealthSource.map((e) {
                return Container(
                  color: GGColors.border.color,
                  padding: EdgeInsets.symmetric(
                    vertical: 3.dp,
                    horizontal: 9.dp,
                  ),
                  child: Text(
                    e.text,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  ),
                );
              }).toList(),
            );
          });
        },
      ),
    );
  }

  Widget _buildUploadItem({
    required String title,
    required String tips,
    required AttachmentUploadController controller,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: 32.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
              fontWeight: GGFontWeigh.bold,
            ),
          ),
          Gaps.vGap6,
          Text(
            localized('docs_tips'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap8,
          Text(
            tips,
            style: GGTextStyle(
              height: 1.78,
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap24,
          AttachmentUploadedView(controller: controller),
          Obx(() {
            if (controller.attachments.isEmpty) {
              return AttachmentUploadButton(
                controller: controller,
                iconColor: GGColors.highlightButton,
              );
            }
            return Gaps.empty;
          })
        ],
      ),
    );
  }

  // Widget _buildStatement() {
  //   return Column(
  //     crossAxisAlignment: CrossAxisAlignment.start,
  //     children: [
  //       GestureDetector(
  //         behavior: HitTestBehavior.opaque,
  //         onTap: () {
  //           controller.toggleStatement();
  //         },
  //         child: Row(
  //           children: [
  //             Obx(() {
  //               return GamingCheckBox(
  //                 value: state.statement,
  //                 onChanged: (v) {
  //                   controller.toggleStatement();
  //                 },
  //                 unSelectedColor: GGColors.textSecond.color,
  //               );
  //             }),
  //             Gaps.hGap10,
  //             Text(
  //               localized('statem_00'),
  //               style: GGTextStyle(
  //                 fontSize: GGFontSize.content,
  //                 color: GGColors.textMain.color,
  //               ),
  //             ),
  //           ],
  //         ),
  //       ),
  //       Gaps.vGap12,
  //       Text(
  //         localized('wealth_source_statement_protocol'),
  //         style: GGTextStyle(
  //           fontSize: GGFontSize.content,
  //           color: GGColors.textHint.color,
  //         ),
  //       ),
  //     ],
  //   );
  // }

  Widget _buildItem({
    required String title,
    required Widget child,
    bool isRequired = false,
    String? tips,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              title,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
            if (isRequired)
              Container(
                margin: EdgeInsets.only(left: 2.dp),
                child: Text(
                  '*',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.error.color,
                  ),
                ),
              ),
          ],
        ),
        Gaps.vGap4,
        child,
        if (tips?.isNotEmpty ?? false)
          Container(
            margin: EdgeInsets.only(top: 15.dp),
            child: Text(
              tips!,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textHint.color,
              ),
            ),
          ),
      ],
    );
  }
}
