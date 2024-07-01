// ignore_for_file: must_be_immutable, unused_element

part of '../currency_appeal_submit_page.dart';

class _CurrencyAppealVideoPlayer extends StatelessWidget {
  _CurrencyAppealVideoPlayer({super.key, required this.url}) {
    flickManager = FlickManager(
      videoPlayerController: VideoPlayerController.networkUrl(Uri.parse(url)),
      autoPlay: false,
    );
  }

  final String url;

  late FlickManager flickManager;

  CurrencyAppealSubmitLogic get controller =>
      Get.find<CurrencyAppealSubmitLogic>();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: double.infinity,
      width: double.infinity,
      decoration: BoxDecoration(
        color: GGColors.border.color,
        borderRadius: BorderRadius.circular(4.dp),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(4.dp),
        child: FlickVideoPlayer(
          flickManager: flickManager,
          flickVideoWithControls: FlickVideoWithControls(
            controls: LandscapePlayerControls(
              iconSize: 20.dp,
              fontSize: 12.dp,
              onPressed: _deleteVideo,
            ),
            videoFit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}

extension _AppealVideoAction on _CurrencyAppealVideoPlayer {
  void _deleteVideo() {
    if (flickManager.flickControlManager?.isFullscreen ?? false) {
      flickManager.flickControlManager?.exitFullscreen();
    }
    flickManager.flickControlManager?.pause().then((value) {
      flickManager.dispose();
      controller.deleteVideo();
    });
  }
}

class LandscapePlayerControls extends StatelessWidget {
  const LandscapePlayerControls({
    Key? key,
    this.iconSize = 20,
    this.fontSize = 12,
    this.onPressed,
  }) : super(key: key);
  final double iconSize;
  final double fontSize;
  final void Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        Positioned.fill(
          child: FlickPortraitControls(
            fontSize: fontSize,
            iconSize: iconSize,
            progressBarSettings: FlickProgressBarSettings(
              height: 5.dp,
            ),
          ),
        ),
        Positioned(
          right: 0,
          top: 0,
          child: ScaleTap(
            onPressed: onPressed,
            child: Padding(
              padding: EdgeInsets.all(4.dp),
              child: SvgPicture.asset(
                R.iconDelete,
                width: 18.dp,
                height: 18.dp,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
