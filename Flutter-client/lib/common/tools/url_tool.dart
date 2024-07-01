class UrlTool {
  /// url拼接单个参数
  static String addParameterToUrl(String url, String parameter) {
    if (parameter == '') return url;
    if (url.contains('?')) {
      return '$url&$parameter';
    } else {
      return '$url?$parameter';
    }
  }

  /// url拼接多个参数
  static String addParametersToUrl(String url, List<String> parameters) {
    if (parameters.isEmpty) {
      return url;
    }
    String separator = url.contains('?') ? '&' : '?';
    String parameterString = parameters.where((p) => p.isNotEmpty).join('&');
    String str = '$url$separator$parameterString';
    return str;
  }
}
