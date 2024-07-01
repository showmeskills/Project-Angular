part of 'transfer_logic.dart';

class TransferState {
  RxBool showResult = false.obs;
  List<GamingOverviewTransferWalletModel> walletList = [];

  /// 第三方获取的真实金额
  final RxList<GamingAggsWalletModel> _wallets = <GamingAggsWalletModel>[].obs;
  List<GamingAggsWalletModel> get wallets => _wallets;

  late final String? category;

  final fromWallet =
      GamingOverviewTransferWalletModel(category: '', providerId: '').obs;
  final toWallet =
      GamingOverviewTransferWalletModel(category: '', providerId: '').obs;
  final mainWallet =
      GamingOverviewTransferWalletModel(category: '', providerId: '').obs;
  List<GGUserBalance> commonCurrency = [];
  final curBalance = GGUserBalance(
          isDigital: false, currency: '', balance: 0, sort: 0, minAmount: 0)
      .obs;

  /// 最小额
  RxDouble min = 10.0.obs;

  /// 最大额
  RxDouble max = 0.0.obs;

  /// 金额输入框
  late GamingTextFieldController numTextFieldController;

  final result = TransferResult(
          result: Result(resultCode: '', message: ''),
          data: ResultData(transactionId: ''),
          timestamp: 0)
      .obs;

  /// ag的 VND 只能输入10的倍数
  RxString errorAmountTip = ''.obs;
}
