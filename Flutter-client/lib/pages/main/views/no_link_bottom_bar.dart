import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class NoLinkBottomBar extends StatefulWidget {
  final int currentIndex;
  final Color? backgroundColor;
  final ValueChanged<int>? onTap;
  final ValueChanged<int>? onDoubleTap;
  final List<NoLinkBottomBarItem> items;
  final double height;
  final double width;
  final double topSpacing;
  final TextStyle? selectedLabelStyle;
  final TextStyle? unselectedLabelStyle;

  const NoLinkBottomBar({
    super.key,
    required this.items,
    required this.width,
    this.onTap,
    this.onDoubleTap,
    this.currentIndex = 0,
    this.topSpacing = 2.0,
    this.backgroundColor,
    this.selectedLabelStyle,
    this.unselectedLabelStyle,
    this.height = 44.0,
  }) : assert(0 <= currentIndex && currentIndex < items.length);

  @override
  State<NoLinkBottomBar> createState() => _NoLinkBottomBarState();
}

class _NoLinkBottomBarState extends State<NoLinkBottomBar> {
  late TextStyle selectedLabelStyle;
  late TextStyle unselectedLabelStyle;

  List<Widget> _createTiles(BuildContext context) {
    unselectedLabelStyle = widget.unselectedLabelStyle ?? const TextStyle();
    selectedLabelStyle = widget.selectedLabelStyle ?? unselectedLabelStyle;

    final List<Widget> tiles = <Widget>[];
    for (int i = 0; i < widget.items.length; i++) {
      tiles.add(Container(
        constraints:
            BoxConstraints(maxWidth: MediaQuery.of(context).size.width / 5),
        child: _BottomNavigationTile(
          widget.items[i],
          selectedLabelStyle: selectedLabelStyle,
          unselectedLabelStyle: unselectedLabelStyle,
          onTap: () => widget.onTap?.call(i),
          onDoubleTap: () => widget.onDoubleTap?.call(i),
          selected: widget.currentIndex == i,
        ),
      ));
    }
    return tiles;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: widget.backgroundColor ?? Colors.transparent,
        boxShadow: [
          BoxShadow(
            color: GGColors.shadow.color,
            offset: Offset(0, -3.dp),
            blurRadius: 6.dp,
          )
        ],
      ),
      width: widget.width,
      height: widget.height,
      padding: EdgeInsets.fromLTRB(0, widget.topSpacing, 0, 0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: _createTiles(context),
      ),
    );
  }
}

class _BottomNavigationTile extends StatelessWidget {
  final NoLinkBottomBarItem item;
  final VoidCallback? onTap;
  final VoidCallback? onDoubleTap;
  final bool selected;
  final TextStyle selectedLabelStyle;
  final TextStyle unselectedLabelStyle;

  const _BottomNavigationTile(
    this.item, {
    this.onTap,
    this.onDoubleTap,
    this.selected = false,
    required this.selectedLabelStyle,
    required this.unselectedLabelStyle,
  });

  @override
  Widget build(BuildContext context) {
    Widget activeIcon = item.activeIcon ?? item.icon;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        onDoubleTap: onDoubleTap,
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 10.dp),
          child: Column(
            children: [
              Stack(
                children: [
                  Offstage(
                    offstage: selected,
                    child: item.icon,
                  ),
                  Offstage(
                    offstage: !selected,
                    child: activeIcon,
                  ),
                ],
              ),
              Text(
                item.label,
                style: selected ? selectedLabelStyle : unselectedLabelStyle,
                overflow: TextOverflow.ellipsis,
              )
            ],
          ),
        ),
      ),
    );
  }
}

/// 配置类
class NoLinkBottomBarItem {
  final Widget icon;

  /// 没有配置则使用 icon
  final Widget? activeIcon;
  final String label;

  const NoLinkBottomBarItem({
    required this.label,
    required this.icon,
    this.activeIcon,
  });
}
