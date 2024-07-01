part of 'appeal_logic.dart';

class AppealState {
  final _data = GoGamingPagination<GamingAppealModel>().obs;
  GoGamingPagination<GamingAppealModel> get data => _data.value;

  final RxnInt _type = RxnInt();
  int? get type => _type.value;
}
