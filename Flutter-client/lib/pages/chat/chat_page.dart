import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/chat/chat_presenter.dart';
import 'package:gogaming_app/widget_header.dart';

import 'views/chat_connection_status_view.dart';
import 'views/chat_input_view.dart';
import 'views/chat_list_view.dart';

class ChatPage extends BaseView<ChatPresenter> {
  const ChatPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () {
        return const ChatPage();
      },
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      backgroundColor: GGColors.moduleBackground.color,
      title: localized('chat'),
      centerTitle: false,
      leadingIcon: Container(
        padding: EdgeInsets.only(left: 16.dp, right: 10.dp),
        child: SizedBox(
          width: 17.dp,
          child: GamingImage.asset(
            R.iconMessage,
            width: 17.dp,
            color: GGColors.textMain.color,
          ),
        ),
      ),
      leadingWidth: 43.dp,
      actions: [
        GamingCloseButton(
          size: 16.dp,
          padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 16.dp),
        ),
      ],
    );
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  @override
  bool resizeToAvoidBottomInset() {
    return false;
  }

  @override
  Color backgroundColor() {
    return GGColors.alertBackground.color;
  }

  @override
  Widget body(BuildContext context) {
    Get.put(ChatPresenter(), permanent: true);
    return const Column(
      children: [
        ChatConnectionStatusView(),
        Expanded(
          child: ChatListView(),
        ),
        ChatInputView(),
      ],
    );
  }
}
