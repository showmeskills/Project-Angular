import 'package:base_framework/base_framework.dart';

abstract class CombinationController extends GetxController
    with SingleRenderControllerMixin {
  @override
  Stream<void> Function() get onLoadData => () {
        return onLoadDataStream()..listen(null, onError: (p0, p1) {});
      };
  Stream<void> onLoadDataStream();
}
