import 'dart:math';

import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

import '../chat_presenter.dart';
import '../chat_state.dart';
import 'chat_emoji_view.dart';
import 'chat_extension_view.dart';

class ChatInputBottomView extends StatelessWidget {
  const ChatInputBottomView({super.key});

  ChatPresenter get _presenter => Get.find<ChatPresenter>();

  ChatViewState get _viewState => _presenter.viewState;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      maintainBottomViewPadding: true,
      child: GetBuilder<ChatPresenter>(
        id: 'input_safe_area',
        init: _presenter,
        builder: (_) {
          return AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            // curve: Curves.easeInOutCubic,
            padding: EdgeInsets.symmetric(
              horizontal: 16.dp,
              vertical: 10.dp,
            ),
            height: _viewState.showEmoji || _viewState.showExtension
                ? _viewState.inputSafeArea
                : max(
                    _viewState.inputSafeArea -
                        MediaQuery.of(context).viewPadding.bottom,
                    0),
            child: Builder(
              builder: (context) {
                if (_viewState.showEmoji) {
                  return const ChatEmojiView();
                } else if (_viewState.showExtension) {
                  return const ChatExtensionView();
                } else {
                  return Container();
                }
              },
            ),
          );
        },
      ),
    );
  }
}
