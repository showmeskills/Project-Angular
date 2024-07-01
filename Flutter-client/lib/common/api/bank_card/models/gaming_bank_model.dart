class GamingBankModel {
  String bankCode;
  String bankNameLocal;
  String bankNameEn;

  GamingBankModel({
    required this.bankCode,
    this.bankNameLocal = '',
    this.bankNameEn = '',
  });

  String get bankIcon {
    return 'assets/images/bank_logo/${bankCode.trim().toUpperCase()}.png';
  }

  bool search(String keyword) {
    return _search(bankCode, keyword) ||
        _search(bankNameEn, keyword) ||
        _search(bankNameLocal, keyword);
  }

  bool _search(String value, String keyword) {
    return value.toLowerCase().contains(keyword.toLowerCase());
  }

  @override
  String toString() {
    return 'GamingBankModel(bankCode: $bankCode, bankNameLocal: $bankNameLocal, bankNameEn: $bankNameEn)';
  }

  factory GamingBankModel.fromJson(Map<String, Object?> json) {
    return GamingBankModel(
      bankCode: json['bankCode'] as String,
      bankNameLocal: json['bankNameLocal'] as String? ?? '',
      bankNameEn: json['bankNameEn'] as String? ?? '',
    );
  }

  Map<String, Object?> toJson() => {
        'bankCode': bankCode,
        'bankNameLocal': bankNameLocal,
        'bankNameEn': bankNameEn,
      };

  GamingBankModel copyWith({
    String? bankCode,
    String? bankNameLocal,
    String? bankNameEn,
  }) {
    return GamingBankModel(
      bankCode: bankCode ?? this.bankCode,
      bankNameLocal: bankNameLocal ?? this.bankNameLocal,
      bankNameEn: bankNameEn ?? this.bankNameEn,
    );
  }
}
