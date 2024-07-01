part of '../chat_interactor.dart';

extension ChatInteractorFileExtension on ChatInteractor {
  Stream<void> reSendFile(ChatContentModel contentModel) {
    contentModel.progress = 0;
    contentModel.sendStatus = SendStatus.sending;
    contentModel.timestamp = DateTime.now().millisecondsSinceEpoch;
    sendMsgToScreen(contentModel);

    final localId = contentModel.localId;
    final sourcePath = contentModel.localFileName;
    final fileName =
        p.basename(contentModel.assets?.first.fileName ?? sourcePath);
    final ext = p.extension(fileName);

    final fid = contentModel.assets?.first.fId;
    late Stream<IMRecieveModel?> sendStream;
    if (fid?.isNotEmpty ?? false) {
      contentModel.progress = 100;
      final sendModel = imManager.getSendFileModel(
        localId,
        fid!,
        contentModel.assets?.first.size ?? 0,
        fileName,
        ext.replaceAll('.', ''),
      );
      sendStream = _sendMsgToIM(sendModel);
    } else {
      late Stream<List<Object>> saveStream;
      // 不在docuemnt目录下的文件需保存到document之后进行上传
      final inDocuemnt = sourcePath
          .contains(p.join(fileManager.subDirectory, FileType.file.value));
      if (inDocuemnt) {
        saveStream =
            Stream.value([contentModel.assets?.first.size ?? 0, sourcePath]);
      } else {
        saveStream = fileManager
            .saveFileToLocalStorage(sourcePath, FileType.file, localId)
            .flatMap((event) {
          // 获取文件大小等信息
          return event.length().asStream().flatMap((size) {
            return Stream.value([size, event.path]);
          });
        });
      }
      sendStream = saveStream.flatMap((event) {
        return uploadFileMsgAsset(
          localId: localId,
          fileName: fileName,
          ext: ext,
          size: event[0] as int,
          filePath: event[1] as String,
          asset: contentModel.assets!.first,
        );
      });
    }
    sendStream.doOnData((event) {
      if (event?.assets != null) {
        updateAssets(
          localId: localId,
          assets: event!.assets!,
        );
      }
    }).doOnError((p0, p1) {
      delivered(seq: localId, sendStatus: SendStatus.fail);
    }).listen((value) {}, onError: (err) {});

    return Stream.value(null);
  }

  Stream<String?> sendFile(String sourcePath) {
    final fileName = p.basename(sourcePath);
    final ext = p.extension(sourcePath);
    final contentModel = ChatContentModel.fromLocalFile(
      sourcePath: sourcePath,
      msgType: IMMsgType.file,
      assets: [
        IMAsset(
          type: ext.replaceAll('.', ''),
          name: fileName,
        ),
      ],
    );
    // 原始文件上屏、存数据库
    sendMsgToScreen(contentModel);
    final localId = contentModel.localId;

    fileManager
        .saveFileToLocalStorage(sourcePath, FileType.file, localId)
        .flatMap((event) {
      // 获取文件大小等信息
      return event.length().asStream().flatMap((size) {
        return Stream.value([size, event.path]);
      });
    }).doOnData((event) {
      final localFileName = event[1] as String;
      final size = event[0] as int;
      final asset = contentModel.assets!.first.copyWith(
        size: event[0] as int,
      );
      updateLocalFile(
        localId: localId,
        localFileName: localFileName,
        assets: [asset],
      );
      imManager.msgUpdate.sink.add(localId);

      upload(localId: localId, filePath: localFileName).flatMap((value) {
        // 上传成功后，修改sendmodel中的localFile，存入数据库开始发送
        final sendModel = imManager.getSendFileModel(
          localId,
          value,
          size,
          fileName,
          ext.replaceAll('.', ''),
        );
        asset.fId = value;
        updateLocalFile(
          localId: localId,
          assets: [asset],
          localFileName: localFileName,
          contentText: sendModel.content,
        );
        return _sendMsgToIM(sendModel);
      }).listen((value) {
        if (value?.assets != null) {
          updateAssets(
            localId: localId,
            assets: value!.assets!,
          );
        }
      }, onError: (err) {
        delivered(seq: localId, sendStatus: SendStatus.fail);
      });
    }).doOnError((p0, p1) {
      delivered(seq: localId, sendStatus: SendStatus.fail);
    }).listen(null, onError: (Object err) {
      dev.log('im sendFile faild err:$err', name: 'IMSocket');
    });

    return Stream.value(null);
  }

  Stream<IMRecieveModel?> uploadFileMsgAsset({
    required String localId,
    required String fileName,
    required String ext,
    required int size,
    required String filePath,
    required IMAsset asset,
  }) {
    final localFileName = filePath;
    final newAsset = asset.copyWith(
      size: size,
    );
    updateLocalFile(
      localId: localId,
      localFileName: filePath,
      assets: [newAsset],
    );
    imManager.msgUpdate.sink.add(localId);

    return upload(localId: localId, filePath: filePath).flatMap((value) {
      // 上传成功后，修改sendmodel中的localFile，存入数据库开始发送
      final sendModel = imManager.getSendFileModel(
        localId,
        value,
        size,
        fileName,
        ext.replaceAll('.', ''),
      );
      newAsset.fId = value;
      updateLocalFile(
        localId: localId,
        assets: [newAsset],
        localFileName: localFileName,
        contentText: sendModel.content,
      );
      return _sendMsgToIM(sendModel);
    });
  }
}
