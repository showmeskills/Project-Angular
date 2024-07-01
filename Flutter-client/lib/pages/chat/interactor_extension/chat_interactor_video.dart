part of '../chat_interactor.dart';

extension ChatInteractorVideo on ChatInteractor {
  Stream<void> reSendVideo(ChatContentModel contentModel) {
    contentModel.progress = 0;
    contentModel.sendStatus = SendStatus.sending;
    contentModel.timestamp = DateTime.now().millisecondsSinceEpoch;
    sendMsgToScreen(contentModel);

    final localId = contentModel.localId;

    List<String> fids = [];
    contentModel.assets?.forEach((element) {
      if (element.fId != null) {
        fids.add(element.fId!);
      }
    });

    late Stream<IMRecieveModel?> sendStream;
    if (fids.length == 2) {
      contentModel.progress = 100;
      // 发送消息到IM
      IMSendModel sendModel = _sendVideoToIM(
        fids,
        contentModel,
        localId,
      );
      sendStream = _sendMsgToIM(sendModel);
    } else {
      final sourcePath = contentModel.localFileName;
      late Stream<File> saveStream;
      // 不在docuemnt目录下的文件需保存到document之后进行上传
      final inDocuemnt = sourcePath
          .contains(p.join(fileManager.subDirectory, FileType.video.value));
      if (inDocuemnt) {
        saveStream = Stream.value(File(sourcePath));
      } else {
        saveStream = fileManager.saveFileToLocalStorage(
          sourcePath,
          FileType.video,
          localId,
        );
      }
      sendStream = saveStream.flatMap((event) {
        return Rx.combineLatest2(
          upload(
            localId: 'image$localId',
            filePath: contentModel.assets!.first.coverUrl!,
          ),
          upload(localId: localId, filePath: event.path),
          (String a, String b) => [a, b],
        ).flatMap((fids) {
          // 发送消息到IM
          IMSendModel sendModel = _sendVideoToIM(fids, contentModel, localId);
          return _sendMsgToIM(sendModel);
        });
      });
    }
    sendStream.doOnError((p0, p1) {
      delivered(seq: localId, sendStatus: SendStatus.fail);
    }).listen(null, onError: (err) {});
    return Stream.value(null);
  }

  Stream<String?> sendVideo(String sourcePath) {
    final sourceFile = File(sourcePath);
    final contentModel = ChatContentModel.fromLocalFile(
      sourcePath: sourcePath,
      msgType: IMMsgType.video,
    );
    final localId = contentModel.localId;

    return _getVideoInfo(sourcePath, localId, sourceFile).flatMap((info) {
      if (info.length == 2 && info[0] is File && info[1] is VideoInfo) {
        // 消息先上屏幕
        _sendVideoToScreen(info, sourcePath, contentModel);

        // 视频保存到本地指定目录
        fileManager
            .saveFileToLocalStorage(sourcePath, FileType.video, localId)
            .doOnData((event) {
          // 刷新路径
          updateLocalFile(
            localId: localId,
            localFileName: event.path,
          );
          // 上传文件
          Rx.combineLatest2(
            upload(
              localId: localId,
              filePath: contentModel.assets!.first.coverUrl!,
              needUpdateUploadProgress: false,
            ),
            upload(localId: localId, filePath: event.path),
            (String a, String b) => [a, b],
          ).flatMap((fids) {
            // 发送消息到IM
            IMSendModel sendModel = _sendVideoToIM(fids, contentModel, localId);
            return _sendMsgToIM(sendModel);
          }).listen(null, onError: (Object err) {
            dev.log('im sendVideo faild err:$err', name: 'IMSocket');
            delivered(seq: localId, sendStatus: SendStatus.fail);
          });
        }).doOnError((p0, p1) {
          delivered(seq: localId, sendStatus: SendStatus.fail);
        }).listen(null, onError: (err) {});

        return Stream.value(null);
      } else {
        throw Exception('get video info failed');
      }
    });
  }

  IMSendModel _sendVideoToIM(
      List<String> fids, ChatContentModel contentModel, String localId) {
    final coverFid = fids[0];
    final videoFid = fids[1];
    final videoAsset = contentModel.assets![0];
    videoAsset.fId = videoFid;
    videoAsset.cover = coverFid;
    final coverAsset = contentModel.assets![1];
    coverAsset.fId = coverFid;

    final sendModel = imManager.getSendVideoModel(
      video: videoAsset,
      cover: coverAsset,
      createTime: contentModel.timestamp,
      seq: localId,
    );
    // 更新数据库assets字段
    updateLocalFile(
      localId: localId,
      localFileName: contentModel.localFileName,
      assets: contentModel.assets,
    );
    return sendModel;
  }

  void _sendVideoToScreen(
      List<Object?> info, String sourcePath, ChatContentModel contentModel) {
    final thumbnail = info[0] as File;
    final videoInfo = info[1] as VideoInfo;
    final videoAsset = IMAsset(
      type: p.extension(sourcePath).replaceAll('.', ''),
      width: videoInfo.width ?? 0,
      height: videoInfo.height ?? 0,
      size: videoInfo.filesize ?? 0,
      duration: (videoInfo.duration ?? 0) / 1000, //和web统一 毫秒专秒
      coverUrl: thumbnail.path,
    );
    final coverAsset = IMAsset(
      type: p.extension(thumbnail.path).replaceAll('.', ''),
      width: videoInfo.width ?? 0,
      height: videoInfo.height ?? 0,
    );
    contentModel.contentWidth = videoInfo.width ?? 0;
    contentModel.contentHeight = videoInfo.height ?? 0;
    contentModel.assets = [videoAsset, coverAsset];

    // 原始文件上屏、存数据库
    sendMsgToScreen(contentModel);
  }

  Stream<List<Object?>> _getVideoInfo(
      String sourcePath, String localId, File sourceFile) {
    return Rx.combineLatest2(
        fileManager
            .generateLocalPath(sourcePath, FileType.image, localId, '.jpg')
            .flatMap(
              (value) => MediaAssetUtils.getVideoThumbnail(
                sourceFile,
                quality: 60,
              ).asStream().flatMap(
                (thumbnail) {
                  if (thumbnail != null) {
                    return MediaAssetUtils.compressImage(thumbnail,
                            outputFile: value)
                        .asStream();
                  } else {
                    throw Exception('get video thumbnail failed');
                  }
                },
              ),
            ),
        MediaAssetUtils.getVideoInfo(sourceFile).asStream(),
        (File? a, VideoInfo b) => [a, b]);
  }
}
