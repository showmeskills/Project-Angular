import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart' hide KeyboardListener;
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/common/service/im/models/im_connection_status.dart';
import 'package:gogaming_app/common/widgets/attachment_upload/attachment_upload.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:keyboard_utils_fork/keyboard_listener.dart';

import 'chat_interactor.dart';
import 'chat_state.dart';

/// 所有事件
abstract class ChatEventHanlder {
  void onRefresh();

  void onSendPressed();

  void resend(ChatContentModel model);

  void onStartPressed();

  void onPointerMove(PointerMoveEvent event);

  void showEmojiPicker();

  void onEmojiPressed(String emoji);

  void showExtension();

  void onFilePickerPressed();
  void onGalleryPickerPressed();

  void onOpenPdf(String url, String fileName);
}

class ChatPresenter extends BaseController implements ChatEventHanlder {
  ChatState get _state => _interactor.state;
  ChatViewState get viewState => _state;

  final _interactor = ChatInteractor();

  late final StreamSubscription<IMConnectionStatus>
      _connectionStatusSubscription;

  late final StreamSubscription<ChatContentModel> _recievedSubscription;

  late final StreamSubscription<bool> _userBanSub;

  late final StreamSubscription<String> _msgUpdateSubscription;

  late final int keyboardListener;

  @override
  void onInit() {
    super.onInit();
    _interactor.setup();
    _connectionStatusSubscription =
        _interactor.connectionStatus.listen((event) {
      _interactor.onConnectionStatusChange(event);
      update(['connection_status']);
      if (event.isConnected) {
        if (viewState.data.isEmpty) {
          _getChatHis();
        } else {
          _getOfflineHis();
        }
      }
    });
    _recievedSubscription = _interactor.recievedStream.listen((event) {
      // 是否要忽略滚动，如果数据为空，使用jump会出现异常
      final bool ignoreScroll = viewState.data.isEmpty;
      _interactor.received(event);
      update(['list']);
      if (viewState.listViewController.offset < Get.height / 3 &&
          !ignoreScroll) {
        viewState.listViewController.sliverController.jumpToIndex(0);
        setAllMagRead(check: false);
      }
    });
    _userBanSub = _interactor.userBanStream.listen((event) {
      _interactor.setUserBan(event);
      update(['input']);
    });
    keyboardListener = _state.keyboardUtils.add(
        listener: KeyboardListener(willHideKeyboard: () {
      _interactor.hideKeyboard();
      update(['input_safe_area']);
      // Your code here
    }, willShowKeyboard: (double keyboardHeight) {
      _interactor.setKeyboardHeight(keyboardHeight);
      _interactor.hideEmoji();
      _interactor.hideExtension();
      update(['input_safe_area']);
    }));
    onRefresh();
  }

  @override
  void onReady() {
    super.onReady();
    //不能在build时改变数据所以放在onready
    // 进入页面 标记全部已读
    _interactor.setAllMsgRead();

    viewState.listViewController.addListener(() {
      setAllMagRead(check: true);
    });

    _msgUpdateSubscription = _interactor.msgUpdateStream.listen((event) {
      if (event.isEmpty) {
        update(['list']);
      } else {
        update(['im_$event']);
      }
    });
  }

  @override
  void onClose() {
    super.onClose();
    _state.keyboardUtils.unsubscribeListener(subscribingId: keyboardListener);
    if (_state.keyboardUtils.canCallDispose()) {
      _state.keyboardUtils.dispose();
    }
    _connectionStatusSubscription.cancel();
    _recievedSubscription.cancel();
    _userBanSub.cancel();
    _msgUpdateSubscription.cancel();

    viewState.listViewController.dispose();
    viewState.refreshController.dispose();
    viewState.inputController.dispose();
  }

  @override
  void onRefresh() async {
    if (_interactor.endTime == null) {
      _getChatMsg();
    } else {
      _getChatHis();
    }
  }

  void _getChatMsg() {
    _interactor.getMsgInit().doOnData((event) {
      update(['list']);
      viewState.refreshController.loadComplete();
    }).listen(null, onError: (err) {});
  }

  void _getChatHis() {
    _interactor.getChatHis().doOnData((event) {
      update(['list']);
      viewState.refreshController.loadComplete();
    }).listen(null, onError: (err) {});
  }

  void _getOfflineHis() {
    _interactor.getOfflineHis().doOnData((event) {
      update(['list']);
      viewState.refreshController.loadComplete();
    }).listen(null, onError: (err) {});
  }

