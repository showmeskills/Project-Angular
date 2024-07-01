import 'package:gogaming_app/common/api/appeal/models/gaming_tx_info_model.dart';

class GamingCurrencyAppealDetailModel {
  String? appealId;
  String? orderNum;
  String? currency;
  double? amount;
  String? userName;
  String? paymentName;
  List<String> images;
  List<String> paymentImages;
  String? video;
  String? supplementExplanation;
  String? precautions;
  String? handleResult;
  String? handleResultTxt;

  bool get needUploadVideo {
    return handleResult == 'SupplementVerify';
  }

  GamingCurrencyAppealDetailModel({
    this.appealId,
    this.orderNum,
    this.currency,
    this.amount,
    this.userName,
    this.paymentName,
    this.images = const [],
    this.paymentImages = const [],
    this.video,
    this.supplementExplanation,
    this.precautions,
    this.handleResult,
    this.handleResultTxt,
  });

  @override
  String toString() {
    return 'GamingCurrencyAppealDetailModel(appealId: $appealId, orderNum: $orderNum, currency: $currency, amount: $amount, userName: $userName, paymentName: $paymentName, images: $images, paymentImages: $paymentImages, video: $video, supplementExplanation: $supplementExplanation, precautions: $precautions, handleResult: $handleResult, handleResultTxt: $handleResultTxt)';
  }

  factory GamingCurrencyAppealDetailModel.fromJson(Map<String, Object?> json) {
    return GamingCurrencyAppealDetailModel(
      appealId: json['appealId'] as String?,
      orderNum: json['orderNum'] as String?,
      currency: json['currency'] as String?,
      amount: (json['amount'] as num?)?.toDouble(),
      userName: json['userName'] as String?,
      paymentName: json['paymentName'] as String?,
      images: List<String>.from(json['images'] as List<dynamic>? ?? []),
      paymentImages:
          List<String>.from(json['paymentImages'] as List<dynamic>? ?? []),
      video: json['video'] as String?,
      supplementExplanation: json['supplementExplanation'] as String?,
      precautions: json['precautions'] as String?,
      handleResult: json['handleResult'] as String?,
      handleResultTxt: json['handleResultTxt'] as String?,
    );
  }

  GamingTxInfoModel toTxInfoModel() {
    return GamingTxInfoModel(
      orderNum: orderNum,
      currency: currency,
      amount: amount,
      userName: userName,
      paymentName: paymentName,
      paymentImages: paymentImages,
    );
  }

  Map<String, Object?> toJson() => {
        'appealId': appealId,
        'orderNum': orderNum,
        'currency': currency,
        'amount': amount,
        'userName': userName,
        'paymentName': paymentName,
        'images': images,
        'paymentImages': paymentImages,
        'video': video,
        'supplementExplanation': supplementExplanation,
        'precautions': precautions,
        'handleResult': handleResult,
        'handleResultTxt': handleResultTxt,
      };

  GamingCurrencyAppealDetailModel copyWith({
    String? appealId,
    String? orderNum,
    String? currency,
    double? amount,
    String? userName,
    String? paymentName,
    List<String>? images,
    List<String>? paymentImages,
    String? video,
    String? supplementExplanation,
    String? precautions,
    String? handleResult,
    String? handleResultTxt,
  }) {
    return GamingCurrencyAppealDetailModel(
      appealId: appealId ?? this.appealId,
      orderNum: orderNum ?? this.orderNum,
      currency: currency ?? this.currency,
      amount: amount ?? this.amount,
      userName: userName ?? this.userName,
      paymentName: paymentName ?? this.paymentName,
      images: images ?? this.images,
      paymentImages: paymentImages ?? this.paymentImages,
      video: video ?? this.video,
      supplementExplanation:
          supplementExplanation ?? this.supplementExplanation,
      precautions: precautions ?? this.precautions,
      handleResult: handleResult ?? this.handleResult,
      handleResultTxt: handleResultTxt ?? this.handleResultTxt,
    );
  }
}
