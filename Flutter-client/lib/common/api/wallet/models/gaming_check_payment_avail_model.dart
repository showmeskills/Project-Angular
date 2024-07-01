T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class GamingCheckPaymentAvailModel {
  bool? isValid;
  String? userName;
  String? kycType;
  String? kycCountry;
  String? country;
  bool? isNeedWalletAddress;
  String? walletAddressValid;

  GamingCheckPaymentAvailModel({
    this.isValid,
    this.userName,
    this.kycType,
    this.kycCountry,
    this.country,
    this.isNeedWalletAddress,
    this.walletAddressValid,
  });

  @override
  String toString() {
    return 'GamingCheckPaymentAvailModel(isValid: $isValid, userName: $userName, kycType: $kycType, kycCountry: $kycCountry, country: $country, isNeedWalletAddress: $isNeedWalletAddress)';
  }

  factory GamingCheckPaymentAvailModel.fromJson(Map<String, Object?> json) {
    return GamingCheckPaymentAvailModel(
      isValid: asT<bool?>(json['isValid']),
      userName: asT<String?>(json['userName']),
      kycType: asT<String?>(json['kycType']),
      kycCountry: asT<String?>(json['kycCountry']),
      country: asT<String?>(json['country']),
      isNeedWalletAddress: asT<bool?>(json['isNeedWalletAddress']),
      walletAddressValid: asT<String?>(json['walletAddressValid']),
    );
  }

  Map<String, Object?> toJson() => {
        'isValid': isValid,
        'userName': userName,
        'kycType': kycType,
        'kycCountry': kycCountry,
        'country': country,
        'isNeedWalletAddress': isNeedWalletAddress,
        'walletAddressValid': walletAddressValid,
      };

  GamingCheckPaymentAvailModel copyWith({
    bool? isValid,
    String? userName,
    String? kycType,
    String? kycCountry,
    String? country,
    bool? isNeedWalletAddress,
    String? walletAddressValid,
  }) {
    return GamingCheckPaymentAvailModel(
      isValid: isValid ?? this.isValid,
      userName: userName ?? this.userName,
      kycType: kycType ?? this.kycType,
      kycCountry: kycCountry ?? this.kycCountry,
      country: country ?? this.country,
      isNeedWalletAddress: isNeedWalletAddress ?? this.isNeedWalletAddress,
      walletAddressValid: walletAddressValid ?? this.walletAddressValid,
    );
  }
}
