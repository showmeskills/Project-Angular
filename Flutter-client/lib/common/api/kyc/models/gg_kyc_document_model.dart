import 'dart:convert';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/utils/util.dart';

import 'gg_kyc_document_wealth_type.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GGKycDocumentModel {
  GGKycDocumentModel({
    this.idVerification,
    this.proofOfAddress,
    this.paymentMethod,
    this.customize,
    this.sow,
    this.kycAdvanced,
  });

  factory GGKycDocumentModel.fromJson(Map<String, dynamic> json) =>
      GGKycDocumentModel(
        idVerification: json['idVerification'] == null
            ? null
            : IdVerification.fromJson(
                asT<Map<String, dynamic>>(json['idVerification'])!),
        proofOfAddress: json['proofOfAddress'] == null
            ? null
            : ProofOfAddress.fromJson(
                asT<Map<String, dynamic>>(json['proofOfAddress'])!),
        paymentMethod: json['paymentMethod'] == null
            ? null
            : PaymentMethod.fromJson(
                asT<Map<String, dynamic>>(json['paymentMethod'])!),
        customize: json['customize'] == null
            ? null
            : Customize.fromJson(asT<Map<String, dynamic>>(json['customize'])!),
        sow: json['sow'] == null
            ? null
            : Sow.fromJson(asT<Map<String, dynamic>>(json['sow'])!),
        kycAdvanced: json['kycAdvanced'] == null
            ? null
            : Sow.fromJson(asT<Map<String, dynamic>>(json['kycAdvanced'])!),
      );

  IdVerification? idVerification;
  ProofOfAddress? proofOfAddress;
  PaymentMethod? paymentMethod;
  Customize? customize;
  Sow? sow;
  Sow? kycAdvanced;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'idVerification': idVerification,
        'proofOfAddress': proofOfAddress,
        'paymentMethod': paymentMethod,
        'customize': customize,
        'sow': sow,
        'kycAdvanced': kycAdvanced,
      };
}

class IdVerification {
  IdVerification({
    this.id,
    this.type,
    this.status,
    this.kycLevel,
    this.document,
  });

  factory IdVerification.fromJson(Map<String, dynamic> json) => IdVerification(
        id: GGUtil.parseInt(json['id']),
        type: GGUtil.parseStr(json['type']),
        status: GGUtil.parseStr(json['status']),
        kycLevel: GGUtil.parseStr(json['kycLevel']),
        document: json['document'] == null
            ? null
            : IdVerificationDocument.fromJson(
                asT<Map<String, dynamic>>(json['document'])!),
      );

  int? id;
  String? type;
  String? status;
  String? kycLevel;
  IdVerificationDocument? document;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'type': type,
        'status': status,
        'kycLevel': kycLevel,
        'document': document,
      };
}

class IdVerificationDocument {
  IdVerificationDocument({
    this.country,
    this.id,
    this.idType,
    this.frontImage,
    this.backImage,
    this.originalFrontImageName,
    this.originalBackImageName,
  });

  factory IdVerificationDocument.fromJson(Map<String, dynamic> json) =>
      IdVerificationDocument(
        country: GGUtil.parseStr(json['country']),
        id: GGUtil.parseInt(json['id']),
        idType: GGUtil.parseStr(json['idType']),
        frontImage: GGUtil.parseStr(json['frontImage']),
        backImage: GGUtil.parseStr(json['backImage']),
        originalFrontImageName: GGUtil.parseStr(json['originalFrontImageName']),
        originalBackImageName: GGUtil.parseStr(json['originalBackImageName']),
      );

  String? country;
  int? id;
  String? idType;
  String? frontImage;
  String? backImage;
  String? originalFrontImageName;
  String? originalBackImageName;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'country': country,
        'id': id,
        'idType': idType,
        'frontImage': frontImage,
        'backImage': backImage,
        'originalFrontImageName': originalFrontImageName,
        'originalBackImageName': originalBackImageName,
      };
}

