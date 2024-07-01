import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/api/risk_form/enum.dart';
import 'package:gogaming_app/pages/advanced_certification/common/views/advanced_certification_base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'risk_assessment_logic.dart';

class RiskAssessmentPage
    extends AdvancedCertificationBaseView<RiskAssessmentLogic> {
  const RiskAssessmentPage({
    super.key,
  });

  factory RiskAssessmentPage.argument(Map<String, dynamic> arguments) {
    return const RiskAssessmentPage();
  }

  RiskAssessmentState get state => controller.state;

  @override
  String get title => localized('edd_veri');

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => RiskAssessmentPage.argument(
          Get.arguments as Map<String, dynamic>? ?? {}),
    );
  }

  @override
  Widget buildSubmitButton() {
    return Obx(() {
      return GGButton.main(
        enable: state.enable,
        isLoading: state.loading,
        onPressed: controller.submit,
        text: localized('continue'),
      );
    });
  }

  @override
  Widget buildContent(BuildContext context) {
    Get.put(RiskAssessmentLogic());
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap8,
        _buildYearlyIncome(),
        Gaps.vGap28,
        _buildEmploymentStatus(),
        _buildCompany(),
        Gaps.vGap28,
        _buildAssetsSource(),
        Gaps.vGap28,
      ],
    );
  }

  Widget _buildYearlyIncome() {
    return _buildItem(
      title: localized('month_salary'),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: GamingTextField(
                controller: controller.yearlyIncomeController,
                keyboardType: TextInputType.number,
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 14.dp,
                  vertical: 14.dp,
                ),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'[0-9]')),
                ],
              ),
            ),
            Gaps.hGap16,
            SizedBox(
              width: 100.dp,
              height: 14.dp * 1.44 + 14.dp * 2,
              child: GamingSelectorWidget(
                onPressed: controller.selectCurrency,
                builder: (context) {
                  return Obx(() {
                    return Text(
                      state.currency.currency!,
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textMain.color,
                        fontFamily: GGFontFamily.dingPro,
                        fontWeight: GGFontWeigh.bold,
                      ),
                    );
                  });
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmploymentStatus() {
    return _buildItem(
      title: localized('employment_status'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GamingSelectorWidget(
            backgroundColor: GGColors.transparent.color,
            border: Border.all(
              color: GGColors.border.color,
              width: 1.dp,
            ),
            onPressed: controller.selectEmploymentStatus,
            builder: (context) {
              return Obx(() {
                if (state.employStatus != null) {
                  return Text(
                    state.employStatus!.text,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  );
                }
                return Container();
              });
            },
          ),
          // if (state.employStatusError)
          //   Text(
          //     localized('sen_de') + localized('employment_status'),
          //     style: GGTextStyle(
          //       fontSize: GGFontSize.hint,
          //       color: GGColors.error.color,
          //       fontWeight: GGFontWeigh.regular,
          //       height: 1.4,
          //     ),
          //   ),
        ],
      ),
    );
  }

  Widget _buildCompany() {
    return Obx(() {
      if (state.employStatus == EmployStatus.employment ||
          state.employStatus == EmployStatus.freelance) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Gaps.vGap28,
            _buildCompanyName(),
          ],
        );
      }
      return Container();
    });
  }

  Widget _buildCompanyName() {
    return _buildItem(
      title: localized('occupation'),
      child: GamingTextField(
        controller: controller.companyNameController,
        contentPadding: EdgeInsets.symmetric(
          horizontal: 14.dp,
          vertical: 14.dp,
        ),
      ),
    );
  }

  Widget _buildAssetsSource() {
    return _buildItem(
      title: localized('wealth_source'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GamingSelectorWidget(
            backgroundColor: GGColors.transparent.color,
            border: Border.all(
              color: GGColors.border.color,
              width: 1.dp,
            ),
            onPressed: controller.selectAssetsSource,
            builder: (context) {
              return Obx(() {
                if (state.assetSource != null) {
                  return Text(
                    state.assetSource!.text,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  );
                }
                return Container();
              });
            },
          ),
          // if (state.assetSourceError)
          //   Text(
          //     localized('sen_de') + localized('wealth_source'),
          //     style: GGTextStyle(
          //       fontSize: GGFontSize.hint,
          //       color: GGColors.error.color,
          //       fontWeight: GGFontWeigh.regular,
          //       height: 1.4,
          //     ),
          //   ),
        ],
      ),
    );
  }

  Widget _buildItem({
    required String title,
    required Widget child,
    bool isRequired = false,
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
      ],
    );
  }
}

extension _Action on RiskAssessmentPage {}
