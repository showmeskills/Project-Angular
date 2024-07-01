import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/common/api/risk_form/enum.dart';

abstract class AdvancedCertificationBaseController extends BaseController {
  final AdvancedCertificationType type;

  AdvancedCertificationBaseController({
    required this.type,
  });
}
