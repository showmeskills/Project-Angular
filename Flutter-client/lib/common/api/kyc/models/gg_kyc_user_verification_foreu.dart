import 'dart:convert';
import 'package:gogaming_app/common/utils/util.dart';

T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GGKycUserVerificationForEu {
  GGKycUserVerificationForEu({
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
    this.idFileStatus,
    this.poaFileStatus,
  });

  factory GGKycUserVerificationForEu.fromJson(Map<String, dynamic> json) =>
      GGKycUserVerificationForEu(
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
            GGUtil.parseStr(json['poaVerificationRejectReason']),
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
  String? poaVerificationRejectReason;
  /// id 审核状态 1 被拒 2 通过
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
        "idFileStatus": idFileStatus,
        "poaFileStatus": poaFileStatus,
      };
}
