import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/pages/base/page_state.dart';

import '../../common/api/base/go_gaming_api.dart';
import '../../common/lang/locale_lang.dart';

abstract class BaseController extends FullLifeCycleController {
  final logoutController = false.obs;

  dynamic callDataService<T>(
    GoGamingTarget target,
    T Function(Map<String, dynamic>) dataFactory, {
    void Function(dynamic error)? onError,
    void Function(T response)? onSuccess,
    String? errorMsg,
    bool ifShowLoading = false,
  }) {
    if (ifShowLoading) showLoading();
    PGSpi(target).rxRequest<T>(dataFactory).listen((event) {
      onSuccess?.call(event.data);
      hideLoading();
    }).onError((dynamic error) {
      hideLoading();
      onError?.call(error);
    });
  }

  String getLocalString(String jsonPath, {List<String>? params}) {
    return localized(jsonPath, params: params);
  }

  ///每个页面的状态变量
  final _pageSate = PageState.usual.obs;
  PageState get pageState => _pageSate.value;
  void showLoading() => updatePageState(PageState.loading);
  void updatePageState(PageState state) => _pageSate(state);
  void hideLoading() => updatePageState(PageState.usual);

  final _refreshController = false.obs;

  void refreshPage(bool refresh) => _refreshController(refresh);

  final _message = ''.obs;

  String get message => _message.value;

  void showMessage(String msg) => _message(msg);

  final _errorMessage = ''.obs;

  String get errorMessage => _errorMessage.value;

  void showErrorMessage(String msg) {
    _errorMessage(msg);
  }

  final _successMessage = ''.obs;

  String get successMessage => _successMessage.value;

  void showSuccessMessage(String msg) => _successMessage(msg);
}
