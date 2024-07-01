import 'package:flutter/widgets.dart';
import 'package:flutter_list_view/flutter_list_view.dart';
import 'package:gogaming_app/common/service/im/models/chat_content_model.dart';
import 'package:gogaming_app/common/service/im/models/im_connection_status.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:keyboard_utils_fork/keyboard_utils.dart';

/// 页面需要的数据
abstract class ChatViewState {
  RefreshController get refreshController;
  FlutterListViewController get listViewController;
  GamingTextFieldController get inputController;

  List<ChatContentModel> get data;

  bool get hasPermission;
  bool get inChating;
  List<FlutterListViewItemPosition> get positions;

  IMConnectionStatus get connectionStatus;

  bool get showExtension;

  bool get showEmoji;

  double get inputSafeArea;
}

class ChatState implements ChatViewState {
  @override
  final RefreshController refreshController = RefreshController(
    initialLoadStatus: LoadStatus.loading,
  );

  @override
  final FlutterListViewController listViewController =
      FlutterListViewController();

  @override
  late final GamingTextFieldController inputController =
      GamingTextFieldController(
    showClearIcon: false,
    validator: [
      GamingTextFieldValidator.length(min: 1),
    ],
    onFocus: (hasFocus) {
      if (hasFocus && data.isNotEmpty) {
        listViewController.sliverController.animateToIndex(
          0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      }
    },
  );

  KeyboardUtils keyboardUtils = KeyboardUtils();

  @override
  IMConnectionStatus connectionStatus = IMConnectionStatus.init;

  @override
  List<ChatContentModel> data = [];

  @override
  bool hasPermission = true;
  @override
  bool inChating = true;

  @override
  List<FlutterListViewItemPosition> positions = [];

  @override
  bool showExtension = false;

  @override
  bool showEmoji = false;

  double keyboardHeight = 0;

  @override
  double get inputSafeArea {
    if (showEmoji) {
      return 180.dp;
    }
    if (showExtension) {
      return 50.dp;
    }
    return keyboardHeight;
  }
}
