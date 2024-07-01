// ignore_for_file: invalid_use_of_protected_member

part of 'wealth_source_certificate_logic.dart';

class WealthSourceCertificateState {
  late final _quota = () {
    Quota? value;
    return value.obs;
  }();
  Quota? get quota => _quota.value;
  final _quotaError = false.obs;
  bool get quotaError => _quotaError.value;

  final _wealthSource = <WealthSourceType>[].obs;
  List<WealthSourceType> get wealthSource => _wealthSource.value;

  final _statement = false.obs;
  bool get statement => _statement.value;

  final _loading = false.obs;
  bool get loading => _loading.value;

  late Map<WealthSourceType, AttachmentUploadController> controllers = () {
    return {
      for (var e in WealthSourceType.values)
        e: AttachmentUploadController(
          type: 'Kyc',
          pickMethod: [
            PickMethod.camera,
            PickMethod.gallery,
            PickMethod.fileLibrary,
          ],
          format: {
            AttachmentType.file: ['.pdf'],
          },
        )
    };
  }();

  bool get enable {
    final noupload =
        wealthSource.any((e) => controllers[e]!.attachments.isEmpty);
    return !noupload;
  }
}
