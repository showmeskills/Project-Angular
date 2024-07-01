class GamingTransferWalletBalanceModel {
  double totalBalance;
  double availBalanceForWithdraw;
  double rate;

  GamingTransferWalletBalanceModel({
    this.totalBalance = 0,
    this.availBalanceForWithdraw = 0,
    this.rate = 1,
  });

  @override
  String toString() {
    return 'GamingTransferWalletBalanceModel(totalBalance: $totalBalance, availBalanceForWithdraw: $availBalanceForWithdraw, rate: $rate)';
  }

  factory GamingTransferWalletBalanceModel.fromJson(Map<String, Object?> json) {
    return GamingTransferWalletBalanceModel(
      totalBalance: (json['totalBalance'] as num).toDouble(),
      availBalanceForWithdraw:
          (json['availBalanceForWithdraw'] as num?)?.toDouble() ?? 0,
      rate: (json['rate'] as num).toDouble(),
    );
  }

  Map<String, Object?> toJson() => {
        'totalBalance': totalBalance,
        'availBalanceForWithdraw': availBalanceForWithdraw,
        'rate': rate,
      };

  GamingTransferWalletBalanceModel copyWith({
    double? totalBalance,
    double? availBalanceForWithdraw,
    double? rate,
  }) {
    return GamingTransferWalletBalanceModel(
      totalBalance: totalBalance ?? this.totalBalance,
      availBalanceForWithdraw:
          availBalanceForWithdraw ?? this.availBalanceForWithdraw,
      rate: rate ?? this.rate,
    );
  }
}

class GamingTransferWalletBalanceWithCurrencyModel
    extends GamingTransferWalletBalanceModel {
  String currency;

  GamingTransferWalletBalanceWithCurrencyModel({
    required this.currency,
    double totalBalance = 0,
    double vailBalanceForWithdraw = 0,
    double rate = 1,
  }) : super(
          totalBalance: totalBalance,
          availBalanceForWithdraw: vailBalanceForWithdraw,
          rate: rate,
        );
}
