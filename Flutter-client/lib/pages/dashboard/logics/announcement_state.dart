part of 'announcement_logic.dart';

class DashboardAnnouncementState {
  final RxList<GamingAnnouncementModel> _data = <GamingAnnouncementModel>[].obs;
  List<GamingAnnouncementModel> get data => _data;
}
