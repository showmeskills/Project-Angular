import 'dart:io';

import 'package:flick_video_player/flick_video_player.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:video_player/video_player.dart';

class GGVideoPlayerLogic extends BaseController {
  GGVideoPlayerLogic({required this.url});

  late FlickManager flickManager;
  final String url;

  @override
  void onInit() {
    super.onInit();
    final uri = Uri.parse(url);
    flickManager = FlickManager(
      videoPlayerController: uri.host.isNotEmpty
          ? VideoPlayerController.networkUrl(uri)
          : VideoPlayerController.file(File(url)),
      autoPlay: true,
    );
  }

  @override
  void onClose() {
    flickManager.dispose();
    super.onClose();
  }
}
