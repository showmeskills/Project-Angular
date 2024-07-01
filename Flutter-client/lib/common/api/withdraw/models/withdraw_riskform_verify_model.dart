T? asT<T>(dynamic value) {
  if (value is T) {
    return value;
  }
  return null;
}

class WithdrawRiskformVerifyModel {
  bool? isValid;
  String? userName;
  String? kycType;
  String? kycCountry;
  String? country;
  bool? isNeedWalletAddress;
  String? walletAddressValid;
  String? asiaCodes;

  bool get isEurope => asiaCodes == 'Europe';

  WithdrawRiskformVerifyModel({
    this.isValid,
    this.userName,
    this.kycType,
    this.kycCountry,
    this.country,
    this.isNeedWalletAddress,
    this.walletAddressValid,
    this.asiaCodes,
  });

  @override
  String toString() {
    return 'WithdrawRiskformVerifyModel(isValid: $isValid, userName: $userName, kycType: $kycType, kycCountry: $kycCountry, country: $country, isNeedWalletAddress: $isNeedWalletAddress, walletAddressValid: $walletAddressValid, asiaCodes: $asiaCodes)';
  }

  factory WithdrawRiskformVerifyModel.fromJson(Map<String, Object?> json) {
    return WithdrawRiskformVerifyModel(
      isValid: asT<bool>(json['isValid']),
      userName: asT<String>(json['userName']),
      kycType: asT<String>(json['kycType']),
      kycCountry: asT<String>(json['kycCountry']),
      country: asT<String>(json['country']),
      isNeedWalletAddress: asT<bool>(json['isNeedWalletAddress']),
      walletAddressValid: asT<String>(json['walletAddressValid']),
      asiaCodes: asT<String>(json['asiaCodes']),
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
        'asiaCodes': asiaCodes,
      };

  WithdrawRiskformVerifyModel copyWith({
    bool? isValid,
    String? userName,
    String? kycType,
    String? kycCountry,
    String? country,
    bool? isNeedWalletAddress,
    String? walletAddressValid,
    String? asiaCodes,
  }) {
    return WithdrawRiskformVerifyModel(
      isValid: isValid ?? this.isValid,
      userName: userName ?? this.userName,
      kycType: kycType ?? this.kycType,
      kycCountry: kycCountry ?? this.kycCountry,
      country: country ?? this.country,
      isNeedWalletAddress: isNeedWalletAddress ?? this.isNeedWalletAddress,
      walletAddressValid: walletAddressValid ?? this.walletAddressValid,
      asiaCodes: asiaCodes ?? this.asiaCodes,
    );
  }
}
