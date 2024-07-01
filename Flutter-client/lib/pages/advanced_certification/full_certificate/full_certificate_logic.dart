// ignore_for_file: invalid_use_of_protected_member

import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/risk_form/risk_form_api.dart';
import 'package:gogaming_app/common/widgets/attachment_upload/attachment_upload.dart';
import 'package:gogaming_app/common/widgets/attachment_upload/id_card_upload.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/video_upload/video_upload.dart';
import 'package:gogaming_app/config/global_setting.dart';
import 'package:gogaming_app/pages/advanced_certification/common/advanced_certification_util.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:gogaming_app/widget_header.dart';

part 'full_certificate_state.dart';

class FullCertificateLogic extends BaseController {
  late final idCardFrontController = IDCardUploadController(
    idCardType: IDCardType.front,
    pickMethod: [
      PickMethod.camera,
      PickMethod.gallery,
    ],
    onUpload: (p0) {
      state._idCardFront.value = p0.isEmpty ? null : p0.first;
    },
  );
  late final idCardBackController = IDCardUploadController(
    idCardType: IDCardType.back,
    pickMethod: [
      PickMethod.camera,
      PickMethod.gallery,
    ],
    onUpload: (p0) {
      state._idCardBack.value = p0.isEmpty ? null : p0.first;
    },
  );

  late final bankCardRecordController = AttachmentUploadController(
    type: 'Kyc',
    pickMethod: [
      PickMethod.camera,
      PickMethod.gallery,
    ],
    onUpload: (p0) {
      state._bankCardRecord.value = p0;
    },
  );

  late final cryptoWalletRecordController = AttachmentUploadController(
    type: 'Kyc',
    pickMethod: [
      PickMethod.camera,
      PickMethod.gallery,
    ],
    onUpload: (p0) {
      state._cryptoWalletRecord.value = p0;
    },
  );

  late final personalVideoController = VideoUploadController(
    type: 'Kyc',
    pickMethod: [
      PickMethod.camera,
      PickMethod.gallery,
    ],
    maxSize: 300 * 1000 * 1000,
    onUpload: (p0) {
      state._personalDeclarationVideo.value = p0.isEmpty ? null : p0.first;
    },
  );

  final state = FullCertificateState();

  void submit() {
    if (state.step < 2) {
      state._step.value += 1;
      return;
    }

    state._loading.value = true;

    _add().doOnData((event) {
      if (event) {
        GlobalSetting.sharedInstance.updateRiskState().listen((event) {});
        AdvancedCertificationUtil.showUploadSpecifiedFileResult();
      } else {
        Toast.showFailed(localized('upload_specified_file_submit_failed'));
      }
    }).doOnError((err, p1) {
      if (err is GoGamingResponse) {
        Toast.showFailed(err.message);
      } else {
        Toast.showTryLater();
      }
    }).doOnDone(() {
      state._loading.value = false;
    }).listen(null, onError: (p0, p1) {});
  }

  Stream<bool> _add() {
    return PGSpi(RiskFormApi.submitFullAudit.toTarget(
      inputData: {
        'frontsideImage': state._idCardFront.value,
        'backsideImage': state._idCardBack.value,
        'bankRecordImages': List<String>.from(state._bankCardRecord.value),
        'cryptoCurrencyRecordImages':
            List<String>.from(state._cryptoWalletRecord.value),
        'videoUrl': state.personalDeclarationVideo,
      },
    )).rxRequest<bool>((value) {
      return value['data'] as bool;
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }
}
