part of gaming_text_field;

class GamingTextFieldIcon extends StatelessWidget {
  const GamingTextFieldIcon({
    super.key,
    required this.icon,
    this.iconSize,
    this.padding,
    this.onPressed,
    this.iconColor,
  });

  final Color? iconColor;
  final String icon;
  final void Function()? onPressed;
  final EdgeInsetsGeometry? padding;
  final double? iconSize;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onPressed,
      child: Container(
        height: double.infinity,
        padding: padding ?? EdgeInsetsDirectional.only(start: 10.dp),
        child: SvgPicture.asset(
          icon,
          color: iconColor ?? GGColors.textSecond.color,
          width: iconSize ?? 16.dp,
          height: iconSize ?? 16.dp,
        ),
      ),
    );
  }
}
