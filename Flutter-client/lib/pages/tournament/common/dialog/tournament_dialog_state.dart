// ignore_for_file: invalid_use_of_protected_member

part of 'tournament_dialog_logic.dart';

class TournamentDialogState {
  // ignore: prefer_final_fields
  RxList<TournamentModel> _list = <TournamentModel>[].obs;
  List<TournamentModel> get list => _list.value;
}
