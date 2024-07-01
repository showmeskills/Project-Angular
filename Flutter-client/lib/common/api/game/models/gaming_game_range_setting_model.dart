import 'dart:convert';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingGameRangeSettingModel {
  GamingGameRangeSettingModel({
    required this.providerSettingList,
  });

  factory GamingGameRangeSettingModel.fromJson(Map<String, dynamic> json) {
    final List<ProviderSettingList>? providerSettingList =
        json['providerSettingList'] is List ? <ProviderSettingList>[] : null;
    if (providerSettingList != null) {
      for (final dynamic item in json['providerSettingList'] as List) {
        if (item != null) {
          providerSettingList.add(
              ProviderSettingList.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return GamingGameRangeSettingModel(
      providerSettingList: providerSettingList!,
    );
  }

  List<ProviderSettingList> providerSettingList;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'providerSettingList': providerSettingList,
      };
}

class ProviderSettingList {
  ProviderSettingList({
    this.providerCatId,
    required this.currencySettingList,
  });

  factory ProviderSettingList.fromJson(Map<String, dynamic> json) {
    final List<CurrencySettingList>? currencySettingList =
        json['currencySettingList'] is List ? <CurrencySettingList>[] : null;
    if (currencySettingList != null) {
      for (final dynamic item in json['currencySettingList'] as List) {
        if (item != null) {
          currencySettingList.add(
              CurrencySettingList.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return ProviderSettingList(
      providerCatId: asT<String>(json['providerCatId'])!,
      currencySettingList: currencySettingList!,
    );
  }

  // String providerId;
  String? providerCatId;
  List<CurrencySettingList> currencySettingList;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'providerCatId': providerCatId,
        'currencySettingList': currencySettingList,
      };
}

class CurrencySettingList {
  CurrencySettingList({
    required this.currency,
    required this.rangeSettingList,
  });

  factory CurrencySettingList.fromJson(Map<String, dynamic> json) {
    final List<RangeSettingList>? rangeSettingList =
        json['rangeSettingList'] is List ? <RangeSettingList>[] : null;
    if (rangeSettingList != null) {
      for (final dynamic item in json['rangeSettingList'] as List) {
        if (item != null) {
          rangeSettingList
              .add(RangeSettingList.fromJson(asT<Map<String, dynamic>>(item)!));
        }
      }
    }
    return CurrencySettingList(
      currency: asT<String>(json['currency'])!,
      rangeSettingList: rangeSettingList!,
    );
  }

  String currency;
  List<RangeSettingList> rangeSettingList;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'currency': currency,
        'rangeSettingList': rangeSettingList,
      };
}

class RangeSettingList {
  RangeSettingList({
    required this.oddType,
    required this.value,
  });

  factory RangeSettingList.fromJson(Map<String, dynamic> json) =>
      RangeSettingList(
        oddType: asT<String>(json['oddType'])!,
        value: asT<String>(json['value'])!,
      );

  String oddType;
  String value;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'oddType': oddType,
        'value': value,
      };

  @override
  bool operator ==(Object other) {
    return other is RangeSettingList &&
        oddType == other.oddType &&
        value == other.value;
  }

  @override
  int get hashCode {
    return oddType.hashCode ^ value.hashCode;
  }
}
