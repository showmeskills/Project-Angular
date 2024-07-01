import '../../common/api/base/base_api.dart';

class LineCenterDomainModel {
  String? domain;
  String? delay;
}

class LineCenterState {
  final RxnString appLogo = RxnString();

  final RxList<LineCenterDomainModel> domainList =
      <LineCenterDomainModel>[].obs;
}
