import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/common/service/im/models/im_msg_type.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/chat/chat_presenter.dart';
import 'package:gogaming_app/widget_header.dart' hide ConnectionState;

import 'chat_message_loading_view.dart';
import 'content/message_content_view.dart';

class ChatMessageItemView extends StatelessWidget {
  const ChatMessageItemView({
    super.key,
    required this.data,
    this.isFirst = false,
  });

  final ChatContentModel data;
  final bool isFirst;

  ChatPresenter get _presenter => Get.find<ChatPresenter>();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (!data.isHiddenTime)
          ChatDateTimeView(
            dateTime: data.formatDateTime!,
          ),
        Container(
          padding:
              EdgeInsets.symmetric(horizontal: 16.dp, vertical: 5.dp).copyWith(
            bottom: isFirst ? 10.dp : 5.dp,
          ),
          child: GetBuilder(
            init: _presenter,
            id: 'im_${data.localId}',
            builder: (context) {
              final Widget content = MessageContentView(
                data: data,
              );
              if (data.isSelf) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Builder(
                      builder: (context) {
                        if (data.sendStatus == SendStatus.fail) {
                          if (data.uploadRisk) {
                            return GamingImage.asset(
                              R.imUploadRisk,
                              width: 14.dp,
                              height: 14.dp,
                            );
                          } else {
                            return GestureDetector(
                              behavior: HitTestBehavior.opaque,
                              onTap: () => _presenter.resend(data),
                              child: GamingImage.asset(
                                R.imSendFailed,
                                width: 14.dp,
                                height: 14.dp,
                              ),
                            );
                          }
                        } else if (data.sendStatus == SendStatus.success) {
                          return GamingImage.asset(
                            R.imSendSuccessful,
                            width: 14.dp,
                            height: 14.dp,
                            color: GGColors.darkBorder.color,
                          );
                        } else {
                          if (data.contentType == IMMsgType.file ||
                              data.contentType == IMMsgType.image ||
                              data.contentType == IMMsgType.video) {
                            return ChatFileUploadProgressView(
                              progress: data.progress,
                            );
                          }
                          return const ChatMessageLoadingView();
                        }
                      },
                    ),
                    Gaps.hGap6,
                    Flexible(
                      child: content,
                    ),
                  ],
                );
              }
              return Row(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    margin: EdgeInsets.only(right: 10.dp),
                    child: GamingImage.asset(
                      R.imAvatar,
                      width: 24.dp,
                      height: 24.dp,
                      radius: 12.dp,
                      fit: BoxFit.cover,
                    ),
                  ),
                  Flexible(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Flexible(
                          child: content,
                        ),
                        Gaps.hGap6,
                        // GamingImage.asset(
                        //   R.commonToastSuccess,
                        //   width: 14.dp,
                        //   height: 14.dp,
                        //   color: GGColors.border.color,
                        // ),
                      ],
                    ),
                  ),
                  Gaps.hGap14,
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}

class ChatDateTimeView extends StatelessWidget {
  const ChatDateTimeView({super.key, required this.dateTime});
  final String dateTime;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 10.dp, horizontal: 16.dp),
      child: Text(
        dateTime,
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
          color: GGColors.textSecond.color,
        ),
        maxLines: 1,
      ),
    );
  }
}
