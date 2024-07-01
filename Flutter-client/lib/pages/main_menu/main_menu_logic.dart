import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/activity/activity_api.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_list_model.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/game/game_api.dart';
import 'package:gogaming_app/common/api/bonus/bonus_api.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_scenes_model_extension.dart';
import 'package:gogaming_app/common/api/lucky_spin/lucky_spin_api.dart';
import 'package:gogaming_app/common/service/language_service.dart';
import 'package:gogaming_app/common/service/restart_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/pages/main_menu/game_category.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/api/bonus/models/gaming_daily_contest_model/gaming_daily_contest_model.dart';
import '../../common/api/game/models/gaming_game_scenes_model.dart';
import '../../common/api/language/models/gaming_language.dart';
import '../../common/api/lucky_spin/models/game_lucky_spin_information_model.dart';
import '../../common/service/account_service.dart';
import '../../common/service/gaming_tag_service/gaming_tag_service.dart';
import '../../common/widgets/gg_dialog/go_gaming_toast.dart';
import '../../config/user_setting.dart';
import '../../helper/url_scheme_util.dart';
import '../base/base_controller.dart';
import '../main/main_logic.dart';
import 'main_menu_state.dart';

class MainMenuLogic extends BaseController with GetTickerProviderStateMixin {
  final MainMenuState state = MainMenuState();

  final currentLanguage = GamingLanguage().obs;
  RxList<GamingLanguage> optionalLanguages = <GamingLanguage>[].obs;
  late Function disposeListen;

  @override
  void onClose() {
    super.onClose();
    disposeListen.call();
  }

  @override
  void onInit() {
    disposeListen = AccountService.sharedInstance.cacheUser.getBox!()
        .listenKey(AccountService.sharedInstance.cacheUser.key, (value) {
      state.isLogin.value = AccountService.sharedInstance.isLogin;
    });

    _loadDefaultLanguage();
    _loadLanguagesConfig();
    _loadTournamentList();
    _loadInformation();
    _loadRecentActivity();
    _loadContestActivities();
    if (AccountService().isLogin) {
      _loadRecentGameList();
      _loadFavoriteGameList();
    }

    GamingTagService.sharedInstance.getScenseInfo(force: true).listen((event) {
      state.leftMenus.assignAll(event.leftMenus ?? <GameScenseLeftMenus>[]);
      state.headerMenus.assignAll(
          event.headerMenus?.where((element) => element.key != '0').toList() ??
              []);
    }, onError: (e) {});
    super.onInit();
  }

  void _loadContestActivities() {
    PGSpi(Bonus.getContestActivities.toTarget())
        .rxRequest<List<GamingDailyContestModel>?>((value) {
      try {
        final data = value['data']['title'];
        if (data is List) {
          return data
              .map((e) => GamingDailyContestModel.fromJson(
                  Map<String, dynamic>.from(e as Map)))
              .toList();
        } else {
          return null;
        }
      } catch (e) {
        return null;
      }
    }).flatMap((resp) {
      /// 过滤所有标题名为 unknown 的活动
      final respList =
          resp.data?.where((element) => element.title != 'unknown').toList() ??
              [];
      return Stream.value(respList);
    }).doOnData((event) {
      state.showTodayRace.value = event.isNotEmpty;
    }).listen((event) {});
  }

  void pressSetLanguage({VoidCallback? onSucessCallBack}) {
    if (optionalLanguages.isNotEmpty) {
      onSucessCallBack?.call();
    } else {
      SmartDialog.showLoading<void>();
      _getLanguagesConfig().doOnError((err, p1) {
        SmartDialog.dismiss<void>();
        if (err is GoGamingResponse) {
          Toast.showFailed(err.message);
        } else {
          Toast.showTryLater();
        }
      }).doOnData((event) {
        SmartDialog.dismiss<void>();
        onSucessCallBack?.call();
      }).listen((event) {}, onError: (p0, p1) {});
    }
  }

  Stream<List<GamingLanguage>> _getLanguagesConfig() {
    return LanguageService.sharedInstance.getLanguage().doOnData((event) {
      final list = GamingLanguage.localeConfig
          .map((e) => localized(e["code"] as String))
          .toList();
      List<GamingLanguage> tempOptionalLanguages = <GamingLanguage>[];
      for (String code in list) {
        GamingLanguage? language = event.firstWhereOrNull((element) {
          return element.languageCode == code.toLowerCase();
        });
        if (language != null &&
            language.name != null &&
            language.code != null) {
          tempOptionalLanguages.add(language);
        }
      }
      optionalLanguages.value = tempOptionalLanguages;
      _loadDefaultLanguage();
    });
  }

  void _loadLanguagesConfig() {
    _getLanguagesConfig().listen((event) {});
  }

  void _loadDefaultLanguage() {
    final locale = AppLocalizations.of(Get.context!).locale;
    for (var element in GamingLanguage.localeConfig) {
      if (locale.languageCode.contains(element["code"] ?? "")) {
        currentLanguage.value = GamingLanguage.fromJson(element);
        break;
      }
    }
  }

  void _loadRecentGameList() {
    PGSpi(Game.getRecentlyPlayed.toTarget(input: {
      'pageIndex': 1,
      'pageSize': 10,
    })).rxRequest<int>((value) {
      try {
        int? total = value["data"]["total"] as int;
        return total;
      } catch (e) {
        return 0;
      }
    }).listen((event) {
      if (event.success) {
        state.recentGameCount.value = event.data;
      }
    });
  }

