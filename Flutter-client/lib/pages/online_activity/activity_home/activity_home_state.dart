import '../../../common/api/base/base_api.dart';
import '../../../common/api/bonus/models/gaming_activity_model/gaming_activity_model.dart';
import '../../../common/lang/locale_lang.dart';

class ActivityHomeState {
  final RxList<GamingActivityModel> data = <GamingActivityModel>[].obs;
  final RxList<String> labelNames = <String>[].obs;
  final RxString selectLabelName = localized("all").obs;
  final RxBool isLoading = false.obs;
}
