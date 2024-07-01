// ignore_for_file: depend_on_referenced_packages

import 'package:gogaming_app/widget_header.dart';

class GGFailedInterceptor extends Interceptor {
  GGFailedInterceptor({
    this.errorCode,
  });

  final String? errorCode;

  @override
  void onError(DioError err, ErrorInterceptorHandler handler) {
    if (![400, 401, 403].contains(err.response?.statusCode)) {
      final code = errorCode ?? apiErrorCode[err.requestOptions.uri.path];
      err.response?.headers.setApiErrorCode(code);
      // Http 请求错误上报
      late String httpStatus;
      if (err.type == DioErrorType.connectTimeout ||
          err.type == DioErrorType.sendTimeout ||
          err.type == DioErrorType.receiveTimeout) {
        httpStatus = 'Timeout';
      } else {
        httpStatus = err.response?.statusCode.toString() ?? 'Disconnected';
      }
      SentryReportUtil.captureHttpRequestError(
        httpStatus: httpStatus,
        apiErrorCode: code,
        request: err.requestOptions.uri
            .replace(
              queryParameters: {},
            )
            .toString()
            .replaceAll('?', ''),
        message: err.message,
        error: err.requestOptions.description()..addAll(err.description()),
      );
    }
    super.onError(err, handler);
  }
}

extension DioErrorDesc on DioError {
  Map<String, String> description() {
    final err = this;
    final errorDesc = {'error': 'DioError ║ ${err.type}-${err.message}'};
    if (err.type == DioErrorType.response) {
      errorDesc['status'] =
          '${err.response?.statusCode} ${err.response?.statusMessage}';
      errorDesc['type'] = err.type.toString();
      errorDesc['response'] = err.response.toString();
    }
    return errorDesc;
  }
}

extension RequestDesc on RequestOptions {
  Map<String, String> description() {
    final requestHeaders = <String, dynamic>{};
    requestHeaders.addAll(headers);
    final map = {
      'request_uri': uri.toString(),
      'method': method,
      if (queryParameters.isNotEmpty == true)
        'queryParameters': queryParameters.toString(),
      if (requestHeaders.isNotEmpty == true)
        'headers': requestHeaders.toString(),
    };

    if (method != 'GET' && data is FormData) {
      map['body'] = data.toString();
    }
    return map;
    // return json.encode(map);
  }
}

extension ResponseDesc<T> on Response<T> {
  Map<String, String> description() {
    final errorDesc = <String, String>{};
    errorDesc['status'] = '$statusCode $statusMessage';
    errorDesc['type'] = DioErrorType.response.toString();
    errorDesc['response'] = toString();
    return errorDesc;
  }
}
