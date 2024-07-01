// ignore_for_file: invalid_use_of_protected_member

part of 'home_logic.dart';

class HomeState {
  final RxList<GamingBannerModel> _banner = <GamingBannerModel>[].obs;
  List<GamingBannerModel> get banner => _banner.value;

  final RxList<FooterLicenseModel> _footerLicense = <FooterLicenseModel>[].obs;
  List<FooterLicenseModel> get footerLicense => _footerLicense;

  final RxList<FooterModel> _footer = <FooterModel>[].obs;
  FooterModel? get _footerModel => _footer.isEmpty ? null : _footer.value.first;

  String? get disclaimer => _footerModel?.disclaimer?.disclaimer;

  Map<String, FooterMenuListModel> get footerMenu => _footerModel?.info ?? {};

  final RxList<GamingGameListByLabelModel> _game =
      <GamingGameListByLabelModel>[].obs;
  List<GamingGameListByLabelModel> get game => _game;

  final RxList<GamingGameHotMatchModel> _match =
      <GamingGameHotMatchModel>[].obs;
  List<GamingGameHotMatchModel> get match => _match;

  final RxnString _activeExpanded = RxnString();
  String? get activeExpanded => _activeExpanded.value;

  final loadSuccess = false.obs;
}
