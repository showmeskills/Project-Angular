import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/im/models/im_emoji.dart';
import 'package:gogaming_app/widget_header.dart';

import '../chat_presenter.dart';

class ChatEmojiView extends StatelessWidget {
  const ChatEmojiView({super.key});

  ChatPresenter get _presenter => Get.find<ChatPresenter>();

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      final double width = ((constraints.maxWidth - 7 * 15.dp) ~/ 8).toDouble();
      return SingleChildScrollView(
        child: Wrap(
          spacing: 15.dp,
          runSpacing: 15.dp,
          children: imEmoji.map((e) {
            return GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => _presenter.onEmojiPressed(e),
              child: Container(
                width: width,
                alignment: Alignment.center,
                child: Text(
                  e,
                  style: GGTextStyle(
                    fontSize: GGFontSize.superBigTitle28,
                    height: 1,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      );
    });
  }
}
