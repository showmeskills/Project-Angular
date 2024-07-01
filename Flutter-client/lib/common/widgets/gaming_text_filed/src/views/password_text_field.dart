part of gaming_text_field;

class GamingPasswordTextField extends StatelessWidget {
  const GamingPasswordTextField({
    super.key,
    required this.controller,
    this.textInputAction = TextInputAction.done,
    this.autofocus = false,
    this.enabled = true,
    this.readOnly = false,
    this.inputFormatters = const [],
    this.hintText,
    this.hintStyle,
    this.style,
    this.textAlign = TextAlign.start,
    this.fillColor,
    this.contentPadding,
    this.scrollPadding,
    this.prefixIcon,
    this.prefixIconConstraints,
    this.border,
    this.onSubmitted,
  });

  final GamingTextFieldController controller;
  final TextInputAction textInputAction;
  final bool autofocus;
  final bool enabled;
  final bool readOnly;
  final List<TextInputFormatter> inputFormatters;
  final String? hintText;
  final GGTextStyle? hintStyle;
  final GGTextStyle? style;
  final TextAlign textAlign;
  final GGColors? fillColor;
  final EdgeInsets? contentPadding;
  final EdgeInsets? scrollPadding;
  final Widget? prefixIcon;
  final BoxConstraints? prefixIconConstraints;
  final InputBorder? border;
  final void Function(String)? onSubmitted;

  bool get showClearIcon => controller.showClearIcon && !readOnly && enabled;

  @override
  Widget build(BuildContext context) {
    // ignore: no_leading_underscores_for_local_identifiers
    final _contentPadding = contentPadding ?? EdgeInsets.all(16.dp);
    return Obx(
      () => GamingBaseTextField(
        controller: controller.textController,
        focusNode: controller.focusNode,
        keyboardType: TextInputType.visiblePassword,
        textInputAction: textInputAction,
        autofocus: autofocus,
        obscureText: controller.obscureText.value,
        maxLine: 1,
        readOnly: readOnly,
        enabled: enabled,
        inputFormatters: [
          FilteringTextInputFormatter.deny(RegExp(
            r"[\u4E00-\u9FFF]",
            unicode: true,
            caseSensitive: false,
          )),
          ...inputFormatters,
        ],
        hintText: hintText,
        hintStyle: hintStyle,
        style: style,
        textAlign: textAlign,
        fillColor: fillColor,
        contentPadding: _contentPadding,
        scrollPadding: scrollPadding,
        prefixIcon: prefixIcon,
        suffixIcon: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            if (showClearIcon)
              GamingTextFieldIcon(
                icon: R.iconCancel,
                onPressed: () => controller.textController.clear(),
              ),
            if (enabled != false)
              GamingTextFieldIcon(
                icon: controller.obscureText.value
                    ? R.iconVisibilityOff
                    : R.iconVisibility,
                onPressed: () => controller.reverseObscure(),
              ),
            _contentPadding.right == 0
                ? Gaps.empty
                : SizedBox(width: _contentPadding.right),
          ],
        ),
        prefixIconConstraints: prefixIconConstraints,
        suffixIconConstraints: BoxConstraints.tightFor(
          // width: (showClearIcon ? 24.dp : 0.dp) +
          //     (enabled != false ? 24.dp : 0.dp) +
          //     16.dp,
          height: 40.dp,
        ),
        border: border,
        onSubmitted: onSubmitted,
        showErrorHint: controller.showErrorHint,
        errorHint: controller.errorHint.value,
      ),
    );
  }
}
