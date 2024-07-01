import 'package:flutter/material.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/pages/account_activity/common/account_activity_type_enum.dart';

import 'logics/account_activity_login_logic.dart';
import 'logics/account_activity_operation_logic.dart';

class AccountActivityLogic extends BaseController
    with GetSingleTickerProviderStateMixin {
  AccountActivityLogic() {
    tabController = TabController(
      length: AccountActivityType.values.length,
      vsync: this,
      initialIndex: 0,
    );
  }

  late final TabController tabController;

  @override
  void onInit() {
    super.onInit();
    Get.put(AccountActivityLoginLogic());
    Get.put(AccountActivityOperationLogic());
  }
}
