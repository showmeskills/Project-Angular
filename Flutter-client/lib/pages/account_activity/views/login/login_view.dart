import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/history/models/gaming_account_activity_model.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/account_activity/common/views/account_activity_base_view.dart';
import 'package:gogaming_app/pages/account_activity/logics/account_activity_login_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part '_login_item_view.dart';

class AccountActivityLoginView
    extends AccountActivityBaseView<AccountActivityLoginLogic> {
  const AccountActivityLoginView({super.key});

  @override
  Widget itemBuilder(GamingAccountActivityModel v) {
    return _LogicItemView(
      data: v,
    );
  }
}
