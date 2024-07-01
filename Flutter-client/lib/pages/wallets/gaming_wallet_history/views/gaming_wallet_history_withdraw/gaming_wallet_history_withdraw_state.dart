part of 'gaming_wallet_history_withdraw_logic.dart';

class GamingWalletHistoryWithdrawState {
  final cryptoData = <GamingCryptoHistoryModel>[].obs;
  int cryptoDataIndex = 1;

  final currencyData = <GamingCurrencyHistoryModel>[].obs;
  int currencyDataIndex = 1;
}
