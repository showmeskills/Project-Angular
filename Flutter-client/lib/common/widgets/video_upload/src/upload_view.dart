part of video_upload;

class VideoUploadView extends StatelessWidget {
  const VideoUploadView({super.key, required this.controller});

  final VideoUploadController controller;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.attachments.isEmpty) {
        return AspectRatio(
          aspectRatio: 1.78,
          child: _buildVideoUploadButton(),
        );
      } else {
        return AspectRatio(
          aspectRatio: 1.78,
          child: VideoUploadedPlayer(
            controller: controller,
          ),
        );
      }
    });
  }

  Widget _buildVideoUploadButton() {
    return ScaleTap(
      onPressed: controller.selectPickMethod,
      child: Container(
        height: double.infinity,
        width: double.infinity,
        decoration: BoxDecoration(
          color: GGColors.border.color,
          borderRadius: BorderRadius.circular(4.dp),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SvgPicture.asset(
              R.iconUploadCloud,
              width: 30.dp,
              height: 30.dp,
              color: GGColors.highlightButton.color,
            ),
            Gaps.vGap8,
            Text(
              localized('click_up_video'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            ),
            Gaps.vGap8,
            Text(
              localized('file_not_big'),
              textAlign: TextAlign.center,
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.textSecond.color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
