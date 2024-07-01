// ignore_for_file: avoid_shadowing_type_parameters

import 'dart:async';
import 'dart:convert';

import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gg_failed_request_desc.dart';
import 'go_gaming_error.dart';
import 'go_gaming_response.dart';

extension GoGamingApiRx<S> on PGSpi {
  // object stream
  Stream<GoGamingResponse<S>> rxRequest<S>(
    S Function(Map<String, dynamic>) dataFactory, {
    bool asyncHeaders = true,
    bool? useCache,
    int? connectTimeout,
    int? receiveTimeout,
    ProgressCallback? onReceiveProgress,
    ProgressCallback? onSendProgress,
    int retry = 2,
  }) {
    return getHeader(asyncHeaders)
        .asStream()
        .flatMap((_) => ggResponseJson(
              useCache: useCache ?? false,
              connectTimeout: connectTimeout,
              receiveTimeout: receiveTimeout,
              onSendProgress: onSendProgress,
              onReceiveProgress: onReceiveProgress,
            ))
        .flatMap((value) {
      late GoGamingResponse<S> response;
      try {
        response = _toGoGamingResponse(value, dataFactory, value.headers);
      } catch (e) {
        if (e is GoGamingResponse) {
          if (e.error == GoGamingError.tokenExpire ||
              e.error == GoGamingError.userTokenExpire ||
              e.error == GoGamingError.tokenInvalid) {
            final isLogin = AccountService.sharedInstance.isLogin;
            //防止循环调用
            final isNotAuthRefresh = !target.path.contains('/auth/refresh');
            if (isNotAuthRefresh &&
                e.error == GoGamingError.tokenExpire &&
                value.headers.value('Token-Expired') == 'true') {
              return AccountService.sharedInstance
                  .authRefresh()
                  .flatMap(
                      (p) => _retryWhenTokenError(dataFactory, value.headers))
                  .doOnError((error, stacktrace) {
                AccountService.sharedInstance.onTokenExpireEvent(e);
              });
            }

            //用户token失效 重新登录
            if (isLogin) {
              AccountService.sharedInstance.onTokenExpireEvent(e);
              return Stream.error(e);
            } else {
              GoGamingService.sharedInstance.updateToken(null, isUser: isLogin);
              return _retryWhenTokenError(dataFactory, value.headers);
            }
          }
        }
        return Stream.error(e);
      }
      if (response.error == GoGamingError.tokenExpire ||
          response.error == GoGamingError.userTokenExpire ||
          response.error == GoGamingError.tokenInvalid) {
        final isLogin = AccountService.sharedInstance.isLogin;
        //防止循环调用
        final isNotAuthRefresh = !target.path.contains('/auth/refresh');
        if (isNotAuthRefresh &&
            response.error == GoGamingError.tokenExpire &&
            value.headers.value('Token-Expired') == 'true') {
          return AccountService.sharedInstance
              .authRefresh()
              .flatMap((p) => _retryWhenTokenError(dataFactory, value.headers))
              .doOnError((error, stacktrace) {
            AccountService.sharedInstance.onTokenExpireEvent(response);
          });
        }

        //用户token失效 重新登录
        if (isLogin) {
          AccountService.sharedInstance.onTokenExpireEvent(response);
          return Stream.error(response);
        } else {
          GoGamingService.sharedInstance.updateToken(null, isUser: isLogin);
          return _retryWhenTokenError(dataFactory, value.headers);
        }
      } else if (response.error != null) {
        return Stream.error(response);
      }
      return Stream.value(response);
    });
    // });
  }

