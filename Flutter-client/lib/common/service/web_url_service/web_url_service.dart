import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/tools/url_tool.dart';

import '../../../config/config.dart';
import '../../api/base/go_gaming_service.dart';

class WebUrlService {
  static String get baseUrl {
    final Uri uri = Uri.parse(Config.sharedInstance.apiUrl);
    return uri.replace(path: '').toString();
  }

  static String url<T extends GoGamingUrlTarget>(T webConfig) {
    final url = webConfig.baseUrl + webConfig.path;
    String link = WebUrlService.splicePar(url, webConfig.needToken);
    return link;
  }

  static String url2(String path, [bool needToken = true]) {
    String url = '$baseUrl/${GoGamingService.sharedInstance.apiLang}';
    if (path.startsWith('/')) {
      url += path;
    } else {
      url += '/$path';
    }
    String link = WebUrlService.splicePar(url, needToken);
    return link;
  }

  /// 拼接公共参数
  static String splicePar(String url, [bool needToken = true]) {
    final symbol = url.contains('?') ? '&' : '?';
    String link =
        '$url${symbol}isApp=1&isDark=${ThemeManager.shareInstacne.isDarkMode ? 1 : 0}';
    if (needToken) {
      link = UrlTool.addParameterToUrl(
          link, GoGamingService.sharedInstance.curToken);
    }
    return link;
  }
}

mixin GoGamingWebUrl {
  /// 参数列表
  List<String>? get pros;

  String baseUrl() {
    return WebUrlService.baseUrl;
  }

  String get path;

  bool get needToken => true;

  GoGamingUrlTarget toTarget({List<String>? input}) {
    return GoGamingUrlTarget(
      this,
      params: input ?? [],
      needToken: needToken,
    );
  }
}

class GoGamingUrlTarget<T extends GoGamingWebUrl> {
  GoGamingUrlTarget(this.type,
      {this.params = const [], this.needToken = false});

  final T type;
  List<String> params = [];
  final bool needToken;

  String get baseUrl => type.baseUrl();

  String get path {
    String result = type.path;
    for (var pro in params) {
      result = result.replaceFirst('{x}', pro);
    }
    return result;
  }
}