  @override
  void onSendPressed() async {
    void sendText(String text) {
      _interactor.sendText(text).doOnData((event) {
        if (event == null) {
          update(['list']);
        } else {
          // update(['im_$event']);
        }
      }).listen((event) {}, onError: (err) {});
    }

    final text = viewState.inputController.text.value;
    if (text.isEmpty) {
      return;
    } else if (text.length > 5000) {
      Toast.showFailed(localized('chat_msg_tolong', params: ['5000']));
      return;
    }
    sendText(text);
    // //debug
    // for (var element in ['1', '2', '3', '4', '5', '6', '7', '8']) {
    //   sendText('$text-$element');
    // }
  }

  @override
  void resend(ChatContentModel model) {
    _interactor.resend(model);
    update(['list']);
  }

  @override
  void onStartPressed() {
    _interactor.state.inChating = true;
    update(['input']);
  }

  @override
  void onPointerMove(PointerMoveEvent event) {
    _state.inputController.focusNode.unfocus();
  }

  @override
  void showEmojiPicker() {
    // 隐藏键盘
    _state.inputController.focusNode.unfocus();
    _interactor.showEmoji();
    update(['input_safe_area']);
  }

  @override
  void showExtension() {
    // 隐藏键盘
    _state.inputController.focusNode.unfocus();
    _interactor.showExtension();
    update(['input_safe_area']);
  }

  @override
  void onEmojiPressed(String emoji) {
    _interactor.insertEmoji(emoji);
  }

  /// check 是否检查在底部
  void setAllMagRead({bool check = false}) {
    if (_interactor.hasUnreadMsg) {
      //positions更新可能有延迟
      Future.delayed(const Duration(), () {
        if (check &&
            viewState.positions
                    .firstWhereOrNull((element) => element.index == 0) ==
                null) {
          return;
        }
        _interactor.setAllMsgRead();
      });
    }
    // positions.firstWhereOrNull((element) => element.index == 0) != null;
  }

  @override
  void onFilePickerPressed() {
    void sendFile(String filePath) {
      _interactor.sendFile(filePath).doOnData((event) {
        if (event == null) {
          update(['list']);
        } else {
          update(['im_$event']);
        }
      }).listen((event) {}, onError: (err) {});
    }

    // 暂时只支持发送pdf文件
    AttachmentPicker.pickFile(format: ['.pdf']).then((filePath) {
      if (filePath is String) {
        sendFile(filePath);
      }
    });
  }

  @override
  void onGalleryPickerPressed() {
    // 选择文件
    _showPickMethod().then((value) {
      if (value != null) {
        AttachmentPicker.pickMedia(
          method: PickMethod.gallery,
          type: value,
          format: value == AttachmentType.video
              ? [
                  '.mp4',
                  '.mov',
                ]
              : [
                  '.jpg',
                  '.jpeg',
                  '.png',
                  '.webp',
                  '.bmp',
                  '.gif',
                ],
          maxFileSize: (value == AttachmentType.video ? 100 : 5) * 1024 * 1024,
          imageQuality: 100,
        ).then((filePath) {
          // media_util获取图片宽高
          // _interactor 组装send image model
          if (filePath != null) {
            if (value == AttachmentType.image) {
              _interactor.sendImage(filePath).doOnData((event) {
                update(['list']);
              }).listen((event) {}, onError: (err) {});
            } else if (AttachmentType.video == value) {
              _interactor.sendVideo(filePath).doOnData((event) {
                update(['list']);
              }).listen((event) {}, onError: (err) {});
            }
          }
        });
      }
    });
  }

  Future<AttachmentType?> _showPickMethod() {
    return GamingSelector.simple<AttachmentType>(
      title: localized("sen_de"),
      useCloseButton: false,
      centerTitle: true,
      fixedHeight: false,
      original: [
        AttachmentType.image,
        AttachmentType.video,
      ],
      itemBuilder: (context, e, index) {
        return InkWell(
          onTap: () {
            Get.back<AttachmentType>(result: e);
          },
          child: SizedBox(
            height: 50.dp,
            child: Center(
              child: Text(
                e == AttachmentType.image
                    ? localized('up_file_i')
                    : localized('up_file_v'),
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
    );
  }

  @override
  void onOpenPdf(String url, String fileName) {
    Get.toNamed<void>(Routes.pdfViewer.route, arguments: {
      'pdfUrl': url,
      'fileName': fileName,
    });

    // // 安卓webview不支持pdf页面 调用系统浏览器打开pdf
    // if (Platform.isAndroid) {
    //   UrlSchemeUtil.openUrlWithBrowser(url);
    // } else {
    //   Get.toNamed<dynamic>(
    //     Routes.webview.route,
    //     arguments: {
    //       'link': url,
    //       'title': fileName,
    //     },
    //   );
    // }
  }
}
