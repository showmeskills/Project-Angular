class LiveChatConfig {
  final String name;
  final String email;
  final Map<String, dynamic> params;

  LiveChatConfig({
    required this.name,
    required this.email,
    required this.params,
  });

  String get paramsUrlEncode {
    var result = '';
    params.forEach((key, value) {
      result += '&$key=$value';
    });
    return Uri.encodeComponent(result);
  }
}
