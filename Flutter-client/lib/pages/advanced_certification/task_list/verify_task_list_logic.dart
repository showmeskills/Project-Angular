import 'package:gogaming_app/common/api/risk_form/models/verify_list_model.dart';
import 'package:gogaming_app/common/api/risk_form/risk_form_api.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/controller_header.dart';

class VerifyTaskListLogic extends BaseController {
  final list = <VerifyListModel>[].obs;
  final isLoading = false.obs;

  void loadData() {
    isLoading.value = true;
    PGSpi(RiskFormApi.queryAuthentication.toTarget())
        .rxRequest<List<VerifyListModel>>((value) {
      final data = value['data'];
      if (data is List) {
        return data
            .map((e) =>
                VerifyListModel.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      } else {
        return [];
      }
    }).listen((event) {
      isLoading.value = false;
      if (event.success) {
        list.assignAll(event.data);
      }
    }, onError: (Object e) {
      isLoading.value = false;
      if (e is GoGamingResponse) {
        Toast.showFailed(e.message);
      } else {
        Toast.showTryLater();
      }
    });
  }

  VerifyListModel? firstNotPassVerify() {
    return list.firstWhereOrNull((p) => p.isAuthentication == false);
  }

  VerifyListModel? lastPassVerify() {
    return list.reversed
        .toList()
        .firstWhereOrNull((p) => p.isAuthentication == true);
  }

  bool isAllPass() {
    return list.isNotEmpty && list.last.isAuthentication == true;
  }
}
