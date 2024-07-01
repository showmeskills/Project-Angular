part of gaming_text_field;

class GamingTextField extends StatelessWidget {
  const GamingTextField({
    super.key,
    required this.controller,
    this.keyboardType = TextInputType.text,
    this.textInputAction = TextInputAction.done,
    this.autofocus = false,
    this.maxLine,
    this.minLine,
    this.maxLength,
    this.enabled = true,
    this.readOnly = false,
    this.dismissClearIcon = false,
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
    this.suffixIcon,
    this.border,
    this.focusedBorderColor,
    this.onSubmitted,
    this.errorHintBuilder,
    this.buildCounter,
  });

  final GamingTextFieldController controller;
  final TextInputType keyboardType;
  final TextInputAction textInputAction;
  final bool autofocus;
  final int? maxLine;
  final int? minLine;
  final int? maxLength;
  final bool enabled;
  final bool readOnly;
  final bool dismissClearIcon;
  final List<TextInputFormatter> inputFormatters;
  final String? hintText;
  final GGTextStyle? hintStyle;
  final GGTextStyle? style;
  final TextAlign textAlign;
  final GGColors? fillColor;
  final EdgeInsets? contentPadding;
  final EdgeInsets? scrollPadding;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final BoxConstraints? prefixIconConstraints;
  final InputBorder? border;
  final Color? focusedBorderColor;
  final void Function(String)? onSubmitted;
  final Widget Function(String)? errorHintBuilder;

  final InputCounterWidgetBuilder? buildCounter;

  bool get showClearIcon =>
      controller.showClearIcon && !readOnly && enabled && !dismissClearIcon;

  @override
  Widget build(BuildContext context) {
    // ignore: no_leading_underscores_for_local_identifiers
    final _contentPadding = contentPadding ?? EdgeInsets.all(16.dp);
    return Obx(
      () => GamingBaseTextField(
        controller: controller.textController,
        focusNode: controller.focusNode,
        keyboardType: keyboardType,
        textInputAction: textInputAction,
        autofocus: autofocus,
        obscureText: controller.obscureText.value,
        maxLine: controller.obscureText.value ? 1 : maxLine,
        minLine: minLine,
        maxLength: maxLength,
        readOnly: readOnly,
        enabled: enabled,
        inputFormatters: inputFormatters,
        hintText: hintText,
        hintStyle: hintStyle,
        style: style,
        textAlign: textAlign,
        fillColor: fillColor,
        contentPadding: _contentPadding,
        scrollPadding: scrollPadding,
        buildCounter: buildCounter,
        prefixIcon: prefixIcon != null
            ? Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  prefixIcon!,
                ],
              )
            : null,
        suffixIcon: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            if (showClearIcon)
              GamingTextFieldIcon(
                icon: R.iconCancel,
                onPressed: () => controller.textController.clear(),
              ),
            suffixIcon ?? Gaps.empty,
            SizedBox(width: _contentPadding.right),
          ],
        ),
        prefixIconConstraints: prefixIconConstraints,
        suffixIconConstraints: BoxConstraints.tightFor(
          // width: (showClearIcon ? 24.dp : 0.dp) + 16.dp,
          height: 40.dp,
        ),
        border: border,
        focusedBorderColor: focusedBorderColor,
        onSubmitted: onSubmitted,
        showErrorHint: controller.showErrorHint,
        errorHint: controller.errorHint.value,
        errorHintBuilder: errorHintBuilder,
      ),
    );
  }
}
