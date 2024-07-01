import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/widget_header.dart';

class ChatRefresherFooter extends CustomFooter {
  ChatRefresherFooter({super.key})
      : super(
          height: 50.dp,
          loadStyle: LoadStyle.ShowWhenLoading,
          builder: (BuildContext context, LoadStatus? mode) {
            if (mode == LoadStatus.noMore) {
              return const SizedBox();
            }
            return SizedBox(
              height: 50.dp,
              child: Center(
                child: CupertinoActivityIndicator(
                  radius: 8.dp,
                  color: GGColors.textMain.color,
                ),
              ),
            );
          },
        );
}
