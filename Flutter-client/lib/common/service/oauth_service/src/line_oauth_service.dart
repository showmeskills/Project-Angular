part of oauth_service;

class LineOAuthService {
  static bool _initialized = false;

  static Future<void> _init() {
    if (_initialized) {
      return Future.value();
    }
    return LineSDK.instance.setup(OAuthConfig.lineID).then((value) {
      _initialized = true;
    }).onError((err, stackTrace) {
      _initialized = false;
      return Future.error(
        OAuthException(
          error: OAuthError.noInitialized,
        ),
        stackTrace,
      );
    });
  }

  static Future<String> login() {
    return _init().then((value) {
      return LineSDK.instance.login().then((result) {
        return result.accessToken.value;
      }).onError<PlatformException>(_catchError);
    });
  }

  static Future<bool> logout() {
    return _init().then((value) {
      return LineSDK.instance.logout().then((value) {
        return true;
      }).onError<PlatformException>(_catchError);
    });
  }

  /// {@template error_handling}
  /// This method redirects calls to the LINE SDK for the relevant native platform (iOS or Android).
  /// If an error happens in the native platform, a [PlatformException] is thrown. See
  /// [PlatformException.code] and [PlatformException.message] for error details.
  ///
  /// The LINE SDK implementation differs between iOS and Android, which means error codes and messages
  /// can also be different. For platform-specific error information, see
  /// [LineSDKError](https://developers.line.biz/en/reference/ios-sdk-swift/Enums/LineSDKError.html)
  /// (iOS) and
  /// [LineApiError](https://developers.line.biz/en/reference/android-sdk/reference/com/linecorp/linesdk/LineApiError.html)
  /// (Android).
  /// {@endtemplate}
  static Future<T> _catchError<T>(
    PlatformException err,
    StackTrace stackTrace,
  ) {
    if (err.code == '3003' ||
        err.code == 'CANCEL' ||
        err.code == 'AUTHENTICATION_AGENT_ERROR') {
      // 用户自己取消的，不给报错提示
      throw ('');
    } else {
      err = OAuthException(
        error: OAuthError.failed,
        message: err.message,
      );
    }

    return Future.error(err, stackTrace);
  }
}