  /// 返回 multi 信号
  /// 先返回缓存数据再返回请求数据，如果缓存数据不存在或者已经过期则请求
  Stream<GoGamingResponse<S>> rxRequestWithCache<S>(
    S Function(Map<String, dynamic>) dataFactory, {
    bool asyncHeaders = true,
    int? connectTimeout,
    int? receiveTimeout,
  }) {
    Stream<GoGamingResponse<S>> tryCacheStream = getHeader(asyncHeaders)
        .asStream()
        .flatMap((value) => responseJson(
              useCache: true,
              forceRefresh: false,
              connectTimeout: connectTimeout ?? target.connectTimeout,
              receiveTimeout: receiveTimeout ?? target.receiveTimeout,
            ).asStream().onErrorResume((error, stackTrace) {
              if (error is DioError && error.type == DioErrorType.response) {
                return Stream.value(error.response!);
              }
              throw error;
            }))
        .flatMap((value) {
      late GoGamingResponse<S> response;
      try {
        response = _toGoGamingResponse(value, dataFactory, value.headers);
      } catch (e) {
        return Stream.error(e);
      }
      if (response.error == GoGamingError.tokenExpire ||
          response.error == GoGamingError.userTokenExpire ||
          response.error == GoGamingError.tokenInvalid) {
        final isLogin = AccountService.sharedInstance.isLogin;
        //防止循环调用
        final isNotAuthRefresh = !target.path.contains('/auth/refresh');
        if (isNotAuthRefresh &&
            response.error == GoGamingError.tokenExpire &&
            value.headers.value('Token-Expired') == 'true') {
          return AccountService.sharedInstance
              .authRefresh()
              .flatMap((p) => _retryWhenTokenError(dataFactory, value.headers))
              .doOnError((error, stacktrace) {
            AccountService.sharedInstance.onTokenExpireEvent(response);
          });
        }

        //用户token失效 重新登录
        if (isLogin) {
          AccountService.sharedInstance.onTokenExpireEvent(response);
          return Stream.error(response);
        } else {
          GoGamingService.sharedInstance.updateToken(null, isUser: isLogin);
          return _retryWhenTokenError(dataFactory, value.headers);
        }
      } else if (response.error != null) {
        return Stream.error(response);
      }
      return Stream.value(response);
    });
    // });

    return Stream.multi((logic) {
      tryCacheStream.doOnData((event) {
        logic.add(event);
        if (event.fromCache) {
          // 请求真实数据
          // rxRequest(dataFactory).doOnData((event) {
          //   logic.add(event);
          // }).doOnError((p0, p1) {
          //   logic.addError(p0, p1);
          // }).doOnDone(() {
          //   logic.close();
          // }).listen(null, onError: (err) {});
          logic.close();
        } else {
          // 非缓存数据直接关闭
          logic.close();
        }
      }).doOnError((p0, p1) {
        logic.addError(p0, p1);
        logic.close();
      }).listen(null, onError: (err) {});

      // logic.addStream(tryCacheStream).then((value) {
      //   if (value.fromCache == true) {
      //     Stream<GoGamingResponse<S>> requestStream = rxRequest(dataFactory);
      //     logic.addStream(requestStream).then((value) {
      //       logic.closeSync();
      //     });
      //   } else {
      //     logic.closeSync();
      //   }
      // });
    });
  }

  Future<Map<String, dynamic>> getHeader(bool asyncHeaders) async {
    if (asyncHeaders) {
      return GoGamingService.sharedInstance.commonHeader;
    } else {
      await GoGamingService.sharedInstance.getUA();
      await GoGamingService.sharedInstance.getPublicKey();
      return GoGamingService.sharedInstance.getHeaders();
    }
  }

  GoGamingResponse<S> _toGoGamingResponse<S>(Response<dynamic> value,
      S Function(Map<String, dynamic>) dataFactory, Headers headers) {
    final Map<String, dynamic> data = value.data is Map<String, dynamic>
        ? value.data as Map<String, dynamic>
        : const JsonDecoder().convert(value.data as String)
            as Map<String, dynamic>;
    final response = GoGamingResponse.fromJson(dataFactory, data, headers);
    return response;
  }

  Stream<GoGamingResponse<S>> _retryWhenTokenError<S>(
      S Function(Map<String, dynamic>) dataFactory, Headers headers) {
    return ggResponseJson().flatMap((value) {
      GoGamingResponse<S> response =
          _toGoGamingResponse(value, dataFactory, value.headers);
      if (response.error != null) {
        return Stream.error(response);
      }
      return Stream.value(response);
    });
  }

