import 'package:gogaming_app/common/api/base/go_gaming_service.dart';
import 'package:gogaming_app/common/api/language/language_api.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:gogaming_app/common/api/language/models/gaming_language.dart';

void main() {
  setUpAll(() async {
    await GoGamingService.sharedInstance.commonHeader;
    return;
  });

  test('getLanguage', () async {
    final result = await PGSpi(Language.getLanguage.toTarget())
        .rxRequest<List<GamingLanguage>>((value) {
      if (value['data'] == null) return [];
      final list = value['data'] as List<Map<String, dynamic>>;
      return list.map((e) => GamingLanguage.fromJson(e)).toList();
    }).first;

    expect(result.code, '200');
  });

  // test('set language', () {
  //   final counter = Counter();
  //
  //   counter.increment();
  //
  //   expect(counter.value, 1);
  // });
}
