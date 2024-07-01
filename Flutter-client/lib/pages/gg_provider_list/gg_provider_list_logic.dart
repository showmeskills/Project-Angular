import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:gogaming_app/controller_header.dart';

import '../../common/api/game/game_api.dart';
import '../../common/api/game/models/gaming_game_provider_model.dart';
import '../../common/service/game_service.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';

class GGProviderListLogic extends BaseController with RefreshControllerMixin {
  @override
  LoadCallback? get onRefresh => (p) {
        refreshCompleted(
          state: LoadState.loading,
        );
        Rx.combineLatestList([
          _loadProvider(),
        ]).listen((event) {
          refreshCompleted(
            state: LoadState.successful,
            hasMoreData: false,
          );
        }).onError((Object err) {
          if (err is GoGamingResponse) {
            Toast.showFailed(err.message);
          } else {
            Toast.showTryLater();
          }
          refreshCompleted(
            state: LoadState.failed,
            hasMoreData: false,
          );
        });
      };

  Stream<List<GamingGameProviderModel>> _loadProvider() {
    return GameService().loadProvider();
  }

  void pressProvider(GamingGameProviderModel item) {
    if (item.secondaryPage ?? false) {
      Get.offAndToNamed<dynamic>(Routes.providerGameList.route, arguments: {
        "providerId": item.providerCatId,
        "title": item.providerName,
        'type': GameSortType.provider,
      });
    } else {
      Get.offAndToNamed<void>(Routes.gamePlayReady.route, arguments: {
        "providerId": item.providerCatId,
      });
    }
  }
}