  Stream<Response<dynamic>> ggResponseJson({
    ProgressCallback? onReceiveProgress,
    ProgressCallback? onSendProgress,
    bool useCache = false,
    bool forceRefresh = true,
    int? connectTimeout,
    int? receiveTimeout,
  }) {
    return responseJson(
      useCache: useCache,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
      connectTimeout: connectTimeout ?? target.connectTimeout,
      receiveTimeout: receiveTimeout ?? target.receiveTimeout,
      interceptors: [
        GGFailedInterceptor(),
      ],
    ).asStream().onErrorResume((error, stackTrace) {
      if (error is DioError) {
        final code = apiErrorCode[error.requestOptions.uri.path];

        if (error.type == DioErrorType.response && error.response != null) {
          error.response?.headers
              .add('error', DioErrorType.response.toString());
          // 后台api需要兼容参数校验失败会返回400
          return Stream.value(error.response!);
        } else {
          return Stream.value(Response(
            headers: error.response?.headers ?? Headers()
              ..setApiErrorCode(code)
              ..setNoNeedJsonParse(true),
            requestOptions: error.requestOptions,
            data: {'message': localized('network_err'), 'success': false},
          ));
        }
      }
      throw error;
    });
  }
}

mixin GoGamingApi {
  Map<String, dynamic>? get params;

  dynamic get data;

  String getBaseUrl() {
    return "${Config.currentConfig.apiUrl}v1";
  }

  String get path;

  HTTPMethod get method;

  bool get needCache => false;

  int? get connectTimeout => 20 * 1000;

  int? get receiveTimeout => 10 * 1000;

  /// 检查入参数是否合规
  bool checkParams(Map<String, dynamic> input, dynamic inputData) {
    var isInputValid = true;
    params?.forEach((key, dynamic object) {
      final requireObject = input[key];
      final isNullOrBlank = GetUtils.isNullOrBlank(object);
      if (isNullOrBlank == false) {
        bool isRightType = object.runtimeType == requireObject?.runtimeType;
        assert(isRightType,
            "参数类型错误需要${object.runtimeType} 实际类型${requireObject?.runtimeType}");
        if (isRightType == false) isInputValid = false;
      }
    });

    if (data is Map<String, dynamic>) {
      data?.forEach((String key, dynamic object) {
        final requireObject = inputData[key];
        final isNullOrBlank = GetUtils.isNullOrBlank(object);
        if (isNullOrBlank == false) {
          bool isRightType = object.runtimeType == requireObject?.runtimeType;
          assert(isRightType,
              "参数类型错误需要${object.runtimeType} 实际类型${requireObject?.runtimeType}");
          if (isRightType == false) isInputValid = false;
        }
      });
    }
    return isInputValid;
  }

  /// input：请求的params
  /// inputData：请求的data（一般用在post）
  GoGamingTarget toTarget({
    Map<String, dynamic>? input,
    dynamic inputData,
    Map<String, String>? inputHeaders,
  }) {
    checkParams(input ?? {}, inputData);
    return GoGamingTarget(
      this,
      params: input ?? {},
      data: inputData,
      needCache: needCache,
      connectTimeout: connectTimeout,
      receiveTimeout: receiveTimeout,
      inputHeaders: inputHeaders ?? {},
    );
  }
}

class GoGamingTarget<T extends GoGamingApi> with PGSpiTarget {
  GoGamingTarget(
    this.type, {
    this.params = const {},
    this.data,
    this.needCache = false,
    this.connectTimeout,
    this.receiveTimeout,
    this.inputHeaders = const {},
  });

  final T type;
  Map<String, dynamic> params = {};
  final bool needCache;
  @override
  final int? connectTimeout;
  @override
  final int? receiveTimeout;

  final Map<String, String> inputHeaders;

  @override
  dynamic data;

  @override
  String get baseUrl => type.getBaseUrl();

  @override
  String get path => type.path;

  @override
  HTTPMethod get method => type.method;

  @override
  Map<String, dynamic> get parameters => params;

  @override
  Map<String, String> get headers => GoGamingService.sharedInstance
      .getHeaders()
      .map((key, value) => MapEntry(key, value.toString()))
    ..addEntries(inputHeaders.entries);

  @override
  bool get useCache => needCache;
}
