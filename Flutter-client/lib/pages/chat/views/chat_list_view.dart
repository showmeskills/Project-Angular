import 'package:flutter/material.dart';
import 'package:flutter_list_view/flutter_list_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../chat_presenter.dart';
import '../chat_state.dart';
import 'chat_message_item_view.dart';
import 'chat_refresher_footer.dart';

class ChatListView extends StatelessWidget {
  const ChatListView({super.key});

  ChatPresenter get _presenter => Get.find<ChatPresenter>();

  ChatViewState get _viewState => _presenter.viewState;

  @override
  Widget build(BuildContext context) {
    return Listener(
      onPointerMove: _presenter.onPointerMove,
      child: MediaQuery.removePadding(
        context: context,
        removeBottom: true,
        removeTop: true,
        child: RefreshConfiguration(
          footerTriggerDistance: 80.dp,
          enableLoadingWhenNoData: false,
          child: GetBuilder<ChatPresenter>(
            id: 'list',
            init: _presenter,
            builder: (context) {
              return SmartRefresher(
                controller: _viewState.refreshController,
                scrollController: _viewState.listViewController,
                footer: ChatRefresherFooter(),
                enablePullUp: true,
                enablePullDown: false,
                onLoading: _presenter.onRefresh,
                child: FlutterListView(
                  controller: _viewState.listViewController,
                  reverse: true,
                  delegate: FlutterListViewDelegate(
                    (BuildContext context, int index) {
                      return ChatMessageItemView(
                        data: _viewState.data[index],
                        isFirst: index == 0,
                      );
                    },
                    childCount: _viewState.data.length,
                    onItemKey: (index) => _viewState.data[index].localId,
                    onItemHeight: (index) {
                      return _viewState.data[index].contentHeight +
                          (index == 0 ? 5.dp : 0);
                    },
                    keepPosition: true,
                    firstItemAlign: FirstItemAlign.end,
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
