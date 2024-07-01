part of '../chat_interactor.dart';

extension ChatInteractorImageExtension on ChatInteractor {
  Stream<void> reSendImage(ChatContentModel contentModel) {
    contentModel.progress = 0;
    contentModel.sendStatus = SendStatus.sending;
    contentModel.timestamp = DateTime.now().millisecondsSinceEpoch;
    sendMsgToScreen(contentModel);

    final localId = contentModel.localId;
    final fid = contentModel.assets?.first.fId;

    late Stream<IMRecieveModel?> sendStream;
    if (fid?.isNotEmpty ?? false) {
      contentModel.progress = 100;
      sendStream = _sendImageMsg(
        seq: localId,
        createTime: contentModel.timestamp,
        asset: contentModel.assets!.first,
      );
    } else {
      final sourcePath = contentModel.localFileName;
      late Stream<ImageInfo> compressStream;
      // 已经在docuemnt目录下的文件，直接上屏
      final inDocuemnt = sourcePath
          .contains(p.join(fileManager.subDirectory, FileType.image.value));
      if (inDocuemnt) {
        compressStream = Stream.value(ImageInfo(
          path: sourcePath,
          width: contentModel.assets?.first.width?.toInt(),
          height: contentModel.assets?.first.height?.toInt(),
          filesize: contentModel.assets?.first.size?.toInt(),
        ));
      } else {
        compressStream = compressImage(
          localId: localId,
          sourcePath: sourcePath,
        );
      }
      // 文件压缩并保存到本地指定目录
      sendStream = compressStream.flatMap((event) {
        return uploadImageAsset(
          localId: localId,
          event: event,
          createTime: contentModel.timestamp,
        );
      });
    }

    sendStream.doOnError((p0, p1) {
      delivered(seq: localId, sendStatus: SendStatus.fail);
    }).listen(null, onError: (err) {});
    return Stream.value(null);
  }

  Stream<void> sendImage(String sourcePath) {
    return _sendImageMsgToScreen(sourcePath).flatMap((contentModel) {
      final localId = contentModel.localId;

      // 文件压缩并保存到本地指定目录
      compressImage(
        localId: localId,
        sourcePath: sourcePath,
      ).flatMap((event) {
        return uploadImageAsset(
          localId: localId,
          event: event,
          createTime: contentModel.timestamp,
        );
      }).doOnError((p0, p1) {
        delivered(seq: localId, sendStatus: SendStatus.fail);
      }).listen(null, onError: (err) {});

      return Stream.value(null);
    });
  }

  Stream<IMRecieveModel?> uploadImageAsset({
    required String localId,
    required ImageInfo event,
    required num createTime,
  }) {
    return upload(localId: localId, filePath: event.path).flatMap((value) {
      // 上传成功后，存入数据库开始发送
      final asset = IMAsset(
        fId: value,
        type: p.extension(event.path).replaceAll('.', ''),
        width: event.width,
        height: event.height,
        size: event.filesize ?? 0,
      );
      // 更新数据库assets字段
      updateAssets(localId: localId, assets: [asset]);

      return _sendImageMsg(
        seq: localId,
        createTime: createTime,
        asset: asset,
      );
    });
  }

  Stream<ChatContentModel> _sendImageMsgToScreen(String sourcePath) {
    final sourceFile = File(sourcePath);
    return MediaAssetUtils.getImageInfo(sourceFile).asStream().flatMap((info) {
      if (info.width != null && info.height != null) {
        final contentModel = ChatContentModel.fromLocalFile(
          sourcePath: sourcePath,
          msgType: IMMsgType.image,
          assets: [
            IMAsset(
              type: p.extension(sourcePath).replaceAll('.', ''),
              width: info.width,
              height: info.height,
              size: info.filesize ?? 0,
            ),
          ],
        );

        // 原始文件上屏、存数据库
        return Stream.value(sendMsgToScreen(contentModel));
      } else {
        throw Exception('get image info failed');
      }
    });
  }

  Stream<IMRecieveModel?> _sendImageMsg({
    required String seq,
    required num createTime,
    required IMAsset asset,
  }) {
    final sendModel = imManager.getSendImageModel(
      asset: asset,
      createTime: createTime,
      seq: seq,
    );

    return _sendMsgToIM(sendModel);
  }

  Stream<ImageInfo> compressImage({
    required String localId,
    required String sourcePath,
  }) {
    final sourceFile = File(sourcePath);
    late Stream<File?> stream;

    final ext = p.extension(sourcePath);
    if (ext.toLowerCase() == '.gif') {
      stream = fileManager.saveFileToLocalStorage(
          sourcePath, FileType.image, localId);
    } else {
      stream = fileManager
          .generateLocalPath(sourcePath, FileType.image, localId)
          .flatMap((event) {
        // 压缩
        return MediaAssetUtils.compressImage(
          sourceFile,
          outputFile: event,
        ).asStream();
      });
    }
    return stream.flatMap((file) {
      if (file != null) {
        // 获取文件宽高、旋转角度等信息
        return MediaAssetUtils.getImageInfo(file).asStream().flatMap((info) {
          if (info.width != null && info.height != null) {
            return Stream.value(info);
          } else {
            throw Exception('get image info failed');
          }
        });
      } else {
        throw Exception('compress image failed');
      }
    }).doOnData((event) {
      // 文件处理完成后，更新数据库中的localFile字段
      updateLocalFile(
        localId: localId,
        localFileName: event.path,
      );
    });
  }
}
