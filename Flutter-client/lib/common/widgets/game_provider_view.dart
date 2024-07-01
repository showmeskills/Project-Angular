import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_provider_model.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/home/views/home_swiper.dart';
import 'package:gogaming_app/widget_header.dart';

class GameProviderController extends GetxController {
  GameProviderController({required this.filterProviders});

  final bool filterProviders;

  List<GamingGameProviderModel> get provider {
    if (filterProviders == false) {
      return GameService().provider;
    }
    List<GamingGameProviderModel> allowShow = <GamingGameProviderModel>[];
    for (var element in GameService().provider) {
      for (var allowShowProvider
          in Config.sharedInstance.gameConfig.sortProviders) {
        if (element.category?.contains(allowShowProvider) ?? false) {
          allowShow.add(element);
          break;
        }
      }
    }
    return allowShow;
  }
}

class GameProviderView extends StatelessWidget {
  const GameProviderView({super.key, this.tag, bool filterProviders = false})
      : _filterProviders = filterProviders;

  final String? tag;
  final bool _filterProviders;

  List<GamingGameProviderModel> get provider => controller.provider;

  GameProviderController get controller =>
      Get.find<GameProviderController>(tag: tag ?? ObjectKey(key).toString());

  @override
  Widget build(BuildContext context) {
    Get.put(GameProviderController(filterProviders: _filterProviders),
        tag: tag ?? ObjectKey(key).toString(), permanent: true);
    return Obx(() {
      return HomeSwiper(
        iconName: R.homeTitle2,
        title: localized('game_pro'),
        total: provider.length,
        mainAxisCount: 3,
        aspectRatio: 0.4,
        onPressedTitle: () => Get.toNamed<dynamic>(Routes.providerList.route),
        builder: (context, index) {
          final url = provider[index].dayLogo;
          return ScaleTap(
            opacityMinValue: 0.8,
            scaleMinValue: 0.98,
            onPressed: () {
              if (provider[index].secondaryPage ?? false) {
                Get.toNamed<dynamic>(Routes.providerGameList.route, arguments: {
                  "providerId": provider[index].providerCatId,
                  "title": provider[index].providerName,
                });
              } else {
                Get.toNamed<void>(Routes.gamePlayReady.route, arguments: {
                  "providerId": provider[index].providerCatId,
                });
              }
            },
            child: Container(
              decoration: BoxDecoration(
                color: GGColors.providerBackground.color,
                borderRadius: BorderRadius.circular(4.dp),
              ),
              child: GamingImage.network(
                url: url,
                fit: BoxFit.cover,
                radius: 4.dp,
                width: double.infinity,
                height: double.infinity,
                color: Colors.white,
                colorBlendMode: BlendMode.srcIn,
              ),
            ),
          );
        },
      );
    });
  }
}
