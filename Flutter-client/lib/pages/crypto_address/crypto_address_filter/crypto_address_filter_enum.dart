import 'package:gogaming_app/common/lang/locale_lang.dart';

enum CryptoAddressPayMethod {
  all,
  virtual,
  electronic;

  int? get value {
    switch (this) {
      case CryptoAddressPayMethod.all:
        return null;
      case CryptoAddressPayMethod.virtual:
        return 1;
      case CryptoAddressPayMethod.electronic:
        return 2;
    }
  }

  String get text {
    switch (this) {
      case CryptoAddressPayMethod.all:
        return localized('all');
      case CryptoAddressPayMethod.virtual:
        return localized('crypto');
      case CryptoAddressPayMethod.electronic:
        return localized('ew');
    }
  }
}

enum CryptoAddressIsUniversal {
  all,
  general,
  common;

  bool? get value {
    switch (this) {
      case CryptoAddressIsUniversal.all:
        return null;
      case CryptoAddressIsUniversal.general:
        return false;
      case CryptoAddressIsUniversal.common:
        return true;
    }
  }

  String get text {
    switch (this) {
      case CryptoAddressIsUniversal.all:
        return localized('all');
      case CryptoAddressIsUniversal.general:
        return localized('general_add');
      case CryptoAddressIsUniversal.common:
        return localized('common_add');
    }
  }
}

enum CryptoAddressIsWhitelist {
  all,
  yes,
  no;

  bool? get value {
    switch (this) {
      case CryptoAddressIsWhitelist.all:
        return null;
      case CryptoAddressIsWhitelist.yes:
        return true;
      case CryptoAddressIsWhitelist.no:
        return false;
    }
  }

  String get text {
    switch (this) {
      case CryptoAddressIsWhitelist.all:
        return localized('all');
      case CryptoAddressIsWhitelist.yes:
        return localized('w_add');
      case CryptoAddressIsWhitelist.no:
        return localized('nw_add');
    }
  }
}
