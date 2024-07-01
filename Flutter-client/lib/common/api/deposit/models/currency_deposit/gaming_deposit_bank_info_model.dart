class GamingDepositBankInfoModel {
  String? bankName;
  String? bankAccountNumber;
  String? bankAccountHolder;

  bool get invalid =>
      bankName == null &&
      bankAccountNumber == null &&
      bankAccountHolder == null;

  GamingDepositBankInfoModel({
    this.bankName,
    this.bankAccountNumber,
    this.bankAccountHolder,
  });

  @override
  String toString() {
    return 'BankInfo(bankName: $bankName, bankAccountNumber: $bankAccountNumber, bankAccountHolder: $bankAccountHolder)';
  }

  factory GamingDepositBankInfoModel.fromJson(Map<String, Object?> json) =>
      GamingDepositBankInfoModel(
        bankName: json['bankName'] as String?,
        bankAccountNumber: json['bankAccountNumber'] as String?,
        bankAccountHolder: json['bankAccountHolder'] as String?,
      );

  Map<String, Object?> toJson() => {
        'bankName': bankName,
        'bankAccountNumber': bankAccountNumber,
        'bankAccountHolder': bankAccountHolder,
      };

  GamingDepositBankInfoModel copyWith({
    String? bankName,
    String? bankAccountNumber,
    String? bankAccountHolder,
  }) {
    return GamingDepositBankInfoModel(
      bankName: bankName ?? this.bankName,
      bankAccountNumber: bankAccountNumber ?? this.bankAccountNumber,
      bankAccountHolder: bankAccountHolder ?? this.bankAccountHolder,
    );
  }
}
