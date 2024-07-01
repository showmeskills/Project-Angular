part of 'tournament_detail_logic.dart';

class TournamentDetailState {
  late final _data = () {
    TournamentModel? model;
    return model.obs;
  }();
  TournamentModel? get data => _data.value;

  final _size = 10.obs;
  int get size => _size.value;

  final _rankLoading = false.obs;
  bool get rankLoading => _rankLoading.value;
}
