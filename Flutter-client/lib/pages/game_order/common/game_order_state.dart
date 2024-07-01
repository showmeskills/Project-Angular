part of 'base_game_order_logic.dart';

abstract class IGameOrderState<T> {
  final _dateRange = GamingDateRange.today(true).obs;
  GamingDateRange get dateRange => _dateRange.value;
  set dateRange(GamingDateRange v) {
    if (dateRange != v) {
      _dateRange.value = v;
    }
  }

  final _status = GamingWagerStatusModel.all().obs;
  GamingWagerStatusModel get status => _status.value;
  set status(GamingWagerStatusModel v) {
    if (status != v) {
      _status.value = v;
    }
  }

  GamingWagerDayTotalModel? _totalModel;
  late final _total = _totalModel.obs;
  GamingWagerDayTotalModel? get total => _total.value;
  set total(GamingWagerDayTotalModel? v) {
    _totalModel = v;
    _total.value = v;
  }

  final _dayTotal =
      <GamingWagerDayTotalStatModel, GameOrderDayItemState<T>>{}.obs;
  Map<GamingWagerDayTotalStatModel, GameOrderDayItemState<T>> get dayTotal =>
      _dayTotal;
  set dayTotal(Map<GamingWagerDayTotalStatModel, GameOrderDayItemState<T>> v) {
    _dayTotal.value = v;
  }
}

class GameOrderDayItemState<T> {
  int page = 1;
  int pageSize = 10;
  final _isLoading = false.obs;
  bool get isLoading => _isLoading.value;
  set isLoading(bool v) {
    _isLoading.value = v;
  }

  final _loaded = false.obs;
  bool get loaded => _loaded.value;
  set loaded(bool v) {
    _loaded.value = v;
  }

  bool get isRefresh => !loaded && isLoading;

  late final _data = GoGamingPagination<T>().obs;
  GoGamingPagination<T> get data => _data.value;
  set data(GoGamingPagination<T> v) {
    _data.value = v;
  }

  final ExpandableController expandableController = ExpandableController();
}