  void _loadFavoriteGameList() {
    /// 只能通过列表接口读取 total
    PGSpi(Game.getFavoriteGame.toTarget(input: {
      'pageIndex': 1,
      'pageSize': 10,
    })).rxRequest<int>((value) {
      final total = GGUtil.parseInt(value['data']['total']);
      return total;
    }).listen((event) {
      if (event.success) {
        state.favoriteGameCount.value = event.data;
      }
    });
  }

  void _setLanguage(String langCode) async {
    Map<String, String>? result =
        GamingLanguage.localeConfig.firstWhereOrNull((element) {
      return langCode.split("-").first.toLowerCase() ==
          element['code']!.toLowerCase();
    });
    AccountService.sharedInstance.updateDefaultLanguage(langCode).listen(null);
    if (result != null) {
      // 防止重建APP 打断了bottomSheet的pop动画,添加延迟
      Future.delayed(const Duration(milliseconds: 500), () {
        UserSetting.sharedInstance.lang = langCode;
        UserSetting.sharedInstance.async();
        Locale newLocale = Locale(result["code"]!, result['countryCode']);
        AppLocalizations.of(Get.context!).locale = newLocale;
        GamingTagService.sharedInstance.restore();
        RestartService.restart();
      });
    }
  }

  void _loadTournamentList() {
    PGSpi(Activity.getNewRankList.toTarget(inputData: {
      'startDto': {
        'current': 1,
        'orderDirection': 'desc',
        'size': 999,
      },
      'endDto': {
        'current': 1,
        'orderDirection': 'desc',
        'size': 6,
      },
      'preDto': {
        'current': 1,
        'orderDirection': 'desc',
        'size': 4,
      },
    })).rxRequest((p0) {
      return TournamentListModel.fromJson(p0['data'] as Map<String, dynamic>);
    }).flatMap((value) {
      return Stream.value(value.data);
    }).doOnData((event) {
      state.showTournament.value = !event.isEmpty;
    }).listen(null, onError: (err) {});
  }

  void _loadRecentActivity() {
    PGSpi(Bonus.getRecentActivity.toTarget()).rxRequest<bool?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        final haveRunningActivity = data['haveRunningActivity'];
        if (haveRunningActivity is bool) {
          return haveRunningActivity;
        }
      }
      return null;
    }).listen((event) {
      if (event.success) {
        state.showRecentActivity.value = event.data ?? false;
      }
    }, onError: (Object e) {});
  }

  void _loadInformation() {
    PGSpi(LuckySpinApi.getMoreTurnTableInformation.toTarget())
        .rxRequest<GameLuckySpinInformationModel?>((value) {
      final data = value['data'];
      if (data is List && data.isNotEmpty) {
        final wheelList = data
            .map((e) => GameLuckySpinInformationModel.fromJson(
                e as Map<String, dynamic>))
            .toList()
          ..sort((a, b) => b.startTime.compareTo(a.startTime));
        GameLuckySpinInformationModel model = wheelList.firstWhere(
          (element) => element.available == true,
          orElse: () => wheelList.first,
        );
        return model;
      } else {
        return null;
      }
    }).listen((event) {
      if (event.success) {
        if (event.data != null) {
          state.showLuckySpin.value = true;
        }
      }
    }, onError: (Object e) {});
  }
}

extension Rounte on MainMenuLogic {
  void changeLanguage(GamingLanguage content) {
    _setLanguage(content.code ?? "");
  }

  void pressNewCoupon() {
    Get.back<void>();
    Get.until((route) => Get.currentRoute == Routes.main.route);
    Get.find<MainLogic>().changeSelectIndex(2);
  }

  void pressH5CS() {
    CustomerServiceRouter().offAndToNamed();
  }

  void pressHeaderMenu([GameScenseHeaderMenuModel? model]) {
    Get.back<void>();
    if (model?.redirectMethod == 'AssignGame') {
      Get.toNamed<void>(Routes.gamePlayReady.route, arguments: {
        'providerId': model?.config?.assignGameProviderId ?? '',
        'gameId': model?.config?.assignGameCode ?? '',
      });
    } else if (model?.redirectMethod == 'LabelPage') {
      Get.toNamed<void>(Routes.gameList.route, arguments: {
        'labelId': model?.labelId ?? '',
      });
    } else if (model?.redirectMethod == 'AssignProvider') {
      Get.toNamed<void>(Routes.providerGameList.route, arguments: {
        'providerId': model?.config?.assignProviderId ?? '',
      });
    } else if (model?.redirectMethod == 'AssignUrl') {
      UrlSchemeUtil.navigateTo(model?.config?.assignAppUrl);
    }
  }

  void submitGamingDataCollection(int id) {
    if (id == 0) return;
    int type = GameCategory.typeNumForTrackerWithId(GGUtil.parseInt(id));
    Map<String, dynamic> dataMap = {"actionvalue1": type};
    GamingDataCollection.sharedInstance
        .submitDataPoint(TrackEvent.visitCategoryPage, dataMap: dataMap);
  }

  void pressFavoriteGame() {
    Get.offAndToNamed<void>(Routes.favoriteGameList.route);
  }

  void pressRecentGame() {
    Get.offAndToNamed<void>(Routes.recentGameList.route);
  }

  void pressScenseItem([GameScenseHeaderMenuItem? model]) {
    Get.back<void>();
    model?.navigateTo();
  }

  void pressScenseLeftMenu([GameScenseLeftMenus? model]) {
    Get.back<void>();
    model?.navigateTo();
  }
}
