import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/im/models/im_asset.dart';

import 'content/src/image_message_view.dart';

class ChatImagePreview extends StatelessWidget {
  const ChatImagePreview({
    super.key,
    required this.heroTag,
    required this.asset,
  });
  final String heroTag;

  final IMAsset asset;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => Navigator.of(context).pop(),
      child: Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: SingleChildScrollView(
            child: IMImage(
              heroTag: heroTag,
              asset: asset,
              fullMode: true,
              onTap: () => Navigator.of(context).pop(),
            ),
          ),
        ),
      ),
    );
  }
}
