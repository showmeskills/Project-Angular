import 'package:flick_video_player/flick_video_player.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/painting/r_dotted_line_border.dart';
import 'package:gogaming_app/common/painting/selected_rounded_rectangle_border.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/appeal/common/appeal_common_ui_mixin.dart';
import 'package:gogaming_app/pages/appeal/common/views/appeal_base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:video_player/video_player.dart';

import 'currency_appeal_submit_logic.dart';

part 'views/_currency_appeal_tx_info_view.dart';
part 'views/_currency_appeal_upload_view.dart';
part 'views/_currency_appeal_video_player.dart';

class CurrencyAppealSubmitPage extends AppealBaseView<CurrencyAppealSubmitLogic>
    with AppealCommonUIMixin {
  const CurrencyAppealSubmitPage({super.key, this.id});
  final String? id;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => CurrencyAppealSubmitPage.argument(
          Get.arguments as Map<String, dynamic>? ?? {}),
    );
  }

  factory CurrencyAppealSubmitPage.argument(Map<String, dynamic> arguments) {
    final id = arguments['id'] as String?;
    return CurrencyAppealSubmitPage(id: id);
  }

  CurrencyAppealSubmitState get state => controller.state;

  @override
  String get title => localized('com_rec_not00');

  @override
  Widget body(BuildContext context) {
    Get.put(CurrencyAppealSubmitLogic(id));
    return bodyContainer(
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Gaps.vGap20,
            buildTitle(
              localized('enter_id'),
            ),
            Gaps.vGap24,
            _buildOrderNumTextField(),
            const _CurrencyAppealTxInfoView(),
            Gaps.vGap24,
            const _CurrencyAppealUploadView(),
            Gaps.vGap32,
            _buildMutliTextField(),
            Gaps.vGap36,
            _buildButton(),
            SafeArea(
              minimum: EdgeInsets.only(bottom: 24.dp),
              child: Gaps.empty,
            ),
          ],
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
              onPressed: _submit,
              // enable: state.enable,
              isLoading: state.loading,
              text: localized('confirm_button'),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildMutliTextField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildTitle(
          localized('addi_info'),
          isRequired: false,
        ),
        Gaps.vGap24,
        Text(
          localized('add_info'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap6,
        GamingTextField(
          controller: controller.descTextFieldController,
          contentPadding: EdgeInsets.symmetric(
            horizontal: 14.dp,
            vertical: 14.dp,
          ),
          fillColor: GGColors.transparent,
          maxLine: 3,
          maxLength: 500,
        ),
      ],
    );
  }

  Widget _buildOrderNumTextField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('trans_id'), isRequired: true),
        Gaps.vGap10,
        GamingTextField(
          controller: controller.orderNumTextFieldController,
          hintText: localized('please_enter_id'),
          enabled: id == null,
          contentPadding: EdgeInsets.symmetric(
            horizontal: 14.dp,
            vertical: 14.dp,
          ),
          fillColor: GGColors.transparent,
          errorHintBuilder: (p0) {
            return Container(
              margin: EdgeInsets.only(top: 10.dp),
              child: Text(
                p0,
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.error.color,
                  fontWeight: GGFontWeigh.regular,
                  height: 1.4,
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

extension _Action on CurrencyAppealSubmitPage {
  void _back() {
    Get.back<void>();
  }

  void _submit() {
    controller.submit();
  }
}
