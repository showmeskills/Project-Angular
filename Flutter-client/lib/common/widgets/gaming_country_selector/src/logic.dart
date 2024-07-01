// ignore_for_file: library_private_types_in_public_api

part of gaming_country_selector;

class CountrySelectorLogic extends GetxController
    with SingleRenderControllerMixin {
  late final _state = _GamingCountrySelectorState.init(
    original: CountryService.sharedInstance.countryList,
  ).obs;
  _GamingCountrySelectorState get state => _state.value;

  late final SingleRenderViewController _controller =
      SingleRenderViewController(
    autoLoadData: state.original.isEmpty,
  );
  @override
  SingleRenderViewController get controller => _controller;

  late GamingTextFieldController textFieldController;

  final _keyword = ''.obs;

  @override
  void onInit() {
    super.onInit();
    textFieldController = GamingTextFieldController(
      onChanged: _onChanged,
    );
    debounce<String>(_keyword, (v) {
      if (controller.state.renderState == RenderState.failed ||
          controller.state.renderState == RenderState.loading) return;
      List<GamingCountryModel> data = _state.value.original;
      if (v.isNotEmpty) {
        data = _state.value.original
            .where((element) =>
                element.name.toLowerCase().contains(v.toLowerCase()) ||
                element.areaCode.contains(v))
            .toList();
      }
      _state.update((val) {
        val?.data = data;
      });
      loadCompleted(
        state: data.isEmpty ? LoadState.empty : LoadState.successful,
      );
    });
  }

  @override
  void Function() get onLoadData => () {
        loadCompleted(
          state: LoadState.loading,
        );
        PGSpi(Country.getCountry.toTarget())
            .rxRequest<List<GamingCountryModel>>((value) {
          return (value['data'] as List)
              .map((e) => GamingCountryModel.fromMap(e as Map<String, dynamic>))
              .toList();
        }).listen((event) {
          _state.update((val) {
            val?.data = event.data;
            val?.original = event.data;
          });
          loadCompleted(
            state: LoadState.successful,
          );
        }).onError((Object error) {
          // TODO: 错误处理
          loadCompleted(
            state: LoadState.failed,
          );
        });
      };

  void _onChanged(String v) {
    _keyword.value = v;
  }

  void select(GamingCountryModel selected) {
    textFieldController.textController.clear();
    Get.back(result: selected);
  }
}
