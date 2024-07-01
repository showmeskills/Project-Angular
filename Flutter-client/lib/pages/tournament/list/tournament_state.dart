part of 'tournament_logic.dart';

class TournamentState {
  final _data = TournamentListModel().obs;
  TournamentListModel get data => _data.value;
}
