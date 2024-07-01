import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:url_launcher/url_launcher.dart';

class TextMessageView extends StatelessWidget {
  const TextMessageView({
    super.key,
    required this.data,
  });
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
      r'((https|http|ftp|rtsp|mms):\/\/)[^\s]+',
      caseSensitive: false,
      dotAll: true,
    );
    // 使用 RegExp 对象的 allMatches 方法来找到所有的匹配项
    final matches = reg.allMatches(text).toList();

    // 创建一个空的 TextSpan 列表
    List<TextSpan> spans = [];

    int start = 0;

    // 遍历所有的匹配项
    for (var match in matches) {
      // 添加匹配项之前的文本
      spans.add(TextSpan(text: text.substring(start, match.start)));

      // 添加匹配项，并将其高亮显示
      final url = text.substring(match.start, match.end);

      spans.add(TextSpan(
        text: url,
        style: style.copyWith(
          color: data.isSelf
              ? GGColors.imBackground.color
              : GGColors.buttonTextWhite.color,
          decoration: TextDecoration.underline,
        ),
        recognizer: TapGestureRecognizer()
          ..onTap = () {
            final uri = Uri.tryParse(url);
            // 打开链接
            if (uri != null) {
              launchUrl(uri, mode: LaunchMode.externalApplication);
            }
          },
      ));

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
