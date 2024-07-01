import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';

final normalValueStyle = GGTextStyle(
  fontSize: GGFontSize.content,
  color: GGColors.textMain.color,
);

/// 订单详情单行布局数据
class GameOrderDetailValueLayout {
  final String name;
  final String value;
  final String? valueIcon;
  GGTextStyle valueStyle;

  /// 是否分割线
  final bool isDivider;

  GameOrderDetailValueLayout({
    this.isDivider = false,
    this.name = '-',
    this.value = '-',
    this.valueIcon,
    GGTextStyle? valueStyle,
  }) : valueStyle = valueStyle ?? normalValueStyle;
}

/// 串单布局数据
class GameOrderDetailBunchLayout {
  final String name;
  final int index;
  final List<GameOrderDetailValueLayout> valueLayouts;

  GameOrderDetailBunchLayout({
    this.name = 'bet',
    required this.index,
    this.valueLayouts = const [],
  });

  /// 注单标题 注单1...
  String get nameText => '${localized(name)}${index + 1}';
}
