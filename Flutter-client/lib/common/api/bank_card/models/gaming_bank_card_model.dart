class GamingBankCardModel {
  int id;
  String currencyType;
  String name;
  String bankCode;
  String bankName;
  String cardNum;
  bool isDefault;

  String get bankIcon {
    return 'assets/images/bank_logo/${bankCode.toUpperCase()}.png';
  }

  GamingBankCardModel({
    required this.id,
    required this.currencyType,
    required this.name,
    required this.bankCode,
    required this.bankName,
    required this.cardNum,
    this.isDefault = false,
  });

  @override
  String toString() {
    return 'BankCardModel(id: $id, currencyType: $currencyType, name: $name, bankCode: $bankCode, bankName: $bankName, cardNum: $cardNum, isDefault: $isDefault)';
  }

  factory GamingBankCardModel.fromJson(Map<String, Object?> json) =>
      GamingBankCardModel(
        id: json['id'] as int,
        currencyType: json['currencyType'] as String,
        name: json['name'] as String,
        bankCode: json['bankCode'] as String,
        bankName: json['bankName'] as String,
        cardNum: json['cardNum'] as String,
        isDefault: json['isDefault'] as bool? ?? false,
      );

  Map<String, Object?> toJson() => {
        'id': id,
        'currencyType': currencyType,
        'name': name,
        'bankCode': bankCode,
        'bankName': bankName,
        'cardNum': cardNum,
        'isDefault': isDefault,
      };

  GamingBankCardModel copyWith({
    int? id,
    String? currencyType,
    String? name,
    String? bankCode,
    String? bankName,
    String? cardNum,
    bool? isDefault,
  }) {
    return GamingBankCardModel(
      id: id ?? this.id,
      currencyType: currencyType ?? this.currencyType,
      name: name ?? this.name,
      bankCode: bankCode ?? this.bankCode,
      bankName: bankName ?? this.bankName,
      cardNum: cardNum ?? this.cardNum,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
