part of 'full_certificate_logic.dart';

class FullCertificateState {
  final _step = 0.obs;
  int get step => _step.value;

  final RxnString _idCardFront = RxnString();
  final RxnString _idCardBack = RxnString();

  final _bankCardRecord = <String>[].obs;
  final _cryptoWalletRecord = <String>[].obs;

  final RxnString _personalDeclarationVideo = RxnString();
  String? get personalDeclarationVideo => _personalDeclarationVideo.value;

  bool get enable {
    if (step == 0) {
      return _idCardFront.value != null && _idCardBack.value != null;
    } else if (step == 1) {
      return _bankCardRecord.isNotEmpty && _cryptoWalletRecord.isNotEmpty;
    } else {
      return _personalDeclarationVideo.value != null;
    }
  }

  final _loading = false.obs;
  bool get loading => _loading.value;
}
