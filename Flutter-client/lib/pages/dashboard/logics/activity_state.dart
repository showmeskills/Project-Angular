part of 'activity_logic.dart';

class DashboardActivityState {
  final RxList<GamingActivityModel> _data = <GamingActivityModel>[].obs;
  List<GamingActivityModel> get data => _data;
}
