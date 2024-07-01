part of gaming_text_field;

abstract class IGamingTextFieldValidator {
  final String errorHint;

  IGamingTextFieldValidator([this.errorHint = '']);

  bool validate(String value);

  String regPattern() => "";
}

class GamingTextFieldValidator extends IGamingTextFieldValidator {
  final RegExp reg;

  GamingTextFieldValidator({
    required this.reg,
    String errorHint = '',
  }) : super(errorHint);

  @override
  bool validate(String value) {
    return reg.hasMatch(value);
  }

  @override
  String regPattern() {
    return reg.pattern;
  }

  static List<GamingTextFieldValidator> userNameRules() {
    return [
      GamingTextFieldValidator(
        reg: RegExp(r'^[\s\S]{6,18}$'),
        errorHint: localized('length_error'),
      ),
      GamingTextFieldValidator(
        reg: RegExp(r'^[a-zA-Z]'),
        errorHint: localized('letter_error'),
      ),
      GamingTextFieldValidator(
        reg: RegExp(r'^[_a-zA-Z0-9]{1,}$'),
        errorHint: localized('contain_error'),
      ),
    ];
  }

  static List<GamingTextFieldValidator> passwordRules() {
    return [
      GamingTextFieldValidator.length(
        min: 8,
        max: 20,
        errorHint: localized('pwd_length_error'),
      ),
      GamingTextFieldValidator.number(localized('pwd_digit_error')),
      GamingTextFieldValidator.upperChar(
          localized('pwd_uppercase_letter_error')),
    ];
  }

  factory GamingTextFieldValidator.number([String errorHint = '']) {
    return GamingTextFieldValidator(
      reg: RegExp(r'[0-9]{1,}'),
      errorHint: errorHint,
    );
  }

  factory GamingTextFieldValidator.upperChar([String errorHint = '']) {
    return GamingTextFieldValidator(
      reg: RegExp(r'[A-Z]{1,}'),
      errorHint: errorHint,
    );
  }

  factory GamingTextFieldValidator.lowerChar([String errorHint = '']) {
    return GamingTextFieldValidator(
      reg: RegExp(r'[a-z]{1,}'),
      errorHint: errorHint,
    );
  }

  factory GamingTextFieldValidator.specialChar([String errorHint = '']) {
    return GamingTextFieldValidator(
      reg: RegExp(r'([^A-Za-z0-9]){1,}'),
      errorHint: errorHint,
    );
  }

  factory GamingTextFieldValidator.length({
    required int min,
    int? max,
    String errorHint = '',
  }) {
    final RegExp reg = max != null
        ? RegExp(r'^[\s\S]{' + min.toString() + r',' + max.toString() + r'}$')
        : RegExp(r'^[\s\S]{' + min.toString() + r',}$');
    return GamingTextFieldValidator(
      reg: reg,
      errorHint: errorHint,
    );
  }
}

class GamingTextFieldAmountValidator extends IGamingTextFieldValidator {
  GamingTextFieldAmountValidator({
    required this.min,
    this.max,
    String errorHint = '',
  }) : super(errorHint);

  final double min;
  final double? max;

  @override
  bool validate(String value) {
    final amount = double.tryParse(value) ?? 0;
    return amount >= min && (max != null ? amount <= max! : true);
  }
}

class GamingTextFieldCustomValidator extends IGamingTextFieldValidator {
  GamingTextFieldCustomValidator({
    bool isPass = false,
    String errorHint = '',
  })  : isPass = isPass.obs,
        super(errorHint);

  final RxBool isPass;

  @override
  bool validate(String value) {
    return isPass.value;
  }
}
