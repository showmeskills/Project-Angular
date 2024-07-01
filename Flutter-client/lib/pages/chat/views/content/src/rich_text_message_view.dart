import 'package:base_framework/base_framework.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/pages/chat/views/content/src/file_message_view.dart';
import 'package:gogaming_app/widget_header.dart';

import 'image_message_view.dart';
import 'video_message_view.dart';

class RichTextMessageView extends StatelessWidget {
  const RichTextMessageView({super.key, required this.data});
  final ChatContentModel data;

  @override
  Widget build(BuildContext context) {
    final text = data.contentText;
    final style = GGTextStyle(
      fontSize: GGFontSize.content,
      color: data.isSelf
          ? GGColors.textMain.color
          : GGColors.buttonTextWhite.color,
    );

    final reg = RegExp(
      r'#{\d+}#',
      caseSensitive: false,
      dotAll: true,
    );
    // 使用 RegExp 对象的 allMatches 方法来找到所有的匹配项
    final matches = reg.allMatches(text).toList();

    // 创建一个空的 TextSpan 列表
    List<InlineSpan> spans = [];

    int start = 0;

    // 遍历所有的匹配项
    for (var match in matches) {
      // 添加匹配项之前的文本
      if (start != match.start) {
        spans.add(TextSpan(text: text.substring(start, match.start)));
      }

      // 添加匹配项，并将其高亮显示
      final fId = text.substring(match.start + 2, match.end - 2);
      final asset =
          data.assets?.firstWhereOrNull((element) => element.fId == fId);
      Widget? child;
      if (asset?.url?.isNotEmpty == true) {
        if (asset?.isImage ?? false) {
          child = IMImage(
            heroTag: '${data.localId}_$fId',
            asset: asset!,
          );
        } else if (asset?.isVideo ?? false) {
          child = IMVideoCover(
            heroTag: '${data.localId}_$fId',
            asset: asset!,
          );
        } else {
          child = IMFileView(
            isSelf: false,
            asset: asset!,
          );
        }
        child = Container(
          margin: EdgeInsets.only(
            // 如果这个匹配项之后还有文本，那么添加 6 像素的底部间距
            bottom: match.end != text.length ? 6.dp : 0,
          ),
          child: child,
        );
        if (spans.isNotEmpty) {
          double margin = 0;
          if (spans.last is TextSpan && (spans.last as TextSpan).text != '\n') {
            spans.add(const TextSpan(text: '\n'));
            margin = 6.dp;
          }
          child = Container(
            margin: EdgeInsets.only(
              // 如果在这个匹配项之前有文本，那么添加 6 像素的顶部间距
              top: margin,
            ),
            child: child,
          );
        }

        spans.add(WidgetSpan(child: child));
        if (match.end != text.length) {
          spans.add(const TextSpan(text: '\n'));
        }
      }
      start = match.end;
    }

    // 添加最后一个匹配项之后的文本
    spans.add(TextSpan(text: text.substring(start)));

    return SelectionArea(
      child: Text.rich(
        TextSpan(
          children: spans,
          style: style,
        ),
        textWidthBasis: TextWidthBasis.longestLine,
      ),
    );
  }
}
