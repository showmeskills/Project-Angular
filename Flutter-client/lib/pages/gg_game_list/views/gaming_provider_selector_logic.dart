import 'package:base_framework/base_controller.dart';

import '../../../common/api/game/models/gaming_game_provider_model.dart';

class GamingSelectProviderLogic extends GetxController {
  final providers = <GamingGameProviderModel>[].obs;
  final RxList<String> selectProviderIds = <String>[].obs;

  late void Function(List<String> selectProviderIds) complete;

  void selectProvider(String providerId) {
    if (selectProviderIds.contains(providerId)) {
      selectProviderIds.remove(providerId);
    } else {
      selectProviderIds.add(providerId);
    }
    providers.refresh();
  }

  void clearAll() {
    selectProviderIds.clear();
    providers.refresh();
  }

  @override
  void onClose() {
    complete.call(selectProviderIds);
    super.onClose();
  }
}
