part of 'currency_appeal_submit_logic.dart';

class CurrencyAppealSubmitState {
  final _txInfo = () {
    GamingTxInfoModel? model;
    return model.obs;
  }();
  GamingTxInfoModel? get txInfo => _txInfo.value;

  final _detail = () {
    GamingCurrencyAppealDetailModel? model;
    return model.obs;
  }();
  GamingCurrencyAppealDetailModel? get detail => _detail.value;

  final _images = <String>[].obs;
  List<String> get images => _images;

  final _video = ''.obs;
  String get video => _video.value;

  final _uploading = false.obs;
  bool get uploading => _uploading.value;

  final _canEditAmount = false.obs;
  bool get canEditAmount => _canEditAmount.value;

  final _enable = false.obs;
  bool get enable {
    final bool needVideo = detail?.needUploadVideo ?? false;
    return _enable.value && (needVideo ? video.isNotEmpty : images.isNotEmpty);
  }

  final _uploadMissing = false.obs;
  bool get uploadMissing => _uploadMissing.value;

  final _loading = false.obs;
  bool get loading => _loading.value;
}
