part of '../currency_appeal_submit_page.dart';

class _CurrencyAppealUploadView extends StatelessWidget
    with AppealCommonUIMixin {
  const _CurrencyAppealUploadView();

  CurrencyAppealSubmitLogic get controller =>
      Get.find<CurrencyAppealSubmitLogic>();

  CurrencyAppealSubmitState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildTitle(
          localized('up_pay_cert'),
          isRequired: true,
        ),
        Gaps.vGap24,
        _buildTips(),
        _buildUploadButton(),
      ],
    );
  }

  Widget _buildTips() {
    if (controller.id == null) {
      return Container(
        margin: EdgeInsets.only(bottom: 24.dp),
        child: Text(
          localized('pay_proof'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
      );
    } else {
      return Obx(() {
        final supplementExplanation = state.detail?.supplementExplanation ?? '';
        final precautions = state.detail?.precautions ?? '';
        return Container(
          margin: EdgeInsets.only(
              bottom: supplementExplanation.isNotEmpty || precautions.isNotEmpty
                  ? 24.dp
                  : 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (supplementExplanation.isNotEmpty)
                Text(
                  supplementExplanation,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.error.color,
                  ),
                ),
              if (precautions.isNotEmpty)
                Container(
                  margin: EdgeInsets.only(top: 24.dp),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        localized('precautions'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textSecond.color,
                        ),
                      ),
                      Text(
                        precautions,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textSecond.color,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        );
      });
    }
  }

  Widget _buildUploadButton() {
    return Obx(() {
      if (state.detail?.needUploadVideo ?? false) {
        return _buildVideoView();
      }
      return _buildImageView();
    });
  }

  Widget _buildVideoView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('sure_content'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textHint.color,
          ),
        ),
        Gaps.vGap10,
        Obx(() {
          if (state.video.isEmpty) {
            return AspectRatio(
              aspectRatio: 2,
              child: _buildVideoUploadButton(),
            );
          } else {
            return AspectRatio(
              aspectRatio: 1.78,
              child: _CurrencyAppealVideoPlayer(
                url: state.video,
              ),
            );
          }
        }),
      ],
    );
  }

  Widget _buildVideoUploadButton() {
    return ScaleTap(
      onPressed: _selectVideo,
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
              color: GGColors.textSecond.color,
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

  Widget _buildImageView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildImageUploadButton(),
        Gaps.vGap10,
        Text(
          localized('up_four'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textSecond.color,
          ),
        ),
        Text(
          localized('file_size_formats'),
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textSecond.color,
          ),
        ),
        _buildImages(),
      ],
    );
  }

  Widget _buildImageUploadButton() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ScaleTap(
          onPressed: _selectImage,
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
                  color: state.uploadMissing
                      ? GGColors.error.color
                      : GGColors.border.color,
                ),
                borderRadius: BorderRadius.circular(4.dp),
              ),
              child: Builder(builder: (context) {
                if (state.uploading) {
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        height: 14.dp * 1.4,
                        child: GoGamingLoading(
                          color: state.uploadMissing
                              ? GGColors.error
                              : GGColors.textSecond,
                          size: 14.dp,
                        ),
                      ),
                    ],
                  );
                }
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (!state.uploading)
                      SvgPicture.asset(
                        R.iconUpload,
                        width: 14.dp,
                        height: 14.dp,
                        color: state.uploadMissing
                            ? GGColors.error.color
                            : GGColors.textHint.color,
                      ),
                    Gaps.hGap10,
                    Text(
                      localized('up_files'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: state.uploadMissing
                            ? GGColors.error.color
                            : GGColors.textSecond.color,
                      ),
                    ),
                  ],
                );
              }),
            );
          }),
        ),
        Obx(() {
          if (!state.uploadMissing) {
            return Gaps.empty;
          }
          return Container(
            margin: EdgeInsets.only(top: 10.dp),
            child: Text(
              localized('require_field'),
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.error.color,
                fontWeight: GGFontWeigh.regular,
                height: 1.4,
              ),
            ),
          );
        })
      ],
    );
  }

  Widget _buildImages() {
    return Obx(() {
      if (state.images.isEmpty) {
        return Gaps.empty;
      }
      return Container(
        width: double.infinity,
        margin: EdgeInsets.only(top: 15.dp),
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
            final width = ((p1.maxWidth - 8.dp * 3) ~/ 4).toDouble();

            return Wrap(
              spacing: 8.dp,
              children: state.images.map((e) {
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
                          child: GamingImage.network(
                            width: width - 12.dp,
                            height: width - 12.dp,
                            url: e,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      Positioned(
                        top: 0,
                        right: 0,
                        child: ScaleTap(
                          onPressed: () => _deleteImage(e),
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
}

extension _Action3 on _CurrencyAppealUploadView {
  Future<bool?> _showPickMethod() {
    return GamingSelector.simple<String>(
      title: localized("sen_de"),
      useCloseButton: false,
      centerTitle: true,
      fixedHeight: false,
      original: [
        localized("camera"),
        localized("gallery"),
      ],
      itemBuilder: (context, e, index) {
        return InkWell(
          onTap: () {
            Get.back<String>(result: e);
          },
          child: SizedBox(
            height: 50.dp,
            child: Center(
              child: Text(
                e,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.regular,
                ),
              ),
            ),
          ),
        );
      },
    ).then((value) {
      if (value != null) {
        return value == localized("gallery");
      }
      return null;
    });
  }

  void _selectImage() {
    if (state.uploading) {
      return;
    }
    if (state.images.length >= 4) {
      Toast.show(
        state: GgToastState.fail,
        title: localized('failed'),
        message: localized('upload_max', params: ['4']),
      );
      return;
    }
    _showPickMethod().then((value) {
      if (value != null) {
        controller.selectImage(openGallery: value);
      }
    });
  }

  void _deleteImage(String url) {
    controller.deleteImage(url);
  }

  void _selectVideo() {
    if (state.uploading) {
      return;
    }

    _showPickMethod().then((value) {
      if (value != null) {
        controller.selectVideo(openGallery: value);
      }
    });
  }
}
