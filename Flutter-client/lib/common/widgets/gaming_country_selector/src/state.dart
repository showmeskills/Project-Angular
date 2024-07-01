part of gaming_country_selector;

class _GamingCountrySelectorState {
  List<GamingCountryModel> data;
  List<GamingCountryModel> original;

  _GamingCountrySelectorState({
    this.original = const [],
    this.data = const [],
  });

  factory _GamingCountrySelectorState.init({
    List<GamingCountryModel> original = const [],
  }) {
    return _GamingCountrySelectorState(
      data: original,
      original: original,
    );
  }
}
