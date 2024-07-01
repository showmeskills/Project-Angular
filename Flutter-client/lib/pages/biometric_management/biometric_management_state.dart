// ignore_for_file: invalid_use_of_protected_member

part of 'biometric_management_logic.dart';

class BiometricManagementState {
  final _data = <BiometricModel>[].obs;
  List<BiometricModel> get data => _data.value;

  bool get activated => data.any((element) => element.isCurrentDevice ?? false);
}
