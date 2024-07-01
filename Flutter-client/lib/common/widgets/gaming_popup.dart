import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/painting/triangle_painter.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingPopupLinkWidget extends StatefulWidget {
  const GamingPopupLinkWidget({
    super.key,
    this.targetAnchor = Alignment.bottomRight,
    this.followerAnchor = Alignment.bottomRight,
    required this.child,
    this.popup,
    this.offset = Offset.zero,
    this.onDismiss,
    this.popColor,
    this.triangleInset,
    this.triangleSize,
    this.contentPadding,
    this.overlay,
    this.usePenetrate = false,
    this.showWhenVisibilityLost = true,
  });

  final GamingOverlay? overlay;
  final Offset offset;
  final Alignment targetAnchor;
  final Alignment followerAnchor;
  final void Function()? onDismiss;
  final Color? popColor;
  final EdgeInsetsGeometry? triangleInset;
  final Size? triangleSize;
  final EdgeInsetsGeometry? contentPadding;
  final Widget child;
  final Widget? popup;
  final bool usePenetrate;

  /// 当看不到target时是否显示popup
  ///
  /// 默认为false，target看不到时，自动隐藏popup
  final bool showWhenVisibilityLost;

  @override
  State<GamingPopupLinkWidget> createState() => _GamingPopupLinkWidgetState();
}

class _GamingPopupLinkWidgetState extends State<GamingPopupLinkWidget> {
  late final GamingOverlay _overlay = widget.overlay ?? GamingOverlay();
  GamingOverlay get overlay => _overlay;

  @override
  Widget build(BuildContext context) {
    final target = CompositedTransformTarget(
      link: overlay.layerLink,
      child: widget.child,
    );
    late Widget child;
    if (widget.showWhenVisibilityLost) {
      child = target;
    } else {
      child = FocusDetector(
        onVisibilityGained: () {
          showPopup();
        },
        onVisibilityLost: () {
          hidePopup();
        },
        child: target,
      );
    }

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () {
        showPopup();
      },
      child: child,
    );
  }

  void hidePopup() {
    overlay.hide();
  }

  void showPopup() {
    if (widget.popup == null) {
      return;
    }
    overlay.show(builder: (context) {
      return GamingPopupView(
        link: overlay.layerLink,
        followerAnchor: widget.followerAnchor,
        targetAnchor: widget.targetAnchor,
        offset: widget.offset,
        popColor: widget.popColor ?? GGColors.popupBackground.color,
        contentPadding: widget.contentPadding,
        triangleSize: widget.triangleSize,
        triangleInset:
            widget.triangleInset ?? const EdgeInsetsDirectional.only(end: 10),
        onDismiss: widget.onDismiss ?? () => overlay.hide(),
        usePenetrate: widget.usePenetrate,
        child: widget.popup!,
      );
    });
  }
}

class GamingPopupView extends StatelessWidget {
  const GamingPopupView({
    super.key,
    required this.link,
    this.offset = Offset.zero,
    this.targetAnchor = Alignment.bottomRight,
    this.followerAnchor = Alignment.bottomRight,
    this.onDismiss,
    this.popColor,
    this.triangleInset,
    this.contentPadding,
    required this.child,
    Size? triangleSize,
    this.customChild,
    this.usePenetrate = false,
  }) : triangleSize = triangleSize ?? const Size(10, 6);

  final LayerLink link;
  final Offset offset;
  final Alignment targetAnchor;
  final Alignment followerAnchor;
  final void Function()? onDismiss;
  final Color? popColor;
  final EdgeInsetsGeometry? triangleInset;
  final Size triangleSize;
  final bool usePenetrate;

  Color get defaultPopColor => GGColors.popupBackground.color;
  final EdgeInsetsGeometry? contentPadding;
  final Widget child;
  final Widget? customChild;

  bool get showArrow => triangleSize != Size.zero;

  bool triangleBottom() => followerAnchor.y > 0;

  bool triangleTop() => followerAnchor.y < 0;

  bool triangleLeft() => followerAnchor.y == 0 && followerAnchor.x < 0;

  bool triangleRight() => followerAnchor.y == 0 && followerAnchor.x > 0;

  @override
  Widget build(BuildContext context) {
    bool isVertical = triangleTop() || triangleBottom();
    return _buildTapWidget(
      child: SafeArea(
        child: UnconstrainedBox(
          child: CompositedTransformFollower(
            link: link,
            offset: offset,
            targetAnchor: targetAnchor,
            followerAnchor: followerAnchor,
            showWhenUnlinked: false,
            child: Material(
              color: Colors.transparent,
              child: customChild ??
                  IntrinsicWidth(
                    child: isVertical
                        ? Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              if (triangleTop() && showArrow) _buildTriangle(),
                              _buildBackContent(),
                              if (triangleBottom() && showArrow)
                                _buildTriangle(),
                            ],
                          )
                        : Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              if (triangleLeft()) _buildTriangle(),
                              _buildBackContent(),
                              if (triangleRight()) _buildTriangle(),
                            ],
                          ),
                  ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTapWidget({
    required Widget child,
  }) {
    if (usePenetrate) {
      return Listener(
        onPointerUp: (_) => onDismiss?.call(),
        behavior: HitTestBehavior.translucent,
        child: child,
      );
    } else {
      return GestureDetector(
        onTap: () => onDismiss?.call(),
        // behavior: HitTestBehavior.translucent,
        behavior: HitTestBehavior.opaque,
        child: child,
      );
    }
  }

  Widget _buildBackContent() {
    return Material(
      color: popColor ?? defaultPopColor,
      borderRadius: BorderRadius.circular(4.dp),
      child: Container(
        padding: contentPadding ??
            EdgeInsets.symmetric(vertical: 8.dp, horizontal: 16.dp),
        child: child,
      ),
    );
  }

  Widget _buildTriangle() {
    if (triangleSize == Size.zero) {
      return Container();
    }
    bool isVertical = triangleTop() || triangleBottom();

    double turns = 0;
    if (triangleTop()) turns = 0.5;
    Size size = triangleSize;
    if (isVertical) {
      return Container(
        width: double.infinity,
        // height:  null,
        padding: triangleInset,
        alignment: followerAnchor,
        child: RotationTransition(
          turns: AlwaysStoppedAnimation(turns),
          child: trianglePic(size),
        ),
      );
    }

    TriangleDirection direction = TriangleDirection.bottom;
    if (triangleTop()) direction = TriangleDirection.top;
    if (triangleLeft()) direction = TriangleDirection.left;
    if (triangleRight()) direction = TriangleDirection.right;
    return Container(
      padding: triangleInset,
      alignment: followerAnchor,
      child: CustomPaint(
        size: size,
        painter: TrianglePainter(
          color: popColor ?? defaultPopColor,
          direction: direction,
        ),
      ),
    );
  }

  SvgPicture trianglePic(Size size) => SvgPicture.asset(
        R.iconTriangle,
        width: size.width,
        height: size.height,
        color: popColor ?? defaultPopColor,
        fit: BoxFit.fill,
      );
}
