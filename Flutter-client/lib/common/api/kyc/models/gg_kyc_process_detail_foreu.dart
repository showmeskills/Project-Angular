import 'dart:convert';
import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GGKycProcessDetailForEu {
  GGKycProcessDetailForEu({
    this.advancedProcessLog,
    this.idcardProcessLog,
    this.poaProcessLog,
    this.primaryProcessLog,
    this.userInfo,
  });

  factory GGKycProcessDetailForEu.fromJson(Map<String, dynamic> json) =>
      GGKycProcessDetailForEu(
        advancedProcessLog: asT<Object?>(json['advancedProcessLog']),
        idcardProcessLog: json['idcardProcessLog'] == null
            ? null
            : IdcardProcessLog.fromJson(
                asT<Map<String, dynamic>>(json['idcardProcessLog'])!),
        poaProcessLog: json['poaProcessLog'] == null
            ? null
            : PoaProcessLog.fromJson(
                asT<Map<String, dynamic>>(json['poaProcessLog'])!),
        primaryProcessLog: json['primaryProcessLog'] == null
            ? null
            : PrimaryProcessLog.fromJson(
                asT<Map<String, dynamic>>(json['primaryProcessLog'])!),
        userInfo: json['userInfo'] == null
            ? null
            : UserInfo.fromJson(asT<Map<String, dynamic>>(json['userInfo'])!),
      );

  Object? advancedProcessLog;
  IdcardProcessLog? idcardProcessLog;
  PoaProcessLog? poaProcessLog;
  PrimaryProcessLog? primaryProcessLog;
  UserInfo? userInfo;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'advancedProcessLog': advancedProcessLog,
        'idcardProcessLog': idcardProcessLog,
        'poaProcessLog': poaProcessLog,
        'primaryProcessLog': primaryProcessLog,
        'userInfo': userInfo,
      };
}

class IdcardProcessLog {
  IdcardProcessLog({
    this.originalFileName,
    this.frontsideImage,
    this.firstName,
    this.lastName,
    this.address,
    this.dob,
    this.backsideImage,
    this.country,
    this.idType,
  });

  factory IdcardProcessLog.fromJson(Map<String, dynamic> json) =>
      IdcardProcessLog(
        originalFileName: GGUtil.parseStr(json['originalFileName']),
        frontsideImage: GGUtil.parseStr(json['FrontsideImage']),
        firstName: GGUtil.parseStr(json['firstName']),
        lastName: GGUtil.parseStr(json['lastName']),
        address: GGUtil.parseStr(json['address']),
        dob: GGUtil.parseStr(json['Dob']),
        backsideImage: GGUtil.parseStr(json['BacksideImage']),
        country: GGUtil.parseStr(json['Country']),
        idType: GGUtil.parseStr(json['IdType']),
      );

  String? originalFileName;
  String? frontsideImage;
  String? firstName;
  String? lastName;
  String? address;
  String? dob;
  String? backsideImage;
  String? country;
  String? idType;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'originalFileName': originalFileName,
        'FrontsideImage': frontsideImage,
        'firstName': firstName,
        'lastName': lastName,
        'address': address,
        'Dob': dob,
        'BacksideImage': backsideImage,
        'Country': country,
        'IdType': idType,
      };
}

class PoaProcessLog {
  PoaProcessLog({
    this.originalFileName,
    this.country,
    this.uid,
    this.networkImgeUrl,
    this.address,
    this.clientKey,
    this.city,
    this.postalCode,
  });

  factory PoaProcessLog.fromJson(Map<String, dynamic> json) => PoaProcessLog(
        originalFileName: GGUtil.parseStr(json['originalFileName']),
        country: GGUtil.parseStr(json['country']),
        uid: GGUtil.parseStr(json['uid']),
        networkImgeUrl: GGUtil.parseStr(json['networkImgeUrl']),
        address: GGUtil.parseStr(json['address']),
        clientKey: GGUtil.parseStr(json['clientKey']),
        city: GGUtil.parseStr(json['city']),
        postalCode: GGUtil.parseStr(json['postalCode']),
      );

  String? originalFileName;
  String? country;
  String? uid;
  String? networkImgeUrl;
  String? address;
  String? clientKey;
  String? city;
  String? postalCode;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'originalFileName': originalFileName,
        'country': country,
        'uid': uid,
        'networkImgeUrl': networkImgeUrl,
        'address': address,
        'clientKey': clientKey,
        'city': city,
        'postalCode': postalCode,
      };
}

class PrimaryProcessLog {
  PrimaryProcessLog({
    this.firstName,
    this.lastName,
    this.zipCode,
    this.address,
    this.city,
    this.countryCode,
    this.dob,
  });

  factory PrimaryProcessLog.fromJson(Map<String, dynamic> json) =>
      PrimaryProcessLog(
        firstName: GGUtil.parseStr(json['firstName']),
        lastName: GGUtil.parseStr(json['lastName']),
        zipCode: GGUtil.parseStr(json['zipCode']),
        address: GGUtil.parseStr(json['address']),
        city: GGUtil.parseStr(json['city']),
        countryCode: GGUtil.parseStr(json['countryCode']),
        dob: GGUtil.parseStr(json['dob']),
      );

