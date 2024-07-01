part of 'digital_currency_withdrawal_logic.dart';

class DigitalCurrencyWithdrawalState {
  final _data = GoGamingPagination<GamingCryptoHistoryModel>().obs;
  GoGamingPagination<GamingCryptoHistoryModel> get data => _data.value;

  GGUserBalance? currencyBalance;
  late final _currency = currencyBalance.obs;
  GGUserBalance? get currency => _currency.value;

  /// 是否有冻结资金
  RxBool hasFreeze = false.obs;
  GamingWithdrawLimitModel? limitModel;
  late final _limitModel = limitModel.obs;
  GamingWithdrawLimitModel? get limit => _limitModel.value;

  // ignore: prefer_final_fields
  Map<String, List<GamingCurrencyNetworkModel>> _networks = {};

  /// 当前选中的货币的所有网络
  final _curNetworks = <GamingCurrencyNetworkModel>[].obs;
  List<GamingCurrencyNetworkModel> get curNetworks => _curNetworks;

  GamingCurrencyNetworkModel? networkModel;
  late final _network = networkModel.obs;
  GamingCurrencyNetworkModel? get network => _network.value;

  /// 提币地址输入框
  late GamingTextFieldController addressController;
  RxBool showAddressTip = false.obs;

  /// 是否是使用新地址
  RxBool useNewAddress = true.obs;

  /// 地址簿选择的地址
  CryptoAddressModel? selectAddressModel;
  late final _selectAddress = selectAddressModel.obs;
  CryptoAddressModel? get selectAddress => _selectAddress.value;

  ///地址错误提示语
  RxString addressError = ''.obs;

  /// 金额输入框
  late GamingTextFieldController numTextFieldController;

  /// 能否点击提现
  RxBool enableWithdrawBtn = false.obs;

  /// 常见问题
  final _faqData = <GamingFaqModel>[].obs;
  List<GamingFaqModel> get faqData => _faqData;
}
