import 'dart:async';

import 'package:flutter/material.dart' hide Banner;
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_label_provider_model.dart';
import 'package:gogaming_app/common/api/lucky_spin/lucky_spin_api.dart';
import 'package:gogaming_app/common/api/lucky_spin/models/game_lucky_spin_gap_model.dart';
import 'package:gogaming_app/common/api/lucky_spin/models/game_lucky_spin_information_model.dart';
import 'package:gogaming_app/common/api/lucky_spin/models/game_lucky_spin_result_model.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/common/service/game_flame_audio_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/pages/base/base_controller.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:gogaming_app/common/api/game/game_api.dart';
part 'gaming_lucky_spin_state_m1.dart';

class GamingLuckySpinLogicM1 extends BaseController
    with GetTickerProviderStateMixin {
  final state = GamingLuckySpinStateM1();
  // late AudioPool pool;

  /// 大转盘旋转动画
  late final AnimationController _rotationAnimation = () {
    var result = AnimationController(
      duration: const Duration(seconds: 5),
      vsync: this,
    );
    return result;
  }();
  double rotationEnd = 3.0;

  Animation<double> get rotationAnimation =>
      Tween<double>(begin: 0.0, end: rotationEnd).animate(CurvedAnimation(
        parent: _rotationAnimation,
        curve: Curves.easeInOut,
      ));

  @override
  void onInit() {
    super.onInit();
    _getLoginState();
    _loadInformation();
    GamingEvent.login.subscribe(_refreshLogin);
    GamingEvent.loggedOut.subscribe(_refreshLogin);
    loadGame(true);
    if (GameFlameAudioService.sharedInstance.isPlaying.value == true) {
      startBgmMusic();
    }

    GamingEvent.showGamePlaying.notify();
  }

  @override
  void onClose() {
    _rotationAnimation.dispose();
    GamingEvent.login.unsubscribe(_refreshLogin);
    GamingEvent.loggedOut.unsubscribe(_refreshLogin);
    GamingEvent.showNoGamePlaying.notify();
    stop();
    super.onClose();
  }

  void startBgmMusic() {
    GameFlameAudioService.sharedInstance.startBgmMusic('lucky_spin_bg.mp3', false);
    state.isLoadMusic.value = true;
  }

  void resume() {
    GameFlameAudioService.sharedInstance.isPlaying.value = true;
    if (state.isLoadMusic.value) {
      GameFlameAudioService.sharedInstance.resume();
    } else {
      startBgmMusic();
    }
  }

  void resumeOnly() {
    if (GameFlameAudioService.sharedInstance.isPlaying.value) {
      GameFlameAudioService.sharedInstance.resume();
    }
  }

  void pause() {
    GameFlameAudioService.sharedInstance.pause();
  }

  void pauseOnly() {
    GameFlameAudioService.sharedInstance.pauseOnly();
  }

  void stop() {
    GameFlameAudioService.sharedInstance.stop();
  }

  void _getLoginState() {
    state.isLogin.value = AccountService().isLogin;
  }

  void _refreshLogin() {
    _getLoginState();
    _getLoginState();
    _loadInformation();
  }

  // 重置
  void reset() {
    state.curMode.value = 1;
    // state.height.value = 631.dp;
    _getLoginState();
    state.gameLuckySpinInformationModel = null;
    state._informationModel(null);

    state.gameLuckySpinGapModel = null;
    state._gapModel(null);

    _rotationAnimation.reset();

    Prizeinfos? prize;
    state.prizeInfo = prize;
    state._resultPrize(prize);

    _loadInformation();
  }

  /// 活动资讯
  void _loadInformation() {
    state.isLoading.value = true;
    PGSpi(LuckySpinApi.getMoreTurnTableInformation.toTarget())
        .rxRequest<GameLuckySpinInformationModel?>((value) {
      final data = value['data'];
      if (data is List && data.isNotEmpty) {
        final wheelList = data
            .map((e) => GameLuckySpinInformationModel.fromJson(
            e as Map<String, dynamic>))
            .toList()..sort((a, b) => b.startTime.compareTo(a.startTime));
        GameLuckySpinInformationModel model = wheelList.firstWhere(
              (element) => element.available == true,
          orElse: () => wheelList.first,
        );
        return model;
      } else {
        return null;
      }
    }).listen((event) {
      debugPrint('getTurnTableInformation return $event');
      if (event.success) {
        if (event.data == null) {
          noAction();
          return;
        }
        state.gameLuckySpinInformationModel = event.data;
        state._informationModel(event.data);
        if (state.isLogin.value == false) {
          state.isLoading.value = false;
        } else {
          _loadGapSpin();
        }
      } else if (event.data == null && event.error != null) {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: event.error.toString());
      }
    }, onError: (Object e) {
      state.isLoading.value = false;
      if (e is GoGamingResponse) {
        if (e.code != '200') {
          noAction();
          return;
        }
        Navigator.of(Get.overlayContext!).pop();
        //获取失败
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: e.message.toString());
      }
    });
  }

  // 活动暂未开始
  void noAction() {
    Navigator.of(Get.overlayContext!).pop();
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('hint'),
      content: localized('whe_no_act_d'),
      contentMaxLine: 3,
      leftBtnName: '',
      rightBtnName: localized('confirm_button'),
      onRightBtnPressed: () {
        Get.back<void>();
      },
    ).showNoticeDialogWithTwoButtons();
  }

  // 当前活动已失效，需要更新活动信息
  void needUpdate() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('hint'),
      content: localized('act_lapse_p_desc'),
      contentMaxLine: 3,
      leftBtnName: '',
      rightBtnName: localized('confirm_button'),
      onRightBtnPressed: () {
        reset();
        Get.back<void>();
      },
    ).showNoticeDialogWithTwoButtons();
  }

  /// 取得抽奖次数与距离下次抽奖的条件
  void _loadGapSpin() {
    if (state.isLogin.value == false) return;
    PGSpi(LuckySpinApi.getTurnTableGapToSpin.toTarget(input: {
      "activityCode": state.informationModel?.activityCode ?? ''
    })).rxRequest<GameLuckySpinGapModel?>((value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        GameLuckySpinGapModel model = GameLuckySpinGapModel.fromJson(data);
        return model;
      } else {
        return null;
      }
    }).listen(
      (event) {
        debugPrint('_loadGapSpin return $event');
        if (event.success) {
          if (event.data == null) {
            // noAction();
            // return;
          }

          state.gameLuckySpinGapModel = event.data;
          state._gapModel(event.data);
        } else if (event.data == null && event.error != null) {
          Toast.show(
              context: Get.overlayContext!,
              state: GgToastState.fail,
              title: localized('failed'),
              message: event.error.toString());
        }
        state.isLoading.value = false;
      },
      onError: (Object e) {
        state.isLoading.value = false;
        if (e is GoGamingResponse) {
          if (e.code != '200') {
            noAction();
            return;
          }
          Navigator.of(Get.overlayContext!).pop();
          //获取失败
          Toast.show(
              context: Get.overlayContext!,
              state: GgToastState.fail,
              title: localized('failed'),
              message: e.message.toString());
        }
      },
    );
  }

  void setResultPrize(int prizeId) {
    Prizeinfos? prize;
    if (state.informationModel != null) {
      prize = state.informationModel!.prizeInfos
          .firstWhereOrNull((e) => e.prizeId == prizeId);
    }

    // prize = null; debug代码
    state.prizeInfo = prize;
    state._resultPrize(prize);
    // if (prize != null && state.gapModel != null) {
    //   state.gapModel?.leftTimes -= 1;
    //   if (state.gapModel!.leftTimes <= 0) {
    //     //刷新倒计时
    //     _loadGapSpin()?.onDone(() {
    //       update();
    //     });
    //   }
    // }
  }

  Stream<GoGamingResponse<GameLuckySpinResultModel?>> turnTableRunStream() {
    // final demoJson = {
    //   'success': true,
    //   'code': 200,
    //   message: null,
    //   'error': null,
    //   'data': {"snNo": 2, "prizeId": 95, "isDistributed": false}
    // };
    // ignore: prefer_function_declarations_over_variables
    final GameLuckySpinResultModel? Function(Map<String, dynamic>) dataFactory =
        (value) {
      final data = value['data'];
      if (data is Map<String, dynamic>) {
        GameLuckySpinResultModel model =
            GameLuckySpinResultModel.fromJson(data);
        return model;
      } else {
        return null;
      }
    };
    return PGSpi(LuckySpinApi.turnTableRun.toTarget(inputData: {
      "activityCode": state.informationModel?.activityCode ?? ''
    })).rxRequest<GameLuckySpinResultModel?>(dataFactory);
  }

  // 转动转盘抽奖
  void turnTableRun() {
    // 这个接口如果正在请求，正在动画就拦截掉下次点击。服务端有限制。短时间一直点击报错
    if (state.isRun.value) return;
    state.isRun.value = true;
    turnTableRunStream().listen(
      (event) {
        debugPrint('turnTableRun return $event');
        // 请求这个接口，如果返回的code是141，说明活动已经失效，需要重新请求活动信息
        if (event.code == '141') {
          needUpdate();
          return;
        }
        if (event.success && event.data != null) {
          state.gameLuckySpinResultModel = event.data;
          state._resultModel(event.data);
          setResultPrize(event.data?.prizeId ?? -1);

          /// 转动动画
          // state.height.value = 389.dp;
          state.curMode.value = 2;
          _startTurnTableAnimate();
        } else {
          state.isRun.value = false;
          Toast.show(
              context: Get.overlayContext!,
              state: GgToastState.fail,
              title: localized('failed'),
              contentMaxLines: 5,
              message: event.message ?? '');
        }
      },
      onError: (Object e) {
        setResultPrize(-1);
        state.isRun.value = false;
        //获取失败
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('failed'),
            message: e.toString());
      },
    );
  }

  /// 开始大转盘动画
  void _startTurnTableAnimate() {
    Future.delayed(const Duration(milliseconds: 300), () {
      /// 每一格的角度
      const perAngle = 30.0 / 360.0;
      final resultAngle =
          perAngle * (3.5 + (state.gameLuckySpinResultModel?.snNo ?? 1) - 1);
      const targetAngle = 5.5 * perAngle;

      // _rotationAnimation.dispose();
      rotationEnd = 3 + (targetAngle - resultAngle);
      update();
      WidgetsBinding.instance.addPostFrameCallback((timeStamp) {
        _rotationAnimation.forward().then((value) {
          Future.delayed(const Duration(milliseconds: 1000), () {
            /// 动画结束之后展示结果
            state.curMode.value = 3;
            state.isRun.value = false;
          });
        });
      });
    });
  }

  //0 未登录  state.isLogin.value == false
  //1 已登录，剩余X次抽奖 state.isLogin.value == true && leftTimes >0
  ///以下都是 leftTimes 为0的时候才会判断
  //2：显示倒计时 wheelType == 3 && Now > RemainTime 时 才能转动
  //3: 每存款${0} 获得一次抽奖机会 WheelType=1 (默认 depositAmount > 0)
  //4: 每有效交易${0} 获得一次抽奖机会  WheelType=2 && transAmount >0 && perTransCount == 0
  //5: 每有效交易${0}笔且不低于${1} 获得一次抽奖机会 WheelType=2 && perTransCount>0 && transAmount ==0
  //6  每有效交易${0}笔且不低于${1} 每存款${0} 获得一次抽奖机会    WheelType=2 && depositAmount >0 && perTransCount>0 && transAmount >0
  int getCurType() {
    if (state.isLogin.value == false) {
      return 0;
    } else if (GGUtil.parseInt(state.gapModel?.leftTimes, 1) > 0) {
      return 1;
    } else if (GGUtil.parseInt(state.gapModel?.wheelType) == 3) {
      return 2;
    } else if (GGUtil.parseInt(state.gapModel?.wheelType) == 1) {
      return 3;
    } else if (GGUtil.parseInt(state.gapModel?.wheelType) == 2 &&
        GGUtil.parseInt(state.gapModel?.depositAmount) > 0 &&
        GGUtil.parseInt(state.gapModel?.perTransCount) > 0 &&
        GGUtil.parseInt(state.gapModel?.transAmount) > 0) {
      return 6;
    } else if (GGUtil.parseInt(state.gapModel?.wheelType) == 2 &&
        GGUtil.parseInt(state.gapModel?.transAmount) > 0 &&
        GGUtil.parseInt(state.gapModel?.perTransCount) == 0) {
      return 4;
    } else if (GGUtil.parseInt(state.gapModel?.wheelType) == 2 &&
        GGUtil.parseInt(state.gapModel?.transAmount) == 0 &&
        GGUtil.parseInt(state.gapModel?.perTransCount) > 0) {
      return 5;
    }
    return 1;
  }

  /// 获取原创游戏相关
  void loadGame(bool enter) {
    PGSpi(Game.getLabelByProviderId.toTarget(input: {
      'providerCatId': Config.currentConfig.gameConfig.originalProvider,
    })).rxRequest<List<GameLabelProviderModel>>((value) {
      return (value['data'] as List?)
              ?.map((e) =>
                  GameLabelProviderModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [];
    }).flatMap((value) {
      return Stream.value(value.data);
    }).listen((event) {
      if (event.isNotEmpty) {
        // 遍历event的数组，取出event数组里面的gameCount最大的 item 赋值给state.oriGame
        state.oriGame = event.reduce((value, element) {
          return value.gameCount > element.gameCount ? value : element;
        });
      }
      if (!enter && state.oriGame != null) {
        Navigator.of(Get.overlayContext!).pop();
        Get.toNamed<dynamic>(Routes.gameList.route, arguments: {
          'labelId': state.oriGame!.code,
          'image': state.oriGame!.icon,
          'title': state.oriGame!.name,
        });
      }
    }).onError((Object error) {
      if (enter == false) {
        Toast.show(
            context: Get.overlayContext!,
            state: GgToastState.fail,
            title: localized('hint'),
            message: error.toString());
      }
    });
  }
}
