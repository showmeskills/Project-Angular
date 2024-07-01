import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/attachment_upload/attachment_upload.dart';
import 'package:gogaming_app/common/widgets/attachment_upload/id_card_upload.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/video_upload/video_upload.dart';
import 'package:gogaming_app/pages/advanced_certification/common/views/advanced_certification_base_view.dart';
import 'package:gogaming_app/pages/advanced_certification/full_certificate/full_certificate_logic.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

part 'views/_id_card_view.dart';
part 'views/_transaction_record_view.dart';
part 'views/_personal_declaration_view.dart';

class FullCertificatePage
    extends AdvancedCertificationBaseView<FullCertificateLogic> {
  const FullCertificatePage({
    super.key,
  });

  FullCertificateState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const FullCertificatePage(),
    );
  }

  @override
  Widget buildContent(BuildContext context) {
    Get.put(FullCertificateLogic());
    return Obx(() {
      if (state.step == 0) {
        return const _IDCardView();
      } else if (state.step == 1) {
        return const _TransactionRecordView();
      } else {
        return const _PersonalDeclarationView();
      }
    });
  }

  @override
  Widget buildSubmitButton() {
    return Obx(() {
      return GGButton.main(
        enable: state.enable,
        onPressed: controller.submit,
        text: localized('continue'),
      );
    });
  }

  @override
  Widget buildTitle() {
    return Obx(() {
      return super.buildTitle();
    });
  }

  @override
  String get subTitle {
    if (state.step == 0) {
      return localized('upload_id_card');
    } else if (state.step == 1) {
      return localized('transaction_record_screenshot');
    } else {
      return localized('personal_declaration_video');
    }
  }

  @override
  String get title => localized('upload_specified_file');
}
