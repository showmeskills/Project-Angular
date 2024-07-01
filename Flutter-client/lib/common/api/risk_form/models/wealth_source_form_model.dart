// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'package:gogaming_app/common/api/risk_form/enum.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_wealth_source_selector.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

List<String> asList(dynamic value) {
  if (value is List) {
    return List.from(value);
  }
  return [];
}

class WealthSourceFormModel {
  Quota? depositLimit;
  List<WealthSourceType> moneySources;
  List<String> salaryImages;
  List<String> soleTraderImages;
  List<String> depositsImages;
  List<String> pensionImages;
  List<String> stockImages;
  List<String> businessImages;
  List<String> investImages;
  List<String> gambleImages;
  List<String> saleHouseImages;
  List<String> rentImages;
  List<String> borrowMoneyImages;
  List<String> legacyImages;
  List<String> contributedImages;
  List<String> otherImages;

  WealthSourceFormModel({
    this.depositLimit,
    this.moneySources = const [],
    this.salaryImages = const [],
    this.soleTraderImages = const [],
    this.depositsImages = const [],
    this.pensionImages = const [],
    this.stockImages = const [],
    this.businessImages = const [],
    this.investImages = const [],
    this.gambleImages = const [],
    this.saleHouseImages = const [],
    this.rentImages = const [],
    this.borrowMoneyImages = const [],
    this.legacyImages = const [],
    this.contributedImages = const [],
    this.otherImages = const [],
  });

  @override
  String toString() {
    return 'Form(depositLimit: $depositLimit, moneySources: $moneySources, salaryImages: $salaryImages, soleTraderImages: $soleTraderImages, depositsImages: $depositsImages, pensionImages: $pensionImages, stockImages: $stockImages, businessImages: $businessImages, investImages: $investImages, gambleImages: $gambleImages, saleHouseImages: $saleHouseImages, rentImages: $rentImages, borrowMoneyImages: $borrowMoneyImages, legacyImages: $legacyImages, contributedImages: $contributedImages, otherImages: $otherImages)';
  }

  factory WealthSourceFormModel.fromJson(Map<String, Object?> json) {
    final types = List<WealthSourceType>.from(
        ((json['moneySources'] as List<dynamic>?)?.map((e) {
              final string = asT<String>(e);
              return string == null
                  ? null
                  : WealthSourceType.fromeValue(string);
            }).toList()
              ?..removeWhere((element) => element == null)) ??
            []);
    final depositLimitString = asT<String>(json['depositLimit']);
    return WealthSourceFormModel(
      depositLimit: depositLimitString == null
          ? null
          : Quota.fromeValue(depositLimitString),
      moneySources: types,
      salaryImages: asList(json['salaryImages']),
      soleTraderImages: asList(json['soleTraderImages']),
      depositsImages: asList(json['depositsImages']),
      pensionImages: asList(json['pensionImages']),
      stockImages: asList(json['stockImages']),
      businessImages: asList(json['businessImages']),
      investImages: asList(json['investImages']),
      gambleImages: asList(json['gambleImages']),
      saleHouseImages: asList(json['saleHouseImages']),
      rentImages: asList(json['rentImages']),
      borrowMoneyImages: asList(json['borrowMoneyImages']),
      legacyImages: asList(json['legacyImages']),
      contributedImages: asList(json['contributedImages']),
      otherImages: asList(json['otherImages']),
    );
  }

  Map<String, Object?> toJson() => {
        'depositLimit': depositLimit,
        'moneySources': moneySources,
        'salaryImages': salaryImages,
        'soleTraderImages': soleTraderImages,
        'depositsImages': depositsImages,
        'pensionImages': pensionImages,
        'stockImages': stockImages,
        'businessImages': businessImages,
        'investImages': investImages,
        'gambleImages': gambleImages,
        'saleHouseImages': saleHouseImages,
        'rentImages': rentImages,
        'borrowMoneyImages': borrowMoneyImages,
        'legacyImages': legacyImages,
        'contributedImages': contributedImages,
        'otherImages': otherImages,
      };

  List<String> getAttachments(WealthSourceType type) {
    // switch (type) {
    //   case WealthSourceType.salary:
    //     return salaryImages;
    //   case WealthSourceType.soleTrader:
    //     return soleTraderImages;
    //   case WealthSourceType.deposits:
    //     return depositsImages;
    //   case WealthSourceType.pension:
    //     return pensionImages;
    //   case WealthSourceType.stock:
    //     return stockImages;
    //   case WealthSourceType.business:
    //     return businessImages;
    //   case WealthSourceType.invest:
    //     return investImages;
    //   case WealthSourceType.gamble:
    //     return gambleImages;
    //   case WealthSourceType.saleHouse:
    //     return saleHouseImages;
    //   case WealthSourceType.rent:
    //     return rentImages;
    //   case WealthSourceType.borrowMoney:
    //     return borrowMoneyImages;
    //   case WealthSourceType.legacy:
    //     return legacyImages;
    //   case WealthSourceType.contributed:
    //     return contributedImages;
    //   case WealthSourceType.other:
    //     return otherImages;
    // }
    return [];
  }

  WealthSourceFormModel copyWith({
    Quota? depositLimit,
    List<WealthSourceType>? moneySources,
    List<String>? salaryImages,
    List<String>? soleTraderImages,
    List<String>? depositsImages,
    List<String>? pensionImages,
    List<String>? stockImages,
    List<String>? businessImages,
    List<String>? investImages,
    List<String>? gambleImages,
    List<String>? saleHouseImages,
    List<String>? rentImages,
    List<String>? borrowMoneyImages,
    List<String>? legacyImages,
    List<String>? contributedImages,
    List<String>? otherImages,
  }) {
    return WealthSourceFormModel(
      depositLimit: depositLimit ?? this.depositLimit,
      moneySources: moneySources ?? this.moneySources,
      salaryImages: salaryImages ?? this.salaryImages,
      soleTraderImages: soleTraderImages ?? this.soleTraderImages,
      depositsImages: depositsImages ?? this.depositsImages,
      pensionImages: pensionImages ?? this.pensionImages,
      stockImages: stockImages ?? this.stockImages,
      businessImages: businessImages ?? this.businessImages,
      investImages: investImages ?? this.investImages,
      gambleImages: gambleImages ?? this.gambleImages,
      saleHouseImages: saleHouseImages ?? this.saleHouseImages,
      rentImages: rentImages ?? this.rentImages,
      borrowMoneyImages: borrowMoneyImages ?? this.borrowMoneyImages,
      legacyImages: legacyImages ?? this.legacyImages,
      contributedImages: contributedImages ?? this.contributedImages,
      otherImages: otherImages ?? this.otherImages,
    );
  }
}
