part of gaming_text_field;

class GamingTextFieldController {
  GamingTextFieldController({
    bool obscureText = false,
    this.onChanged,
    this.onFocus,
    this.validator = const [],
    bool showClearIcon = true,
  })  : _obscureText = obscureText.obs,
        _showClearIcon = showClearIcon {
    textController.addListener(() {
      final isChange = text.value != textController.text;
      if (isChange) {
        _isPass.value = _getIsPass(textController.text);
        text.value = textController.text;
      }
      if (isPass == true) {
        _showErrorHint.value = false;
      }
      if (isChange) onChanged?.call(text.value);
    });

    focusNode.addListener(_focusListener);
  }

  final TextEditingController textController = TextEditingController();
  final FocusNode focusNode = FocusNode();
  final text = "".obs;
  final hasFocus = false.obs;
  final _isLeaveFocus = false.obs;
  final errorHint = "".obs;

  List<IGamingTextFieldValidator> validator;
  final RxBool _obscureText;
  RxBool get obscureText => _obscureText;
  final void Function(String text)? onChanged;
  final void Function(bool hasFocus)? onFocus;

  final RxBool _showErrorHint = false.obs;
  final bool _showClearIcon;
  bool get showClearIcon =>
      _showClearIcon && hasFocus.value && text.value.isNotEmpty;

  bool get isNotEmpty => text.value.isNotEmpty;

  final _isPass = false.obs;

  bool _getIsPass(String input) {
    for (final v in validator) {
      if (!v.validate(input)) {
        errorHint.value = v.errorHint;
        return false;
      }
    }
    return true;
  }

  bool get isPass => _isPass.value;

  bool get showErrorHint =>
      ((_isLeaveFocus.value || isNotEmpty) && !isPass) ||
      _showErrorHint.value == true;

  /// 手动添加错误提示
  void addFieldError({bool showErrorHint = true, String? hint}) {
    _showErrorHint.value = showErrorHint;
    if (hint?.isEmpty == true) {
      errorHint.value = validator.last.errorHint;
    } else if (hint is String && hint != errorHint.value) {
      /// 判断和之前输入的内容是否一致，如果不一致则不刷新，防止 iOS 机器上闪烁
      errorHint.value = hint;
    }
  }

  /// 检验资料
  void checkTextValid() {
    _showErrorHint.value = isPass == false;
  }

  void dispose() {
    focusNode.removeListener(_focusListener);
    textController.dispose();
    focusNode.dispose();
    text.close();
    hasFocus.close();
    _obscureText.close();
    _isLeaveFocus.close();
  }

  void reverseObscure() {
    _obscureText.value = !_obscureText.value;
  }

  void _focusListener() {
    _isLeaveFocus.value = hasFocus.value && !focusNode.hasFocus;
    hasFocus.value = focusNode.hasFocus;
    onFocus?.call(hasFocus.value);
  }
}

class GamingTextFieldWithVerifyResultController
    extends GamingTextFieldController with GamingOverlayMixin {
  GamingTextFieldWithVerifyResultController({
    bool obscureText = false,
    final void Function(String text)? onChanged,
    final void Function(bool hasFocus)? onFocus,
    List<IGamingTextFieldValidator> validator = const [],
  }) : super(
          obscureText: obscureText,
          onChanged: onChanged,
          onFocus: onFocus,
          validator: validator,
        );

  // @override
  // bool get showErrorHint => false;
}

mixin _GmingVerifyLevelMixin {
  List<IGamingTextFieldValidator> get detector;

  int get level;
}

class GamingTextFieldWithVerifyLevelController
    extends GamingTextFieldWithVerifyResultController
    with _GmingVerifyLevelMixin {
  GamingTextFieldWithVerifyLevelController({
    bool obscureText = false,
    final void Function(String text)? onChanged,
    final void Function(bool hasFocus)? onFocus,
    List<IGamingTextFieldValidator> validator = const [],
    this.detector = const [],
  }) : super(
          obscureText: obscureText,
          onChanged: onChanged,
          onFocus: onFocus,
          validator: validator,
        );

  @override
  final List<IGamingTextFieldValidator> detector;

  @override
  int get level {
    var result = 0;

    for (var element in detector) {
      if (element.validate(text.value)) {
        result += 1;
      }
    }

    return result;
  }

  String passLevelText() {
    const texts = ['', 'weak', 'medium', 'strong', 'extremely_strong'];
    if (level >= texts.length) {
      return '';
    } else {
      return localized(texts[level]);
    }
  }
}
