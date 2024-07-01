import 'package:gogaming_app/pages/account_activity/common/account_activity_base_logic.dart';
import 'package:gogaming_app/pages/account_activity/common/account_activity_type_enum.dart';

class AccountActivityLoginState extends IAccountActivityState {}

class AccountActivityLoginLogic extends AccountActivityBaseLogic {
  AccountActivityLoginLogic()
      : super(
          state: AccountActivityLoginState(),
          type: AccountActivityType.login,
        );
}
