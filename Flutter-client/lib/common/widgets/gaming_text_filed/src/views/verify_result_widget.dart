part of gaming_text_field;

final List<Color> _defaultRuleLevelColors = [
  GGColors.error.color,
  const Color(0xFFFF944D),
  const Color(0xFFFFC44D),
  GGColors.success.color
];

mixin GamingVerifyLinkWidgetMixin {
  GamingTextFieldWithVerifyResultController get controller;

  Widget popupBuilder() {
    return GamingPopupView(
      link: controller.layerLink,
      followerAnchor: Alignment.topCenter,
      targetAnchor: Alignment.bottomCenter,
      contentPadding: EdgeInsets.symmetric(
        vertical: 8.dp,
        horizontal: 10.dp,
      ),
      child: GamingVerifyResultPopupView(
        controller: controller,
      ),
    );
  }

  void showRulePopup(BuildContext context) {
    if (!controller.isShowing) {
      controller.showPopup(
        builder: (context) {
          return popupBuilder();
        },
      );
    }
  }

  void hideRulePopup() {
    if (controller.isShowing) {
      controller.hidePopup();
    }
  }
}

class GamingVerifyLevelWidget extends StatelessWidget {
  const GamingVerifyLevelWidget({
    super.key,
    required this.controller,
  });

  final GamingTextFieldWithVerifyLevelController controller;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      return controller.text.isEmpty
          ? Gaps.empty
          : Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                GamingVerifyLinkWidget(
                  controller: controller,
                  targetAnchor: Alignment.bottomCenter,
                  followerAnchor: Alignment.topCenter,
                  child: _buildGradientLine(),
                ),
                Gaps.hGap2,
                _buildLevel(),
              ],
            );
    });
  }

  Widget _buildGradientLine() {
    return Row(
      children: List.generate(controller.detector.length, (index) {
        final level = controller.level;
        Color color = level > index && _defaultRuleLevelColors.length > index
            ? _defaultRuleLevelColors[index]
            : GGColors.border.color;
        return Expanded(
          child: Container(
            color: color,
            height: 4.dp,
          ),
        );
      }).toList(),
    );
  }

  Widget _buildLevel() {
    return Row(
      children: [
        const Spacer(),
        Text(
          controller.passLevelText(),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textSecond.color,
          ),
        ),
      ],
    );
  }
}

class GamingVerifyLinkWidget extends StatefulWidget {
  const GamingVerifyLinkWidget({
    super.key,
    required this.controller,
    required this.child,
    this.targetAnchor = Alignment.bottomRight,
    this.followerAnchor = Alignment.topRight,
    this.offset = Offset.zero,
    this.popColor,
    this.contentPadding,
    this.showWhenVisibilityLost = false,
  });

  final Offset offset;
  final Alignment targetAnchor;
  final Alignment followerAnchor;
  final Color? popColor;
  final EdgeInsetsGeometry? contentPadding;

  final GamingTextFieldWithVerifyResultController controller;
  final Widget child;

  /// 当看不到target时是否显示popup
  ///
  /// 默认为false，target看不到时，自动隐藏popup
  final bool showWhenVisibilityLost;

  @override
  State<GamingVerifyLinkWidget> createState() => _GamingVerifyLinkWidgetState();
}

class _GamingVerifyLinkWidgetState extends State<GamingVerifyLinkWidget>
    with GamingVerifyLinkWidgetMixin {
  @override
  GamingTextFieldWithVerifyResultController get controller => widget.controller;

  late final Worker? _worker;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
      _togglePopup();
    });
    _worker = everAll(
      [
        controller.text,
        controller.hasFocus,
      ],
      (v) {
        _togglePopup();
      },
    );
  }

  void _togglePopup() {
    if ((controller.text.value.isEmpty || !controller.hasFocus.value)) {
      hideRulePopup();
      return;
    }
    if (controller.text.isNotEmpty && controller.hasFocus.value) {
      showRulePopup(context);
    }
  }

  @override
  void dispose() {
    _worker?.dispose();
    super.dispose();
  }

  @override
  Widget popupBuilder() {
    return GamingPopupView(
      link: controller.layerLink,
      followerAnchor: widget.followerAnchor,
      targetAnchor: widget.targetAnchor,
      offset: widget.offset,
      popColor: widget.popColor ?? GGColors.popBackground.color,
      usePenetrate: true,
      contentPadding: widget.contentPadding ??
          EdgeInsets.symmetric(
            vertical: 8.dp,
            horizontal: 10.dp,
          ),
      child: GamingVerifyResultPopupView(
        controller: controller,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final target = CompositedTransformTarget(
      link: controller.layerLink,
      child: widget.child,
    );
    if (widget.showWhenVisibilityLost) {
      return target;
    }
    return FocusDetector(
      onVisibilityGained: () {
        if (controller.text.isNotEmpty && controller.hasFocus.value) {
          showRulePopup(context);
        }
      },
      onVisibilityLost: () {
        if (controller.isShowing) {
          hideRulePopup();
          return;
        }
      },
      child: target,
    );
  }
}

class GamingVerifyResultPopupView extends StatelessWidget {
  const GamingVerifyResultPopupView({
    super.key,
    required this.controller,
  });

  final GamingTextFieldWithVerifyResultController controller;

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => Container(
        constraints: BoxConstraints(maxWidth: 200.dp),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ...controller.validator.map(
              (e) {
                final isPass = e.validate(controller.text.value);
                return Padding(
                  padding: EdgeInsets.only(bottom: 7.dp),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        '* ',
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: GGColors.textSecond.color,
                        ),
                      ),
                      Flexible(
                        child: Text(
                          e.errorHint,
                          style: GGTextStyle(
                            fontSize: GGFontSize.hint,
                            color: GGColors.textSecond.color,
                          ),
                        ),
                      ),
                      Gaps.hGap4,
                      SizedBox(
                        width: 12.dp,
                        height: 12.dp,
                        child: SvgPicture.asset(
                          isPass ? R.iconVerifySuccessful : R.iconVerifyFailed,
                          width: 12.dp,
                          height: 12.dp,
                          color: isPass
                              ? GGColors.success.color
                              : GGColors.error.color,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ).toList(),
          ],
        ),
      ),
    );
  }
}
