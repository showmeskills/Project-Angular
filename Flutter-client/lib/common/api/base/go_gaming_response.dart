import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/widget_header.dart';

import 'go_gaming_error.dart';
// import 'package:base_framework/base_controller.dart';

class GoGamingResponse<T> {
  bool success;
  String code;
  String? message;
  // behavior/behavior/submit 返回code=null  兼容 getlivecheckconnect返回的不规范，success为true code为00000
  late GoGamingError? error = (code == "200") ||
          (code == '0') ||
          (success && GGUtil.parseInt(code) == 0)
      ? null
      : GoGamingError.c(code);
  Headers? headers;
  T data;

  /// 是否来自本地缓存
  bool get fromCache {
    /// dio_cache_header_key_data_source 为空则返回的数据为缓存数据
    if (null != headers?.value("dio_cache_header_key_data_source")) {
      return true;
    }
    return false;
  }

  GoGamingResponse({
    required this.success,
    required this.code,
    this.headers,
    this.message,
    required this.data,
  }) {
    /// 如果是业务错误，清除apiErrorCode
    /// 例如: [GoGamingError.kycInReview] kyc审核中
    if (![
      GoGamingError.fail,
      GoGamingError.server,
      GoGamingError.paramsError,
      GoGamingError.unknown
    ].contains(error)) {
      headers?.removeAll('apiErrorCode');
    }

    message =
        (headers?.apiErrorCode ?? '') + (message ?? localized('network_err'));
  }

  static GoGamingResponse<int> netError() {
    return GoGamingResponse<int>(
      code: '-404',
      success: false,
      message: localized('network_err'),
      data: 0,
    );
  }

  factory GoGamingResponse.fromJson(
      T Function(Map<String, dynamic>) dataFactory,
      Map<String, dynamic> json,
      Headers? headers,
      {bool fromCache = false}) {
    try {
      final success = json["success"] as bool? ?? json['ok'] as bool?;
      if (headers?.noNeedJsonParse == true ||
          headers?.value('error') == DioErrorType.response.toString() &&
              success == null &&
              headers?.value('Token-Expired') != 'true') {
        throw GoGamingResponseException(
          headers: headers,
          message: localized('network_err'),
        );
      }

      // 兼容错误时另一种返回格式
      final code = json["code"]?.toString() ?? json["status"]?.toString();
      final message = json["message"]?.toString() ?? json["title"]?.toString();
      if (json['data'] == null && (success ?? false) == false) {
        throw GoGamingResponseException(
          headers: headers,
          code: code,
          message: message,
        );
      } else {
        final result = dataFactory(json);
        return GoGamingResponse(
          headers: headers,
          success: success is bool ? success : false,
          code: code ?? "-1",
          message: message,
          data: result,
        );
      }
    } catch (e, s) {
      if (e is GoGamingResponseException) {
        rethrow;
      } else {
        //    统一处理json解析异常问题
        Sentry.captureException(JsonParseError(
          className: dataFactory.toString().split(' => ').elementAtOrNull(1),
          json: json,
          error: e,
          stackTrace: s,
        ));
        throw GoGamingResponseException(
          headers: headers,
          message: localized('network_err'),
          code: GoGamingError.jsonParse.code,
        );
      }
    }
  }

  @override
  String toString() {
    if (success == true) {
      return toJson().toString();
    } else {
      return message ?? localized('network_err');
    }
  }

  Map<String, dynamic> toJson() {
    return {
      "success": success,
      "code": code,
      "message": message,
      "error": error,
      "data": data,
    };
  }
}

class GoGamingResponseException extends GoGamingResponse<Object?> {
  GoGamingResponseException({
    String? message,
    String? code,
    required Headers? headers,
  }) : super(
          success: false,
          code: code ?? '-1',
          message: message,
          headers: headers,
          data: null,
        );
}