class ProofOfAddress {
  ProofOfAddress({
    this.id,
    this.type,
    this.status,
    this.kycLevel,
    this.document,
  });

  factory ProofOfAddress.fromJson(Map<String, dynamic> json) => ProofOfAddress(
        id: GGUtil.parseInt(json['id']),
        type: GGUtil.parseStr(json['type']),
        status: GGUtil.parseStr(json['status']),
        kycLevel: GGUtil.parseStr(json['kycLevel']),
        document: json['document'] == null
            ? null
            : ProofOfAddressDocument.fromJson(
                asT<Map<String, dynamic>>(json['document'])!),
      );

  int? id;
  String? type;
  String? status;
  String? kycLevel;
  ProofOfAddressDocument? document;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'type': type,
        'status': status,
        'kycLevel': kycLevel,
        'document': document,
      };
}

class ProofOfAddressDocument {
  ProofOfAddressDocument({
    this.id,
    this.country,
    this.address,
    this.city,
    this.postalCode,
    this.screenshotProof,
    this.originalFileName,
  });

  factory ProofOfAddressDocument.fromJson(Map<String, dynamic> json) =>
      ProofOfAddressDocument(
        id: GGUtil.parseInt(json['id']),
        country: GGUtil.parseStr(json['country']),
        address: GGUtil.parseStr(json['address']),
        city: GGUtil.parseStr(json['city']),
        postalCode: GGUtil.parseStr(json['postalCode']),
        screenshotProof: GGUtil.parseStr(json['screenshotProof']),
        originalFileName: GGUtil.parseStr(json['originalFileName']),
      );

  int? id;
  String? country;
  String? address;
  String? city;
  String? postalCode;
  String? screenshotProof;
  String? originalFileName;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'country': country,
        'address': address,
        'city': city,
        'postalCode': postalCode,
        'screenshotProof': screenshotProof,
        'originalFileName': originalFileName,
      };
}

class PaymentMethod {
  PaymentMethod({
    this.id,
    this.type,
    this.status,
    this.kycLevel,
    this.document,
  });

  factory PaymentMethod.fromJson(Map<String, dynamic> json) => PaymentMethod(
        id: GGUtil.parseInt(json['id']),
        type: GGUtil.parseStr(json['type']),
        status: GGUtil.parseStr(json['status']),
        kycLevel: GGUtil.parseStr(json['kycLevel']),
        document: json['document'] == null
            ? null
            : PaymentMethodDocument.fromJson(
                asT<Map<String, dynamic>>(json['document'])!),
      );

  int? id;
  String? type;
  String? status;
  String? kycLevel;
  PaymentMethodDocument? document;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'type': type,
        'status': status,
        'kycLevel': kycLevel,
        'document': document,
      };
}

class PaymentMethodDocument {
  PaymentMethodDocument({
    this.id,
    this.paymentName,
    this.screenshotProof,
    this.originalFileName,
  });

  factory PaymentMethodDocument.fromJson(Map<String, dynamic> json) =>
      PaymentMethodDocument(
        id: GGUtil.parseInt(json['id']),
        paymentName: GGUtil.parseStr(json['paymentName']),
        screenshotProof: GGUtil.parseStr(json['screenshotProof']),
        originalFileName: GGUtil.parseStr(json['originalFileName']),
      );

  int? id;
  String? paymentName;
  String? screenshotProof;
  String? originalFileName;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'paymentName': paymentName,
        'screenshotProof': screenshotProof,
        'originalFileName': originalFileName,
      };
}

class Customize {
  Customize({
    this.id,
    this.type,
    this.status,
    this.kycLevel,
    this.document,
  });

  factory Customize.fromJson(Map<String, dynamic> json) => Customize(
        id: GGUtil.parseInt(json['id']),
        type: GGUtil.parseStr(json['type']),
        status: GGUtil.parseStr(json['status']),
        kycLevel: GGUtil.parseStr(json['kycLevel']),
        document: json['document'] == null
            ? null
            : CustomizeDocument.fromJson(
                asT<Map<String, dynamic>>(json['document'])!),
      );

