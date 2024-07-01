import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/kyc/kyc.dart';
import 'package:gogaming_app/common/api/risk_form/risk_form_api.dart';

// ignore_for_file: avoid_print

import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/common/widgets/attachment_upload/attachment_upload.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_wealth_source_selector.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/api/risk_form/enum.dart';
import 'package:gogaming_app/pages/advanced_certification/common/views/advanced_certification_base_controller.dart';
import 'package:iovation_flutter/iovation_flutter.dart';

part 'wealth_source_certificate_state.dart';

class WealthSourceCertificateLogic extends AdvancedCertificationBaseController {
  WealthSourceCertificateLogic([this.id])
      : super(
          type: AdvancedCertificationType.wealthSource,
        );

  final int? id;

  final state = WealthSourceCertificateState();

  void selectQuota() {
    GamingSelector.simple<Quota>(
      title: localized('select_quota'),
      original: Quota.values,
      fixedHeight: false,
      itemBuilder: (context, e, index) {
        return GamingSelectorItem(
          text: e.text,
          onPressed: () {
            Get.back(result: e);
          },
        );
      },
    ).then((value) {
      if (value != null) {
        state._quota.value = value;
      }
      state._quotaError.value = value == null && state.quota == null;
    });
  }

  void selectWealthSource() {
    GamingWealthSourceSelector.show(
      selected: state.wealthSource,
    ).then((value) {
      if (value != null) {
        state._wealthSource.value = value;
      }
    });
  }

  void toggleStatement() {
    state._statement.value = !state.statement;
  }

  void submit() {
    state._loading.value = true;
    late Stream<bool> api;
    if (id != null) {
      api = _supplement();
    } else {
      api = _add();
    }
    api.doOnData((event) {
      if (event) {
        // GlobalSetting.sharedInstance.updateRiskState().listen((event) {});
        Get.back<void>();
        KycService.sharedInstance.showReviewDialog();
      } else {
        Toast.showFailed(localized('wealth_source_submit_failed'));
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
    return IovationFlutter.getBlackBox().asStream().flatMap((blackBox) {
      return PGSpi(Kyc.kycAdvancedForEu.toTarget(
        inputData: {
          'moneySources': state.wealthSource.map((e) => e.value).toList(),
          "iovationBlackbox": blackBox,
          ..._uploadRequestJson(),
        },
      )).rxRequest<bool>((value) {
        return value['data'] as bool;
      }).flatMap((value) {
        return Stream.value(value.data);
      });
    });
  }

  Stream<bool> _supplement() {
    return PGSpi(RiskFormApi.uploadsow.toTarget(
      inputData: {
        'id': id!,
        'moneySources': state.wealthSource.map((e) => e.value).toList(),
        ..._uploadRequestJson(),
      },
    )).rxRequest<bool>((value) {
      return value['data'] as bool;
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }

  Map<String, dynamic> _uploadRequestJson() {
    return {
      for (var e in state.wealthSource)
        e.requestKey: state.controllers[e]!.attachments
    };
  }
}