  String? firstName;
  String? lastName;
  String? zipCode;
  String? address;
  String? city;
  String? countryCode;
  String? dob;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'firstName': firstName,
        'lastName': lastName,
        'zipCode': zipCode,
        'address': address,
        'city': city,
        'countryCode': countryCode,
        'dob': dob,
      };
}

class UserInfo {
  UserInfo({
    this.entityId,
    this.clientKey,
    this.fullName,
    this.firstName,
    this.lastName,
    this.entityCountryCode,
    this.primaryVerificationStatus,
    this.primaryVerificationTime,
    this.intermediateVerificationStatus,
    this.intermediateVerificationCreateTime,
    this.intermediateVerificationTime,
    this.advancedVerificationStatus,
    this.advancedVerificationTime,
    this.rejectReason,
    this.birthDay,
    this.idType,
    this.city,
    this.zipCode,
    this.address,
    this.middleName,
    this.idVerificationStatus,
    this.poaVerificationStatus,
    this.idVerificationRejectReason,
    this.poaVerificationRejectReason,
    this.poaFileStatus,
    this.idFileStatus,
  });

  factory UserInfo.fromJson(Map<String, dynamic> json) => UserInfo(
        entityId: GGUtil.parseStr(json['entityId']),
        clientKey: GGUtil.parseStr(json['clientKey']),
        fullName: asT<Object?>(json['fullName']),
        firstName: GGUtil.parseStr(json['firstName']),
        lastName: GGUtil.parseStr(json['lastName']),
        entityCountryCode: GGUtil.parseStr(json['entityCountryCode']),
        primaryVerificationStatus:
            GGUtil.parseStr(json['primaryVerificationStatus']),
        primaryVerificationTime:
            GGUtil.parseInt(json['primaryVerificationTime']),
        intermediateVerificationStatus:
            GGUtil.parseStr(json['intermediateVerificationStatus']),
        intermediateVerificationCreateTime:
            asT<Object?>(json['intermediateVerificationCreateTime']),
        intermediateVerificationTime:
            GGUtil.parseInt(json['intermediateVerificationTime']),
        advancedVerificationStatus:
            asT<Object?>(json['advancedVerificationStatus']),
        advancedVerificationTime:
            asT<Object?>(json['advancedVerificationTime']),
        rejectReason: asT<Object?>(json['rejectReason']),
        birthDay: GGUtil.parseStr(json['birthDay']),
        idType: asT<Object?>(json['idType']),
        city: GGUtil.parseStr(json['city']),
        zipCode: GGUtil.parseStr(json['zipCode']),
        address: GGUtil.parseStr(json['address']),
        middleName: asT<Object?>(json['middleName']),
        idVerificationStatus: GGUtil.parseStr(json['idVerificationStatus']),
        poaVerificationStatus: GGUtil.parseStr(json['poaVerificationStatus']),
        idVerificationRejectReason:
            GGUtil.parseStr(json['idVerificationRejectReason']),
        poaVerificationRejectReason:
            asT<Object?>(json['poaVerificationRejectReason']),
        idFileStatus: GGUtil.parseInt(json['idFileStatus']),
        poaFileStatus: GGUtil.parseInt(json['poaFileStatus']),
      );

  String? entityId;
  String? clientKey;
  Object? fullName;
  String? firstName;
  String? lastName;
  String? entityCountryCode;
  String? primaryVerificationStatus;
  int? primaryVerificationTime;
  String? intermediateVerificationStatus;
  Object? intermediateVerificationCreateTime;
  int? intermediateVerificationTime;
  Object? advancedVerificationStatus;
  Object? advancedVerificationTime;
  Object? rejectReason;
  String? birthDay;
  Object? idType;
  String? city;
  String? zipCode;
  String? address;
  Object? middleName;
  String? idVerificationStatus;
  String? poaVerificationStatus;
  String? idVerificationRejectReason;
  Object? poaVerificationRejectReason;

  /// ia 审核状态 1 被拒 2 通过
  int? idFileStatus;

  /// poa 审核状态 1 被拒 2 通过
  int? poaFileStatus;

  @override
  String toString() {
    return jsonEncode(this);
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'entityId': entityId,
        'clientKey': clientKey,
        'fullName': fullName,
        'firstName': firstName,
        'lastName': lastName,
        'entityCountryCode': entityCountryCode,
        'primaryVerificationStatus': primaryVerificationStatus,
        'primaryVerificationTime': primaryVerificationTime,
        'intermediateVerificationStatus': intermediateVerificationStatus,
        'intermediateVerificationCreateTime':
            intermediateVerificationCreateTime,
        'intermediateVerificationTime': intermediateVerificationTime,
        'advancedVerificationStatus': advancedVerificationStatus,
        'advancedVerificationTime': advancedVerificationTime,
        'rejectReason': rejectReason,
        'birthDay': birthDay,
        'idType': idType,
        'city': city,
        'zipCode': zipCode,
        'address': address,
        'middleName': middleName,
        'idVerificationStatus': idVerificationStatus,
        'poaVerificationStatus': poaVerificationStatus,
        'idVerificationRejectReason': idVerificationRejectReason,
        'poaVerificationRejectReason': poaVerificationRejectReason,
        'idFileStatus': idFileStatus,
        'poaFileStatus': poaFileStatus,
      };
}
