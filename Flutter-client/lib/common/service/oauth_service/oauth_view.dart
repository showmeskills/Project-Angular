part of oauth_service;

class OAuthView extends StatelessWidget {
  const OAuthView({
    super.key,
    required this.onPressed,
  });

  final void Function(OAuth) onPressed;

  @override
  Widget build(BuildContext context) {
    if (OAuthService.sharedInstance.method.isEmpty) {
      return Gaps.empty;
    }
    return Column(
      children: [
        Container(
          padding: EdgeInsets.symmetric(vertical: 25.dp),
          child: Row(
            children: [
              Expanded(
                child: Divider(
                  color: GGColors.border.color,
                  height: 1.dp,
                  thickness: 1.dp,
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 28.dp),
                child: Text(
                  localized('other_login'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.smallTitle,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
              Expanded(
                child: Divider(
                  color: GGColors.border.color,
                  height: 1.dp,
                  thickness: 1.dp,
                ),
              ),
            ],
          ),
        ),
        _buildMethod(),
      ],
    );
  }

  Widget _buildMethod() {
    return LayoutBuilder(builder: (context, constraints) {
      final width = ((constraints.maxWidth - 10.dp * 3) ~/ 4).toDouble();
      return Wrap(
        spacing: 10.dp,
        runSpacing: 10.dp,
        children: OAuthService.sharedInstance.method.map((e) {
          return _buildMethodItem(e, width);
        }).toList(),
      );
    });
  }

  Widget _buildMethodItem(OAuth value, double width) {
    return ScaleTap(
      onPressed: () => onPressed(value),
      child: Container(
        height: 40.dp,
        width: width,
        decoration: BoxDecoration(
          // TODO(lucky): 颜色对不上
          color: GGColors.popBackground.color,
          borderRadius: BorderRadius.circular(4.dp),
        ),
        alignment: Alignment.center,
        child: SvgPicture.asset(
          value.iconUrl,
          width: 20.dp,
          height: 20.dp,
        ),
      ),
    );
  }
}
