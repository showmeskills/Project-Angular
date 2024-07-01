// ignore_for_file: invalid_use_of_protected_member

import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_scenes_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_scenes_model_extension.dart';
import 'package:gogaming_app/common/service/gaming_tag_service/gaming_tag_service.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gg_bar_navigation.dart';

class GGBarNavigationController extends GetxController
    with GetTickerProviderStateMixin {
  TabController? tabController;

  final _navigationMenus = <GameScenseLeftMenus>[].obs;
  List<GameScenseLeftMenus> get navigationMenus => _navigationMenus.value;

  final selectedMenuIndex = RxInt(-1);

  final _menuTag = 'second_menu';

  @override
  void onInit() {
    super.onInit();
    final cache = GamingTagService.sharedInstance.cache;
    cache.getBox!().listenKey(cache.key, (value) {
      init();
    });
    init();
  }

  void init() {
    _navigationMenus.value =
        GamingTagService.sharedInstance.scenseModel?.navigationMenus ?? [];
    tabController = TabController(
      length: navigationMenus.length,
      vsync: this,
    );
  }

  void selectMenu(BuildContext targetContext, int index) {
    final e = navigationMenus[index];
    tabController?.animateTo(index,
        duration: const Duration(milliseconds: 200));
    if (e.infoExpandList?.isNotEmpty ?? false) {
      Future.delayed(const Duration(milliseconds: 250), () {
        selectedMenuIndex.value = index;
        showSecondMenu(targetContext);
      });
    } else {
      e.navigateTo(replace: true);
    }
  }

  /// 展开二级菜单
  void showSecondMenu(BuildContext targetContext) {
    final width = targetContext.size!.width;
    SmartDialog.showAttach<dynamic>(
      targetContext: targetContext,
      tag: _menuTag,
      usePenetrate: false,
      alignment: AlignmentDirectional.bottomCenter,
      clickMaskDismiss: true,
      maskColor: Colors.transparent,
      builder: (_) {
        return GGBarSecondNavigationView(
          width: width,
          items: navigationMenus[selectedMenuIndex.value].infoExpandList ?? [],
        );
      },
      onDismiss: () {
        selectedMenuIndex.value = -1;
      },
    );
  }

  void closeSecondMenu() {
    SmartDialog.dismiss<void>(tag: _menuTag);
  }

  @override
  void onClose() {
    super.onClose();

    tabController?.dispose();
  }
}