  int? id;
  String? type;
  String? status;
  String? kycLevel;
  CustomizeDocument? document;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'type': type,
        'status': status,
        'kycLevel': kycLevel,
        'document': document,
      };
}

class CustomizeDocument {
  CustomizeDocument({
    this.id,
    this.customizeName,
    this.customizeValue,
    this.originalFileName,
  });

  factory CustomizeDocument.fromJson(Map<String, dynamic> json) =>
      CustomizeDocument(
        id: GGUtil.parseInt(json['id']),
        customizeName: GGUtil.parseStr(json['customizeName']),
        customizeValue: GGUtil.parseStr(json['customizeValue']),
        originalFileName: GGUtil.parseStr(json['originalFileName']),
      );

  int? id;
  String? customizeName;
  String? customizeValue;
  String? originalFileName;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'customizeName': customizeName,
        'customizeValue': customizeValue,
        'originalFileName': originalFileName,
      };
}

class Sow {
  Sow({
    this.id,
    this.type,
    this.status,
    this.kycLevel,
    this.document,
  });

  factory Sow.fromJson(Map<String, dynamic> json) => Sow(
        id: GGUtil.parseInt(json['id']),
        type: GGUtil.parseStr(json['type']),
        status: GGUtil.parseStr(json['status']),
        kycLevel: GGUtil.parseStr(json['kycLevel']),
        document: json['document'] == null
            ? null
            : SowDocument.fromJson(
                asT<Map<String, dynamic>>(json['document'])!),
      );

  int? id;
  String? type;
  String? status;
  String? kycLevel;
  SowDocument? document;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'type': type,
        'status': status,
        'kycLevel': kycLevel,
        'document': document,
      };
}

class SowDocument {
  SowDocument({
    this.id,
    this.moneySources,
    this.salaryImages,
    this.selfEmployedIncomeImages,
    this.savingsImages,
    this.allowanceImages,
    this.pensionImages,
    this.dividendsProfitFromCompanyImages,
    this.daytradingImages,
    this.gamblingImages,
    this.passiveIncomeImages,
    this.loansMortgagesImages,
    this.saleOfFinancialAssetsImages,
    this.salesOfRealEstateOrOtherAssetsImages,
    this.inheritanceImages,
    this.donationsImages,
    this.cryptoMiningImages,
  });

