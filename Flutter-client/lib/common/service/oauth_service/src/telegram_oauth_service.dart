part of oauth_service;

class TelegramOAuthService {
  String cookies = "";
  static Future<String> login() async {
    loginTelegram();
    return '';
  }

  static Future<bool> loginTelegram() async {
    String authUrl =
        'https://oauth.telegram.org/auth?bot_id=6081325257&origin=http://sit.newplatform.gbfine.com&request_access=write&return_to=http://sit.newplatform.gbfine.com/zh-cn';
    // Get.toNamed<void>(
    //   Routes.webview2.route,
    //   arguments: {
    //     'localHtml': 'assets/html/telegram.html',
    //     'title': 'telegram',
    //   },
    // );

    // return true;
    Get.toNamed<void>(
      Routes.webview.route,
      arguments: {
        'link': authUrl,
        'title': 'telegram',
      },
    );

    return true;
  }

  static Future<String> post(
      String url, Map<String, String> headers, String body) async {
    var uri = Uri.parse(url);
    headers["cookie"] = '';
    final response = await http.post(uri, headers: headers, body: body);
    var cookiesInfo = response.headers["set-cookie"]?.split(';');
    if (cookiesInfo != null) {
      // cookies = addCookiesFromCookiesInfo(cookies, cookiesInfo);
    }
    return response.body;
  }

  static Future<bool> logout() {
    GoogleSignIn googleSignIn = GoogleSignIn.standard(
      scopes: ['email'],
    );
    return googleSignIn.signOut().then((value) {
      return true;
    });
  }

  static void onConnError(String msg, String loginType, OAuthError error) {
    Toast.showFailed(localized(msg));
  }
}
