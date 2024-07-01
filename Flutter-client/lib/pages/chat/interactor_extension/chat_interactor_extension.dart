part of '../chat_interactor.dart';

extension ChatInteractorUploadExtension on ChatInteractor {
  void updateLocalFile({
    required String localId,
    required String localFileName,
    List<IMAsset>? assets,
    num? width,
    num? height,
    String? contentText,
    bool updateModel = true,
  }) {
    if (updateModel) {
      final index =
          state.data.indexWhere((element) => element.localId == localId);
      if (index != -1) {
        final chatModel = state.data[index];
        chatModel.localFileName = localFileName;
        if (assets != null) {
          chatModel.assets = assets;
        }
        if (width != null) {
          chatModel.contentWidth = width;
        }
        if (height != null) {
          chatModel.contentHeight = height;
        }
        if (contentText != null) {
          chatModel.contentText = contentText;
        }
      }
    }

    IMDatabaseService.sharedInstance.updateEntry(
      localId: localId,
      localFileName: localFileName,
      contentWidth: width,
      contentHeight: height,
      assets: assets,
      contentText: contentText,
    );
  }

  void updateAssets({
    required String localId,
    required List<IMAsset> assets,
  }) {
    final index =
        state.data.indexWhere((element) => element.localId == localId);
    if (index != -1) {
      state.data[index].assets = assets;
    }
    IMDatabaseService.sharedInstance.updateEntry(
      localId: localId,
      assets: assets,
    );
  }

  /// 上传
  Stream<String> upload({
    required String localId,
    required String filePath,
    bool needUpdateUploadProgress = true,
  }) {
    return IMFileUploadQueue.sharedInstance
        .add(
      key: filePath,
      sourcePath: filePath,
      onProgress: !needUpdateUploadProgress
          ? null
          : (progress) {
              updateUploadProgress(localId, progress);
            },
    )
        .doOnError((p0, p1) {
      if (p0 is GoGamingResponseException && p0.code == "oa_im_3217") {
        //触发上传文件限流
        Toast.showFailed(localized('im_frequency_limit'));
      }
      bool? uploadRisk;
      if (p0 is GoGamingResponseException) {
        // 文件上传风控
        if (p0.code == 'oa_im_3218') {
          uploadRisk = true;
          Toast.showFailed(localized('upload_risk_tips'));
        }
      }
      delivered(
        seq: localId,
        sendStatus: SendStatus.fail,
        uploadRisk: uploadRisk,
      );
    });
  }

  void updateUploadProgress(String localId, double progress) {
    final index =
        state.data.indexWhere((element) => element.localId == localId);
    if (index != -1) {
      state.data[index].progress = progress * 100;
      imManager.msgUpdate.sink.add(localId);
    }
  }
}
