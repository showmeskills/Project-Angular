import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import '../chat_presenter.dart';
import '../chat_state.dart';
import 'chat_input_bottom_view.dart';

class ChatInputView extends StatelessWidget {
  const ChatInputView({super.key});

  ChatPresenter get _presenter => Get.find<ChatPresenter>();

  ChatViewState get _viewState => _presenter.viewState;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: GGColors.homeFootBackground.color,
      child: Column(
        children: [
          Container(
            width: double.infinity,
            constraints: BoxConstraints(
              minHeight: 68.dp,
            ),
            padding: EdgeInsets.symmetric(vertical: 10.dp),
            child: GetBuilder<ChatPresenter>(
              id: 'input',
              init: _presenter,
              builder: (context) {
                if (!_viewState.hasPermission) {
                  return _buildNotPermissionTips();
                } else if (_viewState.inChating) {
                  return _buildTextField();
                } else {
                  return _buildStartButton();
                }
              },
            ),
          ),
          const ChatInputBottomView(),
        ],
      ),
    );
  }

  Widget _buildStartButton() {
    return ScaleTap(
      onPressed: _presenter.onStartPressed,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        alignment: Alignment.center,
        child: Text(
          localized('start_session'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.brand.color,
          ),
        ),
      ),
    );
  }

  Widget _buildNotPermissionTips() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      alignment: Alignment.center,
      child: Text(
        localized('send_message_no_permission'),
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textHint.color,
        ),
      ),
    );
  }

  Widget _buildTextField() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Gaps.hGap16,
        Expanded(
          child: Stack(
            children: [
              GamingTextField(
                controller: _viewState.inputController,
                keyboardType: TextInputType.multiline,
                textInputAction: TextInputAction.newline,
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 14.dp, vertical: 14.dp)
                        .copyWith(right: 40.dp),
                scrollPadding:
                    EdgeInsets.symmetric(horizontal: 14.dp, vertical: 14.dp)
                        .copyWith(right: 40.dp),
                hintText: localized('enter_message'),
                fillColor: GGColors.moduleBackground,
                maxLine: 5,
                minLine: 1,
                // maxLength: 5000,
                // buildCounter: (
                //   context, {
                //   required currentLength,
                //   required isFocused,
                //   required maxLength,
                // }) {
                //   return null;
                // },
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(4.dp),
                  borderSide: BorderSide(
                    color: GGColors.border.color,
                  ),
                ),
                focusedBorderColor: GGColors.border.color,
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: _presenter.showEmojiPicker,
                  child: Container(
                    width: 40.dp,
                    height: 1.44 * 14.dp + 28.dp,
                    alignment: Alignment.center,
                    child: GamingImage.asset(
                      R.iconEmoji,
                      width: 20.dp,
                      color: GGColors.darkBorder.color,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        Gaps.hGap8,
        ScaleTap(
          onPressed: _presenter.showExtension,
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 8.dp),
            height: 48.dp,
            alignment: Alignment.center,
            child: GamingImage.asset(
              R.iconImExtension,
              width: 20.dp,
              height: 20.dp,
              color: GGColors.darkBorder.color,
            ),
          ),
        ),
        ScaleTap(
          onPressed: _presenter.onSendPressed,
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 8.dp),
            height: 48.dp,
            alignment: Alignment.center,
            child: GamingImage.asset(
              R.iconImSend,
              width: 20.dp,
              height: 20.dp,
              color: GGColors.brand.color,
            ),
          ),
        ),
        Gaps.hGap8,
      ],
    );
  }
}
