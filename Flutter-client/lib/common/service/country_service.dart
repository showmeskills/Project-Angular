import 'package:base_framework/base_framework.dart';
import 'package:gogaming_app/common/api/base/go_gaming_api.dart';
import 'package:gogaming_app/common/api/country/country_api.dart';
import 'package:gogaming_app/common/api/country/models/gaming_country_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/ip_service.dart';

import 'restart_service.dart';

class CountryService extends RestartServiceInterface {
  factory CountryService() => _getInstance();

  static CountryService get sharedInstance => _getInstance();

  static CountryService? _instance;

  static CountryService _getInstance() {
    _instance ??= CountryService._internal();
    return _instance!;
  }

  CountryService._internal() {
    // _currentCountry = _cacheCurrentCountry.val == null
    //     ? null
    //     : GamingCountryModel.fromMap(_cacheCurrentCountry.val!);
  }

  GamingCountryModel? _currentCountry;
  GamingCountryModel get currentCountry {
    return _currentCountry ?? _getCountryByLocale();
  }

  Map<String, GamingCountryModel>? _country;
  Map<String, GamingCountryModel>? get country => _country;
  List<GamingCountryModel> get countryList => _country?.values.toList() ?? [];

  // final _cacheCurrentCountry =
  //     ReadWriteValue<Map<String, dynamic>?>('CacheCurrentCountry', null);

  Stream<List<GamingCountryModel>> getCountry() {
    return PGSpi(Country.getCountry.toTarget())
        .rxRequest<List<GamingCountryModel>>((value) {
      if (value['data'] is List) {
        return (value['data'] as List)
            .map((e) => GamingCountryModel.fromMap(e as Map<String, dynamic>))
            .toList();
      }
      return [];
    }).flatMap((value) {
      _country = {for (var e in value.data) e.iso: e};
      return Stream.value(value.data);
    });
  }

  Stream<GamingCountryModel> getCurrentCountry() {
    if (_currentCountry != null) {
      return Stream.value(_currentCountry!);
    } else {
      return getCountry().flatMap((value) {
        return _getCountryByIP().flatMap((value) {
          return Stream.value(changeCurrentCountry(value));
        });
      });
    }
  }

  Stream<GamingCountryModel> _getCountryByIP() {
    return IPService.sharedInstance.getIpInfo().flatMap((value) {
      final v = _country?[value.countryCode];
      if (v == null) {
        throw UnsupportedError('不支持的国家');
      } else {
        return Stream.value(v);
      }
    }).onErrorResume((error, stackTrace) {
      return Stream.value(_getCountryByLocale());
    });
  }

  GamingCountryModel _getCountryByLocale() {
    final locale = AppLocalizations.of(Get.context!).locale;
    return _country?[locale.countryCode] ?? GamingCountryModel.defaultCountry();
  }

  GamingCountryModel changeCurrentCountry(GamingCountryModel country) {
    return _storeCurrentCountry(country.toMap());
  }

  GamingCountryModel _storeCurrentCountry(Map<String, dynamic> json) {
    // _cacheCurrentCountry.val = json;
    _currentCountry = GamingCountryModel.fromMap(json);
    return _currentCountry!;
  }

  @override
  void onClose() {
    _instance = null;
  }
}
