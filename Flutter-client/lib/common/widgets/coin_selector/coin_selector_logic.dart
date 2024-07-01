import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';

class CoinSelectorLogic extends GetxController {
  CoinSelectorLogic(this.list);

  late GamingTextFieldController textFieldController =
      GamingTextFieldController(
    onChanged: _onChanged,
  );
  final _keyword = ''.obs;
  List<GamingCurrencyModel> list;
  late final displayList = list.obs;
  Worker? searchWorker;

  @override
  void onInit() {
    super.onInit();

    searchWorker = debounce<String>(
      _keyword,
      time: 1.seconds,
      _searchWithWord,
    );
  }

  void _searchWithWord(String v) {
    final searchResult = list
        .where((element) =>
            element.name?.toLowerCase().contains(v.toLowerCase()) == true ||
            element.currency?.toLowerCase().contains(v.toLowerCase()) == true)
        .toList();
    displayList.assignAll(searchResult);
  }

  void _onChanged(String v) {
    _keyword.value = v;
  }

  void select(GamingCurrencyModel selected) {
    textFieldController.textController.clear();
    Get.back(result: selected);
  }

  @override
  void onClose() {
    super.onClose();
    searchWorker?.dispose();
  }
}
