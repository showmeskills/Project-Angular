part of 'device_management_logic.dart';

class DeviceManagementState {
  final _data = GoGamingPagination<GamingDeviceHistoryModel>().obs;
  GoGamingPagination<GamingDeviceHistoryModel> get data => _data.value;
}
