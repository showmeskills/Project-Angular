import 'package:gogaming_app/controller_header.dart';

import '../../common/api/language/models/gaming_language.dart';
import '../../common/lang/locale_lang.dart';
import 'euro_theme_state.dart';

class EuroThemeLogic extends BaseController {
  final EuroThemeState state = EuroThemeState();

  @override
  void onInit() {
    super.onInit();

    state.isChinese.value = _isChinese;
    state.selectScheduleGroup.value =
        state.euro2024MatchSchedule?.keys.first ?? '';
  }

  bool get _isChinese {
    final locale = AppLocalizations.of(Get.context!).locale;
    final languageMap = GamingLanguage.localeConfig.firstWhereOrNull(
        (element) => locale.languageCode.contains(element["code"] ?? ""));
    final languageModel = GamingLanguage.fromJson(languageMap);
    return languageModel.languageCode == 'zh';
  }
}
