part of 'account_activity_base_logic.dart';

abstract class IAccountActivityState {
  final _dateRange = GamingDateRange.month().obs;
  GamingDateRange get dateRange => _dateRange.value;

  final _status = AccountActivityStatus.all.obs;
  AccountActivityStatus get status => _status.value;

  final _data = GoGamingPagination<GamingAccountActivityModel>().obs;
  GoGamingPagination<GamingAccountActivityModel> get data => _data.value;
  set data(GoGamingPagination<GamingAccountActivityModel> v) {
    if (data != v) {
      _data.value = v;
    }
  }
}
