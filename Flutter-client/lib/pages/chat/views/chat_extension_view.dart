import 'package:flutter/cupertino.dart';
import 'package:flutter/widgets.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import '../chat_presenter.dart';

class ChatExtensionView extends StatelessWidget {
  const ChatExtensionView({super.key});

  ChatPresenter get _presenter => Get.find<ChatPresenter>();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _presenter.onFilePickerPressed,
          child: GamingImage.asset(
            R.iconImFolder,
            width: 28.dp,
            height: 28.dp,
            color: GGColors.darkBorder.color,
          ),
        ),
        Gaps.hGap16,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _presenter.onGalleryPickerPressed,
          child: GamingImage.asset(
            R.iconImGallery,
            width: 28.dp,
            height: 28.dp,
            color: GGColors.darkBorder.color,
          ),
        ),
      ],
    );
  }
}
