part of video_upload;

class VideoUploadedPlayer extends StatefulWidget {
  const VideoUploadedPlayer({super.key, required this.controller});

  final VideoUploadController controller;

  @override
  State<VideoUploadedPlayer> createState() => _VideoUploadedPlayerState();
}

class _VideoUploadedPlayerState extends State<VideoUploadedPlayer> {
  late FlickManager flickManager;

  @override
  void initState() {
    super.initState();
    flickManager = FlickManager(
      videoPlayerController: VideoPlayerController.networkUrl(
          Uri.parse(widget.controller.attachments.first)),
      autoPlay: false,
    );
  }

  @override
  void dispose() {
    flickManager.dispose();
    super.dispose();
  }

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

extension _Action on _VideoUploadedPlayerState {
  void _deleteVideo() {
    if (flickManager.flickControlManager?.isFullscreen ?? false) {
      flickManager.flickControlManager?.exitFullscreen();
    }
    flickManager.flickControlManager?.pause().then((value) {
      widget.controller.delete(widget.controller.attachments.first);
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
