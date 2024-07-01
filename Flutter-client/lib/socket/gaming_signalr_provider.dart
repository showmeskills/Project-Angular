// import 'dart:convert';

import 'dart:math';

import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/base/go_gaming_response.dart';
import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/event_service.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/global_setting.dart';
import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/router/app_pages.dart';

import '../common/utils/util.dart';

class SignalrProvider {
  static final SignalrProvider _signalrProvider = SignalrProvider._internal();
  factory SignalrProvider() => _signalrProvider;
  HubConnection? _hubConnection;
  final Map<String, List<MethodInvocationFunc>> _methods = {};
  int status = 0; //0 未连接 1 连接失败 2 已断开 3 已连接
  /// 重试次数
  int retryTime = 0;

  SignalrProvider._internal() {
    GamingEvent.login.subscribe(() {
      debugPrint(
          "listen to the token expiration notification and start refreshing signalr------- login");
      resetConnectionAndReconection();
    });

    GamingEvent.loggedOut.subscribe(() async {
      debugPrint(
          "listen to the token expiration notification and start refreshing signalr------- loggedOut");
      resetConnectionAndReconection();
    });
  }

  Future<void> closeConnection() async {
    try {
      await _hubConnection?.stop();
    } catch (e) {
      debugPrint('_hubConnection stop exception:$e');
    }
  }

  void resetConnectionAndReconection() async {
    await closeConnection();
    _hubConnection = null;
    Future.delayed(const Duration(milliseconds: 2000), () {
      debugPrint(
          "The state switch refreshes the token and starts to reconnect------");
      openConnection();
    });
  }

  void _retryConnectionAndReconection() async {
    /// 清空之前链接
    await closeConnection();
    _hubConnection = null;
    Future.delayed(Duration(seconds: _retryInterval()), () {
      debugPrint(
          "The state switch refreshes the token and starts to reconnect------");
      openConnection();
    });
  }

  int _retryInterval() {
    /// 重试策略
    /// 每次重试请求与上一次请求的间隔时间分别为 2s、4s、8s、16s、32s
    /// 之后持续使用 32s 进行重试
    num interval = pow(2, retryTime);
    if (interval > 32) {
      return 32;
    }
    return interval.toInt();
  }

  Future<String> tokenFactory() async {
    return GoGamingService.sharedInstance.userToken ??
        GoGamingService.sharedInstance.jwtToken ??
        '';
  }

  String getServerUrl() {
    String url = Config.currentConfig.signalrUrl;
    return url;
  }

  void openConnection() {
    if (_hubConnection == null) {
      debugPrint("_hubConnection? is null");
    } else {
      debugPrint("${_hubConnection?.state}----");
    }
    debugPrint(" connect ----- 0 ");

    if (_hubConnection == null) {
      debugPrint(" connect ----- 1 ");

      final httpConnectionOptions = HttpConnectionOptions(
        withCredentials: false,
        transport: HttpTransportType.webSockets,
        logMessageContent: true,
        accessTokenFactory: tokenFactory,
        skipNegotiation: true,
      );
      _hubConnection = HubConnectionBuilder()
          .withUrl(getServerUrl(), httpConnectionOptions)
          .withAutomaticReconnect()
          .build();

      _hubConnection?.onreconnecting((exception) {
        debugPrint(
            "_hubConnection? onreconnecting called with exception: $exception");
      });

      _hubConnection?.onreconnected((connectionId) {
        debugPrint(
            "_hubConnection? onreconnected called with connectionId: $connectionId");
      });
    }

    debugPrint(" connect ----- 2 ");

    if (_hubConnection?.state == HubConnectionState.disconnected) {
      try {
        _hubConnection?.start()?.then((value) {
          debugPrint('_hubConnection? connected }');
          status = 3;
          retryTime = 0;
          setConnection();
        }, onError: (Object e) {
          debugPrint('_hubConnection? catchError: $e');

          /// 链接失败则启动重试策略
          _retryConnectionAndReconection();
        });
      } catch (e) {
        debugPrint('_hubConnection? catchError: $e');
      }
    }

    _hubConnection?.keepAliveIntervalInMilliseconds = 5000;

    _hubConnection?.onclose((exception) async {
      debugPrint(" connect ----- onclose ");

      // if (status == 3) {
      //   status = 2;
      //   _hubConnection?.stop().then((value) {
      //     debugPrint('_hubConnection? stop }');
      //     status = 3;
      //   }).catchError((Object e) {
      //     debugPrint('_hubConnection? catchError: $e');
      //   });
      // }
    });
  }

