part of 'gaming_wallet_history_deposit_logic.dart';

class GamingWalletHistoryDepositState {
  final cryptoData = <GamingCryptoHistoryModel>[].obs;
  int cryptoDataIndex = 1;

  final currencyData = <GamingCurrencyHistoryModel>[].obs;
  int currencyDataIndex = 1;
}
