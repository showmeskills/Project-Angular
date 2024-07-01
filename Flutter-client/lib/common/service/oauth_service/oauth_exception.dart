part of oauth_service;

enum OAuthError {
  noInitialized('1000'),
  cancelled('1001'),
  failed('1002'),
  notImplemented('1003'),
  // 平台令牌为空
  platformTokenEmpty('1004');
  // PLATFORM_TOKEN_EMPTY;

  const OAuthError(this.code);

  final String code;
}

class OAuthException extends PlatformException {
  OAuthException({
    required this.error,
    String? message,
  }) : super(
          code: error.code,
          message: message,
        );

  final OAuthError error;

  @override
  String toString() => 'OAuthException($error, $code, $message)';
}
