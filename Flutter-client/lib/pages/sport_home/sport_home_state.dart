import 'package:gogaming_app/common/api/banner/models/gaming_banner_model.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/list_by_label_model.dart';
import 'package:gogaming_app/widget_header.dart';

class SportHomeState {
  final RxList<GamingGameListByLabelModel> data =
      <GamingGameListByLabelModel>[].obs;

  final RxList<GamingBannerModel> banner = <GamingBannerModel>[].obs;

  final loadSuccess = false.obs;

  final visible = true.obs;
}