  factory SowDocument.fromJson(Map<String, dynamic> json) {
    final List<Object>? moneySources =
        json['moneySources'] is List ? <Object>[] : null;
    if (moneySources != null) {
      for (final dynamic item in json['moneySources']! as List) {
        if (item != null) {
          moneySources.add(asT<Object>(item)!);
        }
      }
    }

    final List<String>? salaryImages =
        json['salaryImages'] is List ? <String>[] : null;
    if (salaryImages != null) {
      for (final dynamic item in json['salaryImages']! as List) {
        if (item != null) {
          salaryImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? selfEmployedIncomeImages =
        json['selfEmployedIncomeImages'] is List ? <String>[] : null;
    if (selfEmployedIncomeImages != null) {
      for (final dynamic item in json['selfEmployedIncomeImages']! as List) {
        if (item != null) {
          selfEmployedIncomeImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? savingsImages =
        json['savingsImages'] is List ? <String>[] : null;
    if (savingsImages != null) {
      for (final dynamic item in json['savingsImages']! as List) {
        if (item != null) {
          savingsImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? allowanceImages =
        json['allowanceImages'] is List ? <String>[] : null;
    if (allowanceImages != null) {
      for (final dynamic item in json['allowanceImages']! as List) {
        if (item != null) {
          allowanceImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? pensionImages =
        json['pensionImages'] is List ? <String>[] : null;
    if (pensionImages != null) {
      for (final dynamic item in json['pensionImages']! as List) {
        if (item != null) {
          pensionImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? dividendsProfitFromCompanyImages =
        json['dividendsProfitFromCompanyImages'] is List ? <String>[] : null;
    if (dividendsProfitFromCompanyImages != null) {
      for (final dynamic item
          in json['dividendsProfitFromCompanyImages']! as List) {
        if (item != null) {
          dividendsProfitFromCompanyImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? daytradingImages =
        json['daytradingImages'] is List ? <String>[] : null;
    if (daytradingImages != null) {
      for (final dynamic item in json['daytradingImages']! as List) {
        if (item != null) {
          daytradingImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? gamblingImages =
        json['gamblingImages'] is List ? <String>[] : null;
    if (gamblingImages != null) {
      for (final dynamic item in json['gamblingImages']! as List) {
        if (item != null) {
          gamblingImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? passiveIncomeImages =
        json['passiveIncomeImages'] is List ? <String>[] : null;
    if (passiveIncomeImages != null) {
      for (final dynamic item in json['passiveIncomeImages']! as List) {
        if (item != null) {
          passiveIncomeImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? loansMortgagesImages =
        json['loansMortgagesImages'] is List ? <String>[] : null;
    if (loansMortgagesImages != null) {
      for (final dynamic item in json['loansMortgagesImages']! as List) {
        if (item != null) {
          loansMortgagesImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? saleOfFinancialAssetsImages =
        json['saleOfFinancialAssetsImages'] is List ? <String>[] : null;
    if (saleOfFinancialAssetsImages != null) {
      for (final dynamic item in json['saleOfFinancialAssetsImages']! as List) {
        if (item != null) {
          saleOfFinancialAssetsImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? salesOfRealEstateOrOtherAssetsImages =
        json['salesOfRealEstateOrOtherAssetsImages'] is List
            ? <String>[]
            : null;
    if (salesOfRealEstateOrOtherAssetsImages != null) {
      for (final dynamic item
          in json['salesOfRealEstateOrOtherAssetsImages']! as List) {
        if (item != null) {
          salesOfRealEstateOrOtherAssetsImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? inheritanceImages =
        json['inheritanceImages'] is List ? <String>[] : null;
    if (inheritanceImages != null) {
      for (final dynamic item in json['inheritanceImages']! as List) {
        if (item != null) {
          inheritanceImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? donationsImages =
        json['donationsImages'] is List ? <String>[] : null;
    if (donationsImages != null) {
      for (final dynamic item in json['donationsImages']! as List) {
        if (item != null) {
          donationsImages.add(GGUtil.parseStr(item));
        }
      }
    }

    final List<String>? cryptoMiningImages =
        json['cryptoMiningImages'] is List ? <String>[] : null;
    if (cryptoMiningImages != null) {
      for (final dynamic item in json['cryptoMiningImages']! as List) {
        if (item != null) {
          cryptoMiningImages.add(GGUtil.parseStr(item));
        }
      }
    }
    return SowDocument(
      id: GGUtil.parseInt(json['id']),
      moneySources: moneySources,
      salaryImages: salaryImages,
      selfEmployedIncomeImages: selfEmployedIncomeImages,
      savingsImages: savingsImages,
      allowanceImages: allowanceImages,
      pensionImages: pensionImages,
      dividendsProfitFromCompanyImages: dividendsProfitFromCompanyImages,
      daytradingImages: daytradingImages,
      gamblingImages: gamblingImages,
      passiveIncomeImages: passiveIncomeImages,
      loansMortgagesImages: loansMortgagesImages,
      saleOfFinancialAssetsImages: saleOfFinancialAssetsImages,
      salesOfRealEstateOrOtherAssetsImages:
          salesOfRealEstateOrOtherAssetsImages,
      inheritanceImages: inheritanceImages,
      donationsImages: donationsImages,
      cryptoMiningImages: cryptoMiningImages,
    );
  }

  int? id;
  List<Object>? moneySources;
  List<String>? salaryImages;
  List<String>? selfEmployedIncomeImages;
  List<String>? savingsImages;
  List<String>? allowanceImages;
  List<String>? pensionImages;
  List<String>? dividendsProfitFromCompanyImages;
  List<String>? daytradingImages;
  List<String>? gamblingImages;
  List<String>? passiveIncomeImages;
  List<String>? loansMortgagesImages;
  List<String>? saleOfFinancialAssetsImages;
  List<String>? salesOfRealEstateOrOtherAssetsImages;
  List<String>? inheritanceImages;
  List<String>? donationsImages;
  List<String>? cryptoMiningImages;

  // 获取文件类型和文件名字
  List<Map<String, dynamic>>? get typeList {
    List<Map<String, dynamic>> result = [];
    if (salaryImages != null && salaryImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.salaryImages.text),
        'images': salaryImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (selfEmployedIncomeImages != null &&
        selfEmployedIncomeImages!.isNotEmpty) {
      result.add({
        'name':
            localized(GGKycDocumentWealthType.selfEmployedIncomeImages.text),
        'images': selfEmployedIncomeImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (savingsImages != null && savingsImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.savingsImages.text),
        'images': savingsImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (allowanceImages != null && allowanceImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.allowanceImages.text),
        'images': allowanceImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (pensionImages != null && pensionImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.pensionImages.text),
        'images': pensionImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (dividendsProfitFromCompanyImages != null &&
        dividendsProfitFromCompanyImages!.isNotEmpty) {
      result.add({
        'name': localized(
            GGKycDocumentWealthType.dividendsProfitFromCompanyImages.text),
        'images': dividendsProfitFromCompanyImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (daytradingImages != null && daytradingImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.daytradingImages.text),
        'images': daytradingImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (gamblingImages != null && gamblingImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.gamblingImages.text),
        'images': gamblingImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (loansMortgagesImages != null && loansMortgagesImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.loansMortgagesImages.text),
        'images': loansMortgagesImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (passiveIncomeImages != null && passiveIncomeImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.passiveIncomeImages.text),
        'images': passiveIncomeImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (saleOfFinancialAssetsImages != null &&
        saleOfFinancialAssetsImages!.isNotEmpty) {
      result.add({
        'name':
            localized(GGKycDocumentWealthType.saleOfFinancialAssetsImages.text),
        'images': saleOfFinancialAssetsImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (salesOfRealEstateOrOtherAssetsImages != null &&
        salesOfRealEstateOrOtherAssetsImages!.isNotEmpty) {
      result.add({
        'name': localized(
            GGKycDocumentWealthType.salesOfRealEstateOrOtherAssetsImages.text),
        'images': salesOfRealEstateOrOtherAssetsImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (inheritanceImages != null && inheritanceImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.inheritanceImages.text),
        'images': inheritanceImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (donationsImages != null && donationsImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.donationsImages.text),
        'images': donationsImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    if (cryptoMiningImages != null && cryptoMiningImages!.isNotEmpty) {
      result.add({
        'name': localized(GGKycDocumentWealthType.cryptoMiningImages.text),
        'images': cryptoMiningImages!.map((url) {
          List<String> parts = url.split('/');
          return parts.last;
        }).toList()
      });
    }

    return result;
  }

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'moneySources': moneySources,
        'salaryImages': salaryImages,
        'selfEmployedIncomeImages': selfEmployedIncomeImages,
        'savingsImages': savingsImages,
        'allowanceImages': allowanceImages,
        'pensionImages': pensionImages,
        'dividendsProfitFromCompanyImages': dividendsProfitFromCompanyImages,
        'daytradingImages': daytradingImages,
        'gamblingImages': gamblingImages,
        'passiveIncomeImages': passiveIncomeImages,
        'loansMortgagesImages': loansMortgagesImages,
        'saleOfFinancialAssetsImages': saleOfFinancialAssetsImages,
        'salesOfRealEstateOrOtherAssetsImages':
            salesOfRealEstateOrOtherAssetsImages,
        'inheritanceImages': inheritanceImages,
        'donationsImages': donationsImages,
        'cryptoMiningImages': cryptoMiningImages,
      };
}
