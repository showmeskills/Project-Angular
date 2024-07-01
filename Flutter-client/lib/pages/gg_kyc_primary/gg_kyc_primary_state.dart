import 'package:base_framework/base_controller.dart';
import 'package:base_framework/src.widget/kyc_date_input_widget.dart';
import 'package:gogaming_app/common/components/extensions/gg_reg_exp.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/country_service.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/pages/register/check_phone_logic.dart';

class GGKycPrimaryState {
  GGKycPrimaryState() {
    updateNameController();
  }

  /// 用户姓名
  final nameController = GamingTextFieldController().obs;

  /// 姓输入框
  final firstNameController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.nameRule,
        errorHint: localized('enter_first_name'),
      ),
    ],
  ).obs;

  /// 名输入框
  final lastNameController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.nameRule,
        errorHint: localized('enter_last_name'),
      ),
    ],
  ).obs;

  /// 手机号
  late final GamingTextFieldController phoneController = () {
    final textController = GamingTextFieldController();
    if (!isNotBindPhone) {
      textController.textController.text =
          AccountService.sharedInstance.gamingUser?.mobile ?? '';
    }
    return textController;
  }();

  /// 手机验证码
  GamingTextFieldController codeController = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator.length(
        min: 6,
      )
    ],
  );
  final phoneCodeState = PhoneCodeState.unSend.obs;
  final isVerifyLoading = false.obs;

  /// 是否满足基础认证的条件
  final continueEnable = false.obs;
  final birthday = ''.obs;
  KycDateInputController dateInputController = KycDateInputController();
  final showDateError = false.obs;

  late DateTime selectedDate = defaultTime();

  DateTime defaultTime() {
    final date = DateTime.now();
    return DateTime(date.year - 18, date.month, date.day);
  }

  late final currentCountry = () {
    var country = CountryService.sharedInstance.currentCountry;
    if (!isNotBindPhone) {
      final areaCode = AccountService.sharedInstance.gamingUser?.areaCode;
      final bindCountry = CountryService.sharedInstance.countryList
          .firstWhereOrNull((element) => element.areaCode == areaCode);
      if (bindCountry != null) country = bindCountry;
    }
    return country.obs;
  }();

  /// 邮箱
  late final GamingTextFieldController email = GamingTextFieldController(
    obscureText: false,
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.emailRule,
        errorHint: localized('email_err'),
      ),
    ],
  );

  /// 邮编
  late final GamingTextFieldController postCode = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.notEmpty,
        errorHint: '',
      ),
    ],
  );

  /// 城市
  late final GamingTextFieldController city = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.notEmpty,
        errorHint: '',
      ),
    ],
  );

  /// 地址
  late final GamingTextFieldController address = GamingTextFieldController(
    validator: [
      GamingTextFieldValidator(
        reg: GGRegExp.notEmpty,
        errorHint: localized('sen_dj'),
      ),
    ],
  );

  bool get isNotBindPhone =>
      AccountService.sharedInstance.gamingUser?.isBindMobile != true;

  bool get isNotBindEmail =>
      AccountService.sharedInstance.gamingUser?.isBindEmail != true;

  void updateNameController() {
    final country = currentCountry.value;
    var rule = GGRegExp.nameRule;
    if (country.isChina) {
      rule = GGRegExp.china;
    } else if (country.isTha) {
      rule = GGRegExp.thai;
    } else if (country.isVnm) {
      rule = GGRegExp.vnm;
    }
    nameController(GamingTextFieldController(
      validator: [
        GamingTextFieldValidator.length(
          min: 2,
          errorHint: localized('required_msg'),
        ),
        GamingTextFieldValidator(
          reg: rule,
          errorHint: localized('fill_again'),
        ),
      ],
    ));
  }
}
