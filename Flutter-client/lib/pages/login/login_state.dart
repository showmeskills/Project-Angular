import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/service/country_service.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';

import '../../common/components/extensions/gg_reg_exp.dart';
import '../../common/lang/locale_lang.dart';

class LoginState {
  /// 默认国家
  GamingCountryModel country = CountryService.sharedInstance.currentCountry;

  late GamingTextFieldController accountPassword = GamingTextFieldController(
    obscureText: true,
    validator: passwordRules(),
  );
  late final GamingTextFieldController account = GamingTextFieldController(
    obscureText: false,
    validator: [
      GamingTextFieldValidator(reg: RegExp(r'^[\s\S]{0,18}$')),
    ],
  );

  /// 邮箱登录
  late GamingTextFieldController emailPassword = GamingTextFieldController(
    obscureText: true,
    validator: passwordRules(),
  );
  late final GamingTextFieldController email = GamingTextFieldController(
    obscureText: false,
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.emailRule,
        errorHint: localized('email_err'),
      ),
    ],
  );

  late GamingTextFieldController mobilePassword = GamingTextFieldController(
    obscureText: true,
    validator: passwordRules(),
  );
  late final GamingTextFieldController mobile = GamingTextFieldController();

  final numberRule = RegExp(r'[0-9]{1,}');
  final upperCharRule = RegExp(r'[A-Z]{1,}');
  final lengthRule = RegExp(r'^[\S]{8,20}$');

  List<GamingTextFieldValidator> passwordRules() {
    return [
      GamingTextFieldValidator(reg: RegExp(r'^[\s\S]{1,}$')),
    ];
  }

  final isEnableLogin = false.obs;
  final offsetY = 0.0.obs;
}
