part of gaming_text_field;

class GamingBaseTextField extends StatelessWidget {
  const GamingBaseTextField({
    super.key,
    this.controller,
    this.focusNode,
    this.keyboardType = TextInputType.text,
    this.textInputAction = TextInputAction.done,
    this.autofocus = false,
    this.obscureText = false,
    this.maxLine = 1,
    this.minLine,
    this.maxLength,
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
    this.suffixIcon,
    this.prefixIconConstraints,
    this.suffixIconConstraints,
    this.border,
    this.focusedBorderColor,
    this.onSubmitted,
    this.showErrorHint = false,
    this.errorHint = '',
    this.errorHintBuilder,
    this.buildCounter,
  });

  final TextEditingController? controller;
  final FocusNode? focusNode;
  final TextInputType keyboardType;
  final TextInputAction textInputAction;
  final bool autofocus;
  final bool obscureText;
  final int? maxLength;
  final int? maxLine;
  final int? minLine;
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
  final Widget? suffixIcon;
  final BoxConstraints? prefixIconConstraints;
  final BoxConstraints? suffixIconConstraints;
  final InputBorder? border;
  final Color? focusedBorderColor;

  final void Function(String)? onSubmitted;

  final bool showErrorHint;
  final String errorHint;

  final Widget Function(String)? errorHintBuilder;

  final InputCounterWidgetBuilder? buildCounter;

  bool get showErrorBorder => showErrorHint && errorHint.isNotEmpty;

  @override
  Widget build(BuildContext context) {
    InputBorder border = this.border ??
        OutlineInputBorder(
          borderSide: BorderSide.none,
          borderRadius: BorderRadius.circular(4.dp),
        );
    if (enabled) {
      border = (this.border ??
          OutlineInputBorder(
            borderSide: BorderSide(
              color: GGColors.border.color,
              width: 1.dp,
            ),
            borderRadius: BorderRadius.circular(4.dp),
          ));
      border = border.copyWith(
        borderSide: border.borderSide.copyWith(
          color: showErrorBorder ? GGColors.error.color : null,
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Opacity(
          opacity: !enabled ? 0.8 : 1.0,
          child: TextField(
            controller: controller,
            focusNode: focusNode,
            autofocus: autofocus,
            keyboardType: keyboardType,
            textInputAction: textInputAction,
            scrollPadding: scrollPadding ??
                EdgeInsets.symmetric(horizontal: 16.dp, vertical: 16.dp),
            buildCounter: buildCounter ??
                (
                  context, {
                  required int currentLength,
                  required bool isFocused,
                  required int? maxLength,
                }) {
                  if (maxLength == null) {
                    return null;
                  }
                  return Transform.translate(
                    offset: Offset(contentPadding?.right ?? 0, 0),
                    child: Text(
                      '$currentLength/$maxLength',
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: const Color(0xFFB7BDC6),
                        fontFamily: GGFontFamily.dingPro,
                        fontWeight: GGFontWeigh.medium,
                      ),
                    ),
                  );
                },
            decoration: InputDecoration(
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 16.dp, vertical: 16.dp),
              filled: true,
              fillColor: Colors.transparent,
              border: border,
              enabledBorder: border,
              disabledBorder: border,
              focusedBorder: border.copyWith(
                borderSide: enabled
                    ? border.borderSide.copyWith(
                        color: focusedBorderColor ?? GGColors.brand.color,
                        // width: 1.dp,
                      )
                    : null,
              ),
              errorBorder: border,
              isDense: true,
            ).copyWith(
              hintStyle: GGTextStyle(
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.regular,
                color: GGColors.textHint.color,
              ).merge(hintStyle),
              hintText: hintText,
              contentPadding: contentPadding,
              fillColor: enabled ? fillColor?.color : GGColors.disabled.color,
              prefixIcon: prefixIcon,
              suffixIcon: suffixIcon,
              prefixIconConstraints: prefixIconConstraints,
              suffixIconConstraints: suffixIconConstraints,
            ),
            cursorColor: GGColors.brand.color,
            obscureText: obscureText,
            readOnly: readOnly,
            enabled: enabled,
            textAlign: textAlign,
            strutStyle: StrutStyle.fromTextStyle(
              GGTextStyle(
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.regular,
                color: enabled
                    ? GGColors.textMain.color
                    : GGColors.textSecond.color,
              ).merge(style),
              forceStrutHeight: true,
            ),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
              height: 1.44,
              color:
                  enabled ? GGColors.textMain.color : GGColors.textSecond.color,
            ).merge(style),
            inputFormatters: [
              FilteringTextInputFormatter.deny(GGRegExp.startWithSpace),
              ...inputFormatters
            ],
            maxLines: maxLine,
            minLines: minLine,
            maxLength: maxLength,
            onSubmitted: onSubmitted,
          ),
        ),
        if (showErrorBorder && enabled)
          if (errorHintBuilder != null)
            errorHintBuilder!.call(errorHint)
          else
            Text(
              errorHint,
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.error.color,
                fontWeight: GGFontWeigh.regular,
                height: 1.4,
              ),
            ),
      ],
    );
  }
}
