part of 'device_logic.dart';

class DashboardDeviceState {
  final _data = GoGamingPagination<GamingDeviceHistoryModel>().obs;
  GoGamingPagination<GamingDeviceHistoryModel> get data => _data.value;
}
