import 'package:gogaming_app/pages/account_activity/common/account_activity_base_logic.dart';
import 'package:gogaming_app/pages/account_activity/common/account_activity_type_enum.dart';

class AccountActivityOperationState extends IAccountActivityState {}

class AccountActivityOperationLogic extends AccountActivityBaseLogic {
  AccountActivityOperationLogic()
      : super(
          state: AccountActivityOperationState(),
          type: AccountActivityType.operation,
        );
}
