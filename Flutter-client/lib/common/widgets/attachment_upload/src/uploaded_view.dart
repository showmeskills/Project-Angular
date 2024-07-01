part of attachment_upload;

class AttachmentUploadedView extends StatelessWidget {
  const AttachmentUploadedView({
    super.key,
    required this.controller,
    this.canDelete = true,
  });

  final AttachmentUploadController controller;
  final bool canDelete;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.attachments.isEmpty) {
        return Gaps.empty;
      }
      return Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(
          vertical: 10.dp,
          horizontal: 16.dp,
        ).copyWith(top: 3.dp),
        decoration: BoxDecoration(
          color: GGColors.border.color,
          borderRadius: BorderRadius.circular(4.dp),
        ),
        child: LayoutBuilder(
          builder: (p0, p1) {
            final maxCount = controller.maxCount > 4 ? 4 : controller.maxCount;
            final width =
                ((p1.maxWidth - 8.dp * (maxCount - 1)) ~/ maxCount).toDouble();

            return Wrap(
              spacing: 8.dp,
              runSpacing: 12.dp,
              children: controller.attachments.map((e) {
                return SizedBox(
                  width: width,
                  height: width,
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        alignment: Alignment.bottomLeft,
                        child: Container(
                          decoration: BoxDecoration(
                            border: RDottedLineBorder.all(
                              width: 1.dp,
                              color: GGColors.iconHint.color,
                            ),
                          ),
                          child: _buildPreview(e, width - 12.dp),
                        ),
                      ),
                      if (canDelete)
                        Positioned(
                          top: 0,
                          right: 0,
                          child: ScaleTap(
                            onPressed: () => _delete(e),
                            child: Padding(
                              padding: EdgeInsets.all(4.dp),
                              child: SvgPicture.asset(
                                R.iconDelete,
                                width: 18.dp,
                                height: 18.dp,
                              ),
                            ),
                          ),
                        )
                    ],
                  ),
                );
              }).toList(),
            );
          },
        ),
      );
    });
  }

  Widget _buildPreview(String url, double width) {
    final format = url.format;
    if (format == AttachmentType.image) {
      return GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          final index =
              controller.attachments.indexWhere((element) => element == url);
          MediaPreview.show(
            medias: controller.attachments,
            initialPage: index,
          );
        },
        child: GamingImage.network(
          width: width,
          height: width,
          url: url,
          fit: BoxFit.cover,
        ),
      );
    }
    return Container(
      width: width,
      height: width,
      alignment: Alignment.center,
      child: Text(
        path.extension(url).replaceFirst('.', '').toUpperCase(),
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textMain.color,
        ),
      ),
    );
  }
}

extension _Action2 on AttachmentUploadedView {
  void _delete(String attachment) {
    controller.delete(attachment);
  }
}
