import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_game_scenes_model.dart';

extension GameScenseHeaderMenuItemExtension on GameScenseHeaderMenuItem {
  void navigateTo({bool replace = false}) {
    final isReplace = replace && Get.currentRoute != Routes.main.route;
    if (redirectMethod == 'AssignGame') {
      if (isReplace) {
        Get.offNamed<void>(Routes.gamePlayReady.route,
            preventDuplicates: false,
            arguments: {
              'providerId': config?.assignGameProviderId ?? '',
              'gameId': config?.assignGameCode ?? '',
            });
      } else {
        Get.toNamed<void>(Routes.gamePlayReady.route, arguments: {
          'providerId': config?.assignGameProviderId ?? '',
          'gameId': config?.assignGameCode ?? '',
        });
      }
    } else if (redirectMethod == 'LabelPage') {
      if (isReplace) {
        Get.offNamed<void>(Routes.gameList.route,
            preventDuplicates: false,
            arguments: {
              'labelId': labelId ?? '',
            });
      } else {
        Get.toNamed<void>(Routes.gameList.route, arguments: {
          'labelId': labelId ?? '',
        });
      }
    } else if (redirectMethod == 'AssignProvider') {
      if (providerSetting?.secondaryPage ?? false) {
        if (isReplace) {
          Get.offNamed<dynamic>(Routes.providerGameList.route,
              preventDuplicates: false,
              arguments: {
                'providerId': config?.assignProviderId ?? '',
              });
        } else {
          Get.toNamed<dynamic>(Routes.providerGameList.route, arguments: {
            'providerId': config?.assignProviderId ?? '',
          });
        }
      } else {
        if (isReplace) {
          Get.offNamed<void>(Routes.gamePlayReady.route,
              preventDuplicates: false,
              arguments: {
                'providerId': config?.assignProviderId ?? '',
              });
        } else {
          Get.toNamed<void>(Routes.gamePlayReady.route, arguments: {
            'providerId': config?.assignProviderId ?? '',
          });
        }
      }
    } else if (redirectMethod == 'AssignUrl') {
      Map<String, dynamic> arguments = {};
      if (providerSetting?.secondaryPage ?? false) {
        arguments['secondaryPage'] = true;
      }
      UrlSchemeUtil.navigateTo(
        config?.assignAppUrl,
        extra: arguments,
        replace: replace,
      );
    }
  }
}

extension GameScenseLeftMenusExtension on GameScenseLeftMenus {
  void navigateTo({bool replace = false}) {
    final isReplace = replace && Get.currentRoute != Routes.main.route;
    if (redirectMethod == 'AssignGame') {
      if (isReplace) {
        Get.offNamed<void>(Routes.gamePlayReady.route,
            preventDuplicates: false,
            arguments: {
              'providerId': config?.assignGameProviderId ?? '',
              'gameId': config?.assignGameCode ?? '',
            });
      } else {
        Get.toNamed<void>(Routes.gamePlayReady.route, arguments: {
          'providerId': config?.assignGameProviderId ?? '',
          'gameId': config?.assignGameCode ?? '',
        });
      }
    } else if (redirectMethod == 'LabelPage') {
      if (isReplace) {
        Get.offNamed<void>(Routes.gameList.route,
            preventDuplicates: false,
            arguments: {
              'labelId': labelId ?? '',
            });
      } else {
        Get.toNamed<void>(Routes.gameList.route, arguments: {
          'labelId': labelId ?? '',
        });
      }
    } else if (redirectMethod == 'AssignProvider') {
      if (isReplace) {
        Get.offNamed<void>(Routes.providerGameList.route,
            preventDuplicates: false,
            arguments: {
              'providerId': config?.assignProviderId ?? '',
            });
      } else {
        Get.toNamed<void>(Routes.providerGameList.route, arguments: {
          'providerId': config?.assignProviderId ?? '',
        });
      }
    } else if (redirectMethod == 'AssignUrl') {
      UrlSchemeUtil.navigateTo(
        config?.assignAppUrl,
        replace: replace,
      );
    }
  }
}
