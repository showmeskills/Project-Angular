import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/common/service/im/models/im_msg_type.dart';
import 'package:gogaming_app/pages/chat/views/content/src/rich_text_message_view.dart';
import 'package:gogaming_app/widget_header.dart';

import 'src/file_message_view.dart';
import 'src/image_message_view.dart';
import 'src/text_message_view.dart';
import 'src/unknown_message_view.dart';
import 'src/video_message_view.dart';

class MessageContentView extends StatelessWidget {
  const MessageContentView({
    super.key,
    required this.data,
  });
  final ChatContentModel data;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(10.dp),
      decoration: BoxDecoration(
        color: data.isSelf
            ? GGColors.homeFootBackground.color
            : GGColors.imBackground.color,
        borderRadius: BorderRadius.circular(8.dp).copyWith(
          topLeft: Radius.circular(data.isSelf ? 8.dp : 0),
          bottomRight: Radius.circular(data.isSelf ? 0 : 8.dp),
        ),
      ),
      child: Builder(builder: (context) {
        switch (data.contentType) {
          case IMMsgType.text:
            return TextMessageView(data: data);
          case IMMsgType.image:
            return ImageMessageView(data: data);
          case IMMsgType.file:
            return FileMessageView(
              data: data,
            );
          case IMMsgType.video:
            return VideoMessageView(
              data: data,
            );
          case IMMsgType.textAndImage:
            return RichTextMessageView(
              data: data,
            );
          default:
            return UnknownMessageView(
              isSelf: data.isSelf,
            );
        }
      }),
    );
  }
}