  void subscribe(String methodName, MethodInvocationFunc newMethod) {
    if (methodName.isEmpty) {
      return;
    }

    methodName = methodName.toLowerCase();
    if (_methods[methodName] == null) {
      _methods[methodName] = [];
    }

    // Preventing adding the same handler multiple times.
    if (_methods[methodName]!.contains(newMethod)) {
      return;
    }

    _methods[methodName]!.add(newMethod);
    _hubConnection?.on(methodName, newMethod);
  }

  void off(String methodName, {MethodInvocationFunc? method}) {
    if (methodName.isEmpty) {
      return;
    }

    methodName = methodName.toLowerCase();
    final List<void Function(List<dynamic>)>? handlers = _methods[methodName];
    if (handlers == null) {
      return;
    }

    if (method != null) {
      final removeIdx = handlers.indexOf(method);
      if (removeIdx != -1) {
        handlers.removeAt(removeIdx);
        if (handlers.isEmpty) {
          _methods.remove(methodName);
        }
      }
    } else {
      _methods.remove(methodName);
    }
    _hubConnection?.off(methodName, method: method);
  }

  /// 具体监听事件
  void setConnection() {
    _methods.forEach((key, value) {
      for (var element in value) {
        _hubConnection?.on(key, element);
      }
    });

    _hubConnection?.on("OnFail", (arguments) {
      debugPrint("OnFail connect failed----- $arguments");
    });

    _hubConnection?.on("OnSuccess", (arguments) {
      debugPrint(
          "OnSuccess connect suceess----- $arguments arguments?.first = ${arguments?.first}");
    });

    _hubConnection?.on("OnWager", (arguments) {
      debugPrint("OnWager bet Notification: ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnSettle", (arguments) {
      debugPrint("OnSettle settlement notice:----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnReSettle", (arguments) {
      debugPrint("OnReSettle re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnWagerCancel", (arguments) {
      debugPrint("OnWagerCancel re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    /// 获取活体认证结果
    _hubConnection?.on("OnLiveCheck", (arguments) {
      debugPrint("OnWagerCancel re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrOnLiveCheck.notify(data: {'res': arguments?.first});
      }
    });

    _hubConnection?.on("OnDeposit", (arguments) {
      debugPrint("OnDeposit re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
        GamingEvent.onDeposit.notify(data: {'res': arguments?.first});
      }
    });

    _hubConnection?.on("OnWithdraw", (arguments) {
      debugPrint("OnWithdraw re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
        GamingEvent.onWithdraw.notify(data: {'res': arguments?.first});
      }
    });

    _hubConnection?.on("OnTransfer", (arguments) {
      debugPrint("OnTransfer re-billing ----- $arguments");

      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnAdjustment", (arguments) {
      debugPrint(
          "OnAdjustment re-billing ----- $arguments -- arguments?.first=${arguments?.first}");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnInviteFriendCommission", (arguments) {
      debugPrint("OnInviteFriendCommission re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnAgentCommission", (arguments) {
      debugPrint("OnAgentCommission re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnWithdrawFreeze", (arguments) {
      debugPrint("OnWithdrawFreeze re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnCancelWithdrawThaw", (arguments) {
      debugPrint("OnCancelWithdrawThaw re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnTransferFailFreeze", (arguments) {
      debugPrint("OnTransferFailFreeze re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnTransferFailThaw", (arguments) {
      debugPrint("OnTransferFailThaw re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnTakeBonusWater", (arguments) {
      debugPrint("OnTakeBonusWater re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnNonStickyBalanceChange", (arguments) {
      debugPrint("OnNonStickyBalanceChange re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrUpdateBalance.notify();
      }
    });

    _hubConnection?.on("OnKickout", (arguments) {
      debugPrint("OnKickout re-billing ----- $arguments");
      AccountService.sharedInstance.logout();
      Get.until((route) => Get.currentRoute == Routes.main.route);
      Get.find<MainLogic>().changeSelectIndex(-1);
      GoGamingResponse<dynamic> tokenExpiredData = GoGamingResponse(
        success: false,
        code: '1999',
        message: 'OnKickout',
        data: {'action': 'OnKickout'},
      );
      AccountService.sharedInstance.onTokenExpireEvent(tokenExpiredData);
    });

    _hubConnection?.on("OnRepeatLogin", (arguments) {
      debugPrint("OnRepeatLogin re-billing ----- $arguments");
      if (arguments?.first != null) {
        AccountService.sharedInstance.logout();
        Get.until((route) => Get.currentRoute == Routes.main.route);
        Get.find<MainLogic>().changeSelectIndex(-1);
        GoGamingResponse<dynamic> tokenExpiredData = GoGamingResponse(
          success: false,
          code: '1001',
          message: 'OnRepeatLogin',
          data: {'action': 'OnRepeatLogin'},
        );
        AccountService.sharedInstance.onTokenExpireEvent(tokenExpiredData);
      }
    });

    _hubConnection?.on("OnSiteMail", (arguments) {
      debugPrint("OnSiteMail re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrOnSiteMail.notify();
      }
    });

    _hubConnection?.on("OnTips", (arguments) {
      debugPrint("OnTips re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.signalrOnTips.notify(data: {'res': arguments?.first});
      }
    });

    /// 触发风控
    _hubConnection?.on("OnSupplementInfo", (arguments) {
      debugPrint(
          "OnSupplementInfo re-billing ----- $arguments -- ${arguments?.first}");
      if (GlobalSetting.sharedInstance.isCloseRisk) {
        // 屏蔽分控功能
      } else {
        if (arguments?.first != null) {
          Map<String, dynamic> notify = arguments![0] as Map<String, dynamic>;
          bool showRisk = false;
          if (notify.containsKey('data')) {
            showRisk = GGUtil.parseBool(notify['data']);
          }
          GlobalSetting.sharedInstance.isRisk.value = showRisk;
        }
      }
    });

    // kyc id身份验证
    _hubConnection?.on("OnIdVerification", (arguments) {
      debugPrint("OnIdVerification re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.onIdVerification.notify();
      }
    });

    // kyc 中级认证
    _hubConnection?.on("OnRequestKycIntermediate", (arguments) {
      debugPrint("OnRequestKycIntermediate re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.onRequestKycIntermediate.notify();
      }
    });

    // kyc 高级认证
    _hubConnection?.on("OnRequestKycAdvanced", (arguments) {
      debugPrint("OnRequestKycAdvanced re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.onRequestKycAdvanced.notify();
      }
    });

    // kyc 高级认证
    _hubConnection?.on("OnEdd", (arguments) {
      debugPrint("OnEdd re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.onEdd.notify();
      }
    });

    // 新竞赛-自己的名次变化
    _hubConnection?.on("OnNewRankSelfRank", (arguments) {
      debugPrint("OnNewRankSelfRank re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.onNewRankSelfRank.notify(data: {'res': arguments?.first});
      }
    });

    // 新竞赛-所有排行榜变化
    _hubConnection?.on("OnNewRankLeaderboard", (arguments) {
      debugPrint("OnNewRankLeaderboard re-billing ----- $arguments");
      if (arguments?.first != null) {
        GamingEvent.onNewRankLeaderboard
            .notify(data: {'res': arguments?.first});
      }
    });
  }
}
