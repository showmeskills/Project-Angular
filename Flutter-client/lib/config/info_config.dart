import 'package:base_framework/src.cache/rx_cache.dart';
import 'package:gogaming_app/common/utils/util.dart';

final _box = GetStorage();
const _key = "GGInfoConfig";

class InfoConfig {
  int isFirstStart;
  InfoConfig({
    this.isFirstStart = 0,
  });

  static InfoConfig get sharedInstance => _instance;

  static final _instance = () {
    final setting =
        InfoConfig.fromJson(_box.read<Map<String, dynamic>>(_key) ?? {});
    return setting;
  }();

  void async() {
    _box.write(_key, toJson());
  }

  factory InfoConfig.fromJson(Map<String, dynamic> json) {
    return InfoConfig(
      isFirstStart: GGUtil.parseInt(json["isFirstStart"]),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "isFirstStart": isFirstStart,
    };
  }
}
