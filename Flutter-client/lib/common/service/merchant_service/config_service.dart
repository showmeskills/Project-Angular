import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/min_io_service/min_io_service.dart';
import 'package:gogaming_app/widget_header.dart';
import '../../../config/config.dart';
import '../../../config/environment.dart';
import '../../utils/util.dart';
import '../../widgets/gg_dialog/go_gaming_toast.dart';
import 'merchant_service.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ConfigService {
  factory ConfigService() => _getInstance();

  static ConfigService get sharedInstance => _getInstance();

  static ConfigService? _instance;

  static ConfigService _getInstance() {
    _instance ??= ConfigService._internal();
    return _instance!;
  }

  bool hasFind = false;

  ConfigService._internal();

  Future<String?> checkDomainAvailability(
    String domain,
    // ignore: strict_raw_type
    Completer completer, {
    Duration? duration,
  }) async {
    final client = http.Client();
    final timeoutDuration = duration ?? const Duration(milliseconds: 3000);

    final uri = Uri.parse('${domain}v1/connect');
    try {
      final response = await client.get(uri).timeout(timeoutDuration);
      if (!completer.isCompleted &&
          isStatusCodeValid(response.statusCode) &&
          response.body.toLowerCase() == 'ok') {
        debugPrint('checkDomainAvailability  domain $domain 最快');
        completer.complete(domain); // 将符合条件的域名作为结果传递给 Completer
      }
    } catch (e) {
      final httpStatus = e is TimeoutException ? 'Timeout' : 'Disconnected';
      final message =
          '\n checkDomainAvailability catch domain = $domain e = $e';
      debugPrint(message);

      // 处理异常
      SentryReportUtil.captureHttpRequestError(
        httpStatus: httpStatus,
        apiErrorCode: SpecialApiErrorCode.connect.code,
        request: uri.toString(),
        message: message,
      );
    } finally {
      client.close(); // 记得关闭client
    }
    return null; // 返回 null 作为默认值
  }

  bool isStatusCodeValid(int code) {
    if (code >= 200 && code < 300 && code.toString().length == 3) {
      debugPrint('数字 $code 是一个以2开头的三位数');
      return true;
    } else {
      debugPrint('数字 $code 不是一个以2开头的三位数');
      return false;
    }
  }

  Stream<String?> getConfigDomain({bool force = false}) {
    return MerchantService()
        .getMerchantConfig(force: force)
        .asyncExpand((event) async* {
      if (event != null) {
        final domainArrayStr = GGUtil.parseStr(MerchantService
            .sharedInstance.merchantConfigModel?.config?.domainArray);
        final date1 = DateTime.now();
        debugPrint('getConfigDomain domainArrayStr = $domainArrayStr');
        if (domainArrayStr.isEmpty) {
          yield '';
        } else {
          final domainArray = jsonDecode(domainArrayStr);

          if (domainArray is List && domainArray.isNotEmpty) {
            final completer =
                Completer<String?>(); // 创建 Completer 对象，类型为 String?
            for (final domain in domainArray) {
              checkDomainAvailability(GGUtil.parseStr(domain), completer);
            }

            const timeoutDuration = Duration(seconds: 3);
            final result =
                await completer.future.timeout(timeoutDuration, onTimeout: () {
              return null;
            });

            if (result != null) {
              final date2 = DateTime.now();
              debugPrint(
                  '第一个有用的域名 ----- $result 查找域名时间：${date2.difference(date1)} result =$result');
              updateDomain(result);
              yield result;
            } else {
              final date2 = DateTime.now();
              Timer(const Duration(seconds: 5), () {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  Toast.showDetail(
                    state: GgToastState.fail,
                    title: localized('failed'),
                    message: localized('initialization_failed_check_network'),
                    contentMaxLines: 4,
                    top: 12.dp,
                    right: 12.dp,
                  );
                });
              });
              debugPrint(
                  '所有域名都不可用 查找域名时间：${date2.difference(date1)} result = $result');
              MinIOService().uploadRequestError('ping/allFail/', {
                'pingDomain': domainArray,
                'error': 'all domains ping fail',
              });
              Sentry.captureException(AllDomainInvalid(List.from(domainArray)));
              // 执行所有请求都失败的操作
              yield '';
            }
          } else {
            yield '';
          }
        }
      } else {
        yield '';
      }
    });
  }

  void updateDomain(String domain) {
    if (GGUtil.parseStr(domain).isEmpty) {
      return;
    }
    String apiUrl = domain;
    String signalrUrl = "${domain}ws";
    if (Config.sharedInstance.environment == Environment.sit) {
      signalrUrl = "${domain}msgHub";
      Config.sharedInstance.updateApiUrl(apiUrl, isSetDomain: true);
      Config.sharedInstance.updateSignalrUrl(signalrUrl, isSetDomain: true);
    } else if (Config.sharedInstance.environment == Environment.uat) {
      // uat环境端口都不一样，不做替换
    } else {
      // product环境
      Config.sharedInstance.updateApiUrl(apiUrl, isSetDomain: true);
      Config.sharedInstance.updateSignalrUrl(signalrUrl, isSetDomain: true);
    }
  }
}
