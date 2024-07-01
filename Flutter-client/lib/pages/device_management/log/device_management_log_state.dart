part of 'device_management_log_logic.dart';

class DeviceManagementLogState {
  final _data = GoGamingPagination<GamingDeviceLogModel>().obs;
  GoGamingPagination<GamingDeviceLogModel> get data => _data.value;
}
