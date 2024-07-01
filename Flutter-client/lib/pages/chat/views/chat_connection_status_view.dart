import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/common/service/im/models/im_connection_status.dart';
import 'package:gogaming_app/widget_header.dart';

import '../chat_presenter.dart';
import '../chat_state.dart';

class ChatConnectionStatusView extends StatelessWidget {
  const ChatConnectionStatusView({super.key});

  ChatPresenter get _presenter => Get.find<ChatPresenter>();

  ChatViewState get _viewState => _presenter.viewState;

  @override
  Widget build(BuildContext context) {
    return GetBuilder<ChatPresenter>(
      id: 'connection_status',
      init: _presenter,
      builder: (context) {
        String? text;
        switch (_viewState.connectionStatus) {
          case IMConnectionStatus.init || IMConnectionStatus.connecting:
            // 正在连接
            text = localized('im_connecting');
            break;
          case IMConnectionStatus.connectFailed ||
                IMConnectionStatus.disconnected:
            // 连接失败
            text = localized('im_connection_failed');
            break;
          default:
            break;
        }
        if (text != null) {
          return Container(
            padding: EdgeInsets.symmetric(vertical: 10.dp),
            color: GGColors.darkBorder.color,
            alignment: Alignment.center,
            child: Text(
              text,
              style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.hint,
              ),
            ),
          );
        } else {
          return Container();
        }
      },
    );
  }
}
