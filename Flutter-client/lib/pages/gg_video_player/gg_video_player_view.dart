import 'package:flick_video_player/flick_video_player.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import '../../common/api/base/base_api.dart';
import '../../common/widgets/appbar/appbar.dart';
import 'gg_video_player_logic.dart';

class GGVideoPlayerPage extends BaseView<GGVideoPlayerLogic> {
  const GGVideoPlayerPage({required this.url, this.name, super.key});

  final String? name;
  final String url;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () {
        Map<String, dynamic> arguments = Get.arguments as Map<String, dynamic>;
        String url = arguments['url'].toString();
        return GGVideoPlayerPage(
          url: url,
          name: arguments['name'] as String?,
        );
      },
    );
  }

  @override
  Color? backgroundColor() => Colors.black;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: name ?? '',
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GGVideoPlayerLogic(url: url));
    return FlickVideoPlayer(
      flickManager: controller.flickManager,
      flickVideoWithControls: const FlickVideoWithControls(
        controls: FlickPortraitControls(
          iconSize: 35,
        ),
        videoFit: BoxFit.contain,
      ),
    );
  }
}
