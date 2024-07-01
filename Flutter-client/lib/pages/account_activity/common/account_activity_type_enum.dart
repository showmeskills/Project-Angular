import 'package:gogaming_app/common/lang/locale_lang.dart';

enum AccountActivityType {
  login,
  operation,
}

extension AccountActivityTypeExtension on AccountActivityType {
  String get translate {
    switch (this) {
      case AccountActivityType.login:
        return localized('login_activity');
      case AccountActivityType.operation:
        return localized('security_activity');
    }
  }
}

enum AccountActivityStatus {
  all(0),
  successful(1),
  failed(2);

  const AccountActivityStatus(this.value);
  final int value;
}

extension AccountActivityStatusExtension on AccountActivityStatus {
  String get translate {
    switch (this) {
      case AccountActivityStatus.all:
        return localized('all');
      case AccountActivityStatus.successful:
        return localized('successful');
      case AccountActivityStatus.failed:
        return localized('failed');
    }
  }
}
