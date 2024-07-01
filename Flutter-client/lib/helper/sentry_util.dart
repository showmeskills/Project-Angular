import 'dart:async';
import 'dart:io';
import 'dart:developer' as developer;

import 'package:base_framework/base_framework.dart';
import 'package:flutter/foundation.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/ip_service.dart';
import 'package:gogaming_app/common/service/shorebird_service.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/helper/device_util.dart';
import 'package:gogaming_app/main.dart';
import 'package:http/http.dart' as http;

class SentryUtil {
  late final _maxDuration = const Duration(minutes: 5);
  final domains = [
    'https://sentry.athena25.com',
    'https://fybzo.qnjwvkhd.com',
    'https://jxqrp.kzxdwqpl.com',
  ];

  static Future<void> initUser() async {
    await Sentry.configureScope((scope) async {
      final userModel = AccountService().gamingUser;
      String? userName = userModel?.userName;
      if (userName == null && userModel?.mobile?.isNotEmpty == true) {
        userName = '+${userModel?.mobileRegionCode} ${userModel?.mobile}';
      }
      if (userName == null && userModel?.email?.isNotEmpty == true) {
        userName = '${userModel?.email}';
      }
      // 设置用户信息
      String deviceId = await DeviceUtil.getDeviceIdentifier();
      var ip = IPService().ipModel?.ip ?? 'unknow';
      if (ip == 'unknow') {
        Response<Map<String, dynamic>> response =
            await Dio().get("https://api.ipify.org?format=json");
        ip = response.data?['ip'].toString() ?? 'unknow';
      }
      await scope.setUser(SentryUser(
        id: userModel?.uid,
        username: userName,
        ipAddress: ip,
        data: {
          'deviceId': deviceId,
          'connectivityStatus': connectivityResult.toString(),
          'apiUrl': Config.sharedInstance.apiUrl,
        },
      ));
    });
  }

  Future<String?> _getkSentryDomain() {
    final checkFutures =
        domains.map((e) => checkDomainAvailability(e)).toList();
    // 会获取并最先返回的值
    return Future.any(checkFutures);
  }

  Future<String?> checkDomainAvailability(
    String domain, {
    Duration? duration,
  }) async {
    final client = http.Client();
    final timeoutDuration = duration ?? const Duration(milliseconds: 3000);

    final uri = Uri.parse('$domain/health');
    try {
      final response = await client.get(uri).timeout(timeoutDuration);
      final body = response.body;
      if ('OK' == body) {
        debugPrint('checkDomainAvailability  domain $domain 最快');
        return domain;
      }
    } catch (e) {
      final message =
          '\n checkDomainAvailability catch domain = $domain e = $e';
      debugPrint(message);
    } finally {
      client.close(); // 记得关闭client
    }
    return Future.delayed(timeoutDuration, () => null);
  }

  void _setSentryDnsDomain(String domain) {
    RegExp exp = RegExp(r'@.*/');
    domain = domain.replaceAll('https://', '');
    Config.sentryDsn = Config.sentryDsn.replaceFirst(exp, '@$domain/');
  }

  Future<void> sentryInit() async {
    final domain = await _getkSentryDomain();
    if (domain is String) {
      _setSentryDnsDomain(domain);
    }

    await SentryFlutter.init(
      (options) {
        // sentry dsn url
        options.dsn = Config.sentryDsn;
        // 性能监控事务采样率
        options.tracesSampleRate = 1.0;
        options.beforeSend = (SentryEvent event, {Hint? hint}) {
          if (_isFilterEvent(event)) {
            return null;
          } else if (event.throwable is CustomReportError) {
            // 设置错误等级
            event = event.copyWith(
              level: (event.throwable as CustomReportError).level,
            );

            if (event.throwable is HttpRequestError) {
              // 重命名错误类型（issue标题）
              final throwable = (event.throwable as HttpRequestError);
              event = event.copyWith(
                exceptions: event.exceptions?.map((e) {
                  return e.copyWith(
                    type: throwable.apiErrorCode,
                  );
                }).toList(),
                tags: (event.tags ?? {})..addAll(throwable.tags),
              );
            }
          }
          return event;
        };
        // options.enableTracing = false;
        // 是否启用自动性能跟踪
        // options.enableAutoPerformanceTracing = false;
        // app冷热启动监控
        options.autoAppStart = false;
        options.dist = kReleaseMode ? 'release' : 'debug';
        // 版本 yaml声明的应用版本_补丁版本号 eg: 1.0.0+1_1
        options.release =
            '${Config.deviceVersion}_${ShorebirdService.sharedInstance.currentNumber}';

        // 环境
        options.environment = Config.sharedInstance.environment.value;
        // 是否附加用户信息 user中ipAddress设为{{auto}}则sendDefaultPii必须为true
        options.sendDefaultPii = false; 
      },
      appRunner: appRunner,
    );
  }

  bool _isFilterEvent(SentryEvent event) {
    bool result = event.throwable is SocketException ||
        event.threads is HandshakeException;

    final httpEvents =
        event.breadcrumbs?.where((element) => element.type == 'http') ?? [];
    final durations = httpEvents
        .where((element) => (element.data ?? {})['duration'] != null)
        .map((e) => e.data!['duration']);
    developer.log('获取 http duration: $durations', name: 'httpEvents');
    if (durations.isNotEmpty) {
      final hasOverMaxTime = durations
          .where((element) =>
              element is String && _maxDuration < _parseDuration(element))
          .isNotEmpty;
      if (hasOverMaxTime) {
        result = true;
      }
    }
    return result;
  }

  Duration _parseDuration(String s) {
    int hours = 0;
    int minutes = 0;
    int seconds = 0;

    List<String> parts = s.split(':');
    if (parts.length > 2) {
      hours = int.parse(parts[parts.length - 3]);
    }
    if (parts.length > 1) {
      minutes = int.parse(parts[parts.length - 2]);
    }
    seconds = num.parse(parts[parts.length - 1]).toInt();

    return Duration(hours: hours, minutes: minutes, seconds: seconds);
  }
}
