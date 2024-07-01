part of 'game_order_logic.dart';

class DashboardGameOrderState {
  final _data = GoGamingPagination<GamingRecentOrderModel>().obs;
  GoGamingPagination<GamingRecentOrderModel> get data => _data.value;
}
