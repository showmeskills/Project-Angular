part of oauth_service;

class GoogleOAuthService {
  static Future<bool> isGooglePlayInstalled() async {
    if (Platform.isIOS) {
      return true;
    }
    // Google Play 商店应用程序包名
    const package = 'com.android.vending';
    // 获取设备上所有应用程序的列表
    final apps = await DeviceApps.DeviceApps.getInstalledApplications(
      includeAppIcons: false,
      includeSystemApps: true,
    );

    for (int i = 0; i < apps.length; i++) {
      DeviceApps.Application app = apps[i];
      if (app.packageName == package) {
        return true;
      }
    }
    return false;
  }

  static Future<String> login() async {
    bool hasGooglePlay = await isGooglePlayInstalled();
    if (hasGooglePlay == false) {
      throw (localized('need_google_play'));
    }
    GoogleSignIn googleSignIn = GoogleSignIn.standard(
      scopes: ['email'],
    );

    GoogleSignInAccount? account = await googleSignIn.signIn();
    if (account == null) {
      // 用户自己取消的，不给报错提示
      throw ('');
    }
    GoogleSignInAuthentication authentication = await account.authentication;
    // ignore: unnecessary_null_comparison
    if (authentication == null) {
      return 'platform token is empty';
    }
    if (kDebugMode) {
      print(
        "idtoken =>${authentication.idToken}",
      );
      print(
        "accessToken =>${authentication.accessToken}",
      );
    }
    return authentication.accessToken ?? '';
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
