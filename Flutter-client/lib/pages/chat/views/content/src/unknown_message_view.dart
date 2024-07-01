import 'package:flutter/widgets.dart';
import 'package:gogaming_app/widget_header.dart';

class UnknownMessageView extends StatelessWidget {
  const UnknownMessageView({
    super.key,
    required this.isSelf,
  });
  final bool isSelf;
  @override
  Widget build(BuildContext context) {
    return Text(
      localized('unknown_message_type'),
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color:
            isSelf ? GGColors.textMain.color : GGColors.buttonTextWhite.color,
      ),
    );
  }
}
