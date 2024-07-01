part of attachment_upload;

class AttachmentUploadButton extends StatelessWidget {
  const AttachmentUploadButton({
    super.key,
    required this.controller,
    this.text,
    this.iconColor,
    this.textColor,
    this.backgroundColor,
  });

  final String? text;
  final GGColors? iconColor;
  final GGColors? textColor;
  final GGColors? backgroundColor;

  final AttachmentUploadController controller;

  GGColors get _effectiveIconColor => iconColor ?? GGColors.textSecond;

  GGColors get _effectiveTextColor => textColor ?? GGColors.textMain;

  GGColors get _effectiveBackgroundColor => backgroundColor ?? GGColors.border;

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onPressed: _selectPickMethod,
      child: Obx(() {
        return Container(
          padding: EdgeInsets.symmetric(
            vertical: 14.dp,
            horizontal: 24.dp,
          ),
          constraints: BoxConstraints(
            minWidth: 130.dp,
          ),
          decoration: BoxDecoration(
            border: Border.all(
              width: 1.dp,
              color: controller.uploadMissing
                  ? GGColors.error.color
                  : _effectiveBackgroundColor.color,
            ),
            borderRadius: BorderRadius.circular(4.dp),
            color: _effectiveBackgroundColor.color,
          ),
          child: Builder(builder: (context) {
            if (controller.uploading) {
              return Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 14.dp * 1.4,
                    child: GoGamingLoading(
                      color: controller.uploadMissing
                          ? GGColors.error
                          : _effectiveTextColor,
                      size: 14.dp,
                    ),
                  ),
                ],
              );
            }
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SvgPicture.asset(
                  R.iconUpload,
                  width: 14.dp,
                  height: 14.dp,
                  color: _effectiveIconColor.color,
                ),
                Gaps.hGap10,
                Text(
                  text ?? localized('up_files'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: _effectiveTextColor.color,
                  ),
                ),
              ],
            );
          }),
        );
      }),
    );
  }
}

extension _Action on AttachmentUploadButton {
  void _selectPickMethod() {
    controller.selectPickMethod();
  }
}
