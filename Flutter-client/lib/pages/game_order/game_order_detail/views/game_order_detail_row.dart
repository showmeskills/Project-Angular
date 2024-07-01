import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

import '../models/game_order_detail_layout.dart';

/// 构建信息单元
/// 大致分为左名称&右数据
/// 右侧数据大致 分为普通文本 & 图片+文本
/// 右侧数据文本 可以自定义TextStyle
/// 右侧数据文本 TextStyle 大致有三种变化
///   1.交易单号变更字体Family PingFangSC > D-DIN-PRO
///   2.红色 和 绿色
class GameOrderDetailRow extends StatelessWidget {
  const GameOrderDetailRow({
    Key? key,
    required this.layout,
    this.padding,
  }) : super(key: key);

  final GameOrderDetailValueLayout layout;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    if (layout.isDivider == true) {
      return Divider(
        height: 16.dp,
        color: GGColors.border.color,
      );
    }

    return Padding(
      padding: padding ?? EdgeInsets.only(top: 7.dp, bottom: 7.dp),
      child: Row(
        children: [
          Text(
            '${localized(layout.name)}:',
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
            ),
          ),
          SizedBox(width: 8.dp),
          Expanded(
            child: Text(
              layout.value,
              textAlign: TextAlign.end,
              style: layout.valueStyle,
            ),
          ),
          if (layout.valueIcon != null)
            Container(
              margin: EdgeInsets.only(left: 8.dp),
              child: GamingImage.network(
                url: layout.valueIcon ?? "",
                width: 16.dp,
                height: 16.dp,
              ),
            ),
        ],
      ),
    );
  }
}
