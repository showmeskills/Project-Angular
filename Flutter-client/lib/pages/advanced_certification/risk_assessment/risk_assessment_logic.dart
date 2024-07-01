
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/risk_form/risk_form_api.dart';
// ignore_for_file: avoid_print

import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_currency_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/pages/advanced_certification/common/advanced_certification_util.dart';
import 'package:gogaming_app/common/api/risk_form/enum.dart';
import 'package:gogaming_app/pages/advanced_certification/common/views/advanced_certification_base_controller.dart';

part 'risk_assessment_state.dart';

class RiskAssessmentLogic extends AdvancedCertificationBaseController {
  RiskAssessmentLogic()
      : super(
          type: AdvancedCertificationType.riskAssessment,
        );

  final yearlyIncomeController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator.length(min: 1),
    ],
  );
  final companyNameController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator.length(min: 1),
    ],
  );

  final state = RiskAssessmentState();

  Worker? _worker;

  @override
  void onInit() {
    super.onInit();
    _worker = everAll([
      yearlyIncomeController.text,
      companyNameController.text,
      state._employStatus,
      state._assetSource,
    ], (v) {
      final enable = yearlyIncomeController.isPass &&
          state.employStatus != null &&
          state.assetSource != null;
      if (state.employStatus == EmployStatus.employment ||
          state.employStatus == EmployStatus.freelance) {
        state._enable.value = enable && companyNameController.isPass;
      } else {
        state._enable.value = enable;
      }
    });
  }

  @override
  void onClose() {
    _worker?.dispose();
    super.onClose();
  }

  void selectEmploymentStatus() {
    GamingSelector.simple<EmployStatus>(
      title: localized('select_employment_status'),
      original: EmployStatus.values,
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
        state._employStatus.value = value;
      }

      state._employStatusError.value =
          value == null && state.employStatus == null;
    });
  }

  void selectAssetsSource() {
    GamingSelector.simple<AssetSource>(
      title: localized('select_wealth_source'),
      original: AssetSource.values,
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
        state._assetSource.value = value;
      }
      state._assetSourceError.value =
          value == null && state.assetSource == null;
    });
  }

  void selectCurrency() {
    GamingCurrencySelector.show(
      isDigital: false,
      original: state.currencyList,
    ).then((value) {
      if (value != null) {
        state._currency.value = value;
      }
    });
  }

  void submit() {
    state._loading.value = true;

    _add().doOnData((event) {
      if (event) {
        // GlobalSetting.sharedInstance.updateRiskState().listen((event) {});
        AdvancedCertificationUtil.showRiskAssessmentResult(
          onConfirm: () {
            Get.back<void>();
          },
        );
      } else {
        Toast.showFailed(localized('risk_assessment_submit_failed'));
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
    return PGSpi(RiskFormApi.submitEdd.toTarget(
      inputData: {
        'monthlySalary': int.parse(yearlyIncomeController.text.value),
        'currency': state.currency.currency!,
        'employmentStatus': state.employStatus!.value,
        'occupation': companyNameController.text.value,
        'sourceOfFunds': state.assetSource!.value,
      },
    )).rxRequest<bool>((value) {
      return value['data'] as bool;
    }).flatMap((value) {
      return Stream.value(value.data);
    });
  }
}
