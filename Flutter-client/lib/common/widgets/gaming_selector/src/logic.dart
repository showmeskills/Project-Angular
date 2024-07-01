part of gaming_selector;

typedef GamingSelectorOnLoad<T> = Stream<List<T>> Function();

typedef GamingSelectorOnSearch<T> = Stream<List<T>> Function(
  String keyword,
  List<T> original,
);

typedef GamingSelectorItemBuilder<T> = Widget Function(
  BuildContext context,
  T e,
  int index,
);
typedef GamingSelectorItemOnTap<T> = void Function(
  T e,
  int index,
);

class GamingSelectorController<T> extends GamingSelectorControllerImp<T> {
  GamingSelectorController({
    GamingSelectorOnLoad<T>? onLoadDataStream,
    GamingSelectorOnSearch<T>? onSearchDataStream,
    List<T> original = const [],
  })  : _onLoadDataStream = onLoadDataStream,
        _onSearchDataStream = onSearchDataStream,
        super(original: original);

  final GamingSelectorOnLoad<T>? _onLoadDataStream;
  final GamingSelectorOnSearch<T>? _onSearchDataStream;

  @override
  GamingSelectorOnLoad<T>? get onLoadDataStream => _onLoadDataStream;

  @override
  GamingSelectorOnSearch<T>? get onSearchDataStream => _onSearchDataStream;

  @override
  void select(int index) {
    textFieldController.textController.clear();
    Get.back(result: _list[index]);
  }
}

abstract class GamingSelectorControllerImp<T> extends _GamingSelectorData<T>
    with _GamingSelectorSearchMixin<T> {
  GamingSelectorControllerImp({List<T> original = const []})
      : super(original: original);

  @override
  void Function() get onLoadData => () {
        if (onLoadDataStream != null) {
          loadCompleted(state: LoadState.loading);
          onLoadDataStream!().doOnData((event) {
            loadCompleted(
                state: event.isEmpty ? LoadState.empty : LoadState.successful);
            _list.assignAll(event);
            original = event;
          }).doOnError((p0, p1) {
            loadCompleted(state: LoadState.failed);
          }).listen(null, onError: (p0, p1) {});
        }
      };

  void select(int index);
}

abstract class _GamingSelectorData<T> extends GetxController
    with SingleRenderControllerMixin, BaseSingleRenderViewDelegate {
  _GamingSelectorData({
    this.original = const [],
  }) {
    _list.assignAll(original);
  }

  List<T> original;
  final RxList<T> _list = <T>[].obs;
  List<T> get list => _list;

  int get count => list.length;

  late final SingleRenderViewController _controller =
      SingleRenderViewController(
    autoLoadData: onLoadDataStream != null,
    initialState: onLoadDataStream == null
        ? original.isEmpty
            ? RenderState.empty
            : RenderState.successful
        : null,
  );

  @override
  SingleRenderViewController get controller => _controller;
  GamingSelectorOnLoad<T>? get onLoadDataStream;

  @override
  SingleRenderViewController get renderController => controller;
}

mixin _GamingSelectorSearchMixin<T> on _GamingSelectorData<T> {
  late GamingTextFieldController textFieldController =
      GamingTextFieldController(
    onChanged: allowSearch ? (v) => _keyword.value = v : null,
  );

  final _keyword = ''.obs;

  bool get allowSearch => onSearchDataStream != null;

  Stream<List<T>> Function(String, List<T>)? get onSearchDataStream => null;

  @override
  void onInit() {
    super.onInit();
    if (allowSearch) {
      debounce<String>(_keyword, (v) {
        if (controller.state.renderState == RenderState.failed ||
            controller.state.renderState == RenderState.loading) return;
        onSearchDataStream!(v, original).doOnData((event) {
          loadCompleted(
            state: event.isEmpty ? LoadState.empty : LoadState.successful,
          );
          _list.assignAll(event);
          update();
        }).listen(null, onError: (p0, p1) {});
      });
    }
  }
}
