part of 'gaming_wallet_history_logic.dart';

enum TimeScopeType {
  last7Days("past_a_d"),
  last30Days("past_b_d"),
  last90Days("past_c_d"),
  customizeTime("past_d_d");

  const TimeScopeType(this.value);
  final String value;
}

class GamingWalletHistoryState {
  final RxnInt _index = RxnInt();
  int get index => _index.value ?? 0;

  RxBool useNewAddress = true.obs;

  /// 是否数字货币
  RxBool isDigital = true.obs;

  /// 币种
  GamingCurrencyModel? currencyModel;
  late final _currency = currencyModel.obs;
  GamingCurrencyModel? get currency => _currency.value;

  /// 当前选择的状态
  HistoryStatus? historyStatus;
  late final _curStatus = historyStatus.obs;
  HistoryStatus? get curStatus => _curStatus.value;

  /// 供选择的状态(充值)
  List<HistoryStatus> depositStatus = [];

  /// 供选择的状态(提现)
  List<HistoryStatus> withdrawStatus = [];

  /// 供选择的状态(划转)
  List<HistoryStatus> transferStatus = [];

  /// 供选择的状态(调账)
  List<HistoryStatus> adjustStatus = [];

  /// 当前选择的时间范围
  TimeScopeType? timeScopeType;
  late final _curScopeType = timeScopeType.obs;
  TimeScopeType? get curScopeType => _curScopeType.value;

  /// 自定义时间的时候生效
  DateTime? startDateTime;
  late final _startTime = startDateTime.obs;
  DateTime? get startTime => _startTime.value;

  DateTime? endDateTime;
  late final _endTime = endDateTime.obs;
  DateTime? get endTime => _endTime.value;

  /// 划转的钱包
  List<GamingTransferWalletSelectType?> allWallets = [];

  /// from 钱包
  GamingTransferWalletSelectType? fromTransferWalletSelectType;
  late final _fromWallet = fromTransferWalletSelectType.obs;
  GamingTransferWalletSelectType? get fromWallet => _fromWallet.value;

  /// to 钱包
  GamingTransferWalletSelectType? toTransferWalletSelectType;
  late final _toWallet = toTransferWalletSelectType.obs;
  GamingTransferWalletSelectType? get toWallet => _toWallet.value;

  RxString toWalletName = ''.obs;

  /// 主钱包
  late GamingTransferWalletSelectType mainWallet;

  /// 红利发放方式
  List<GamingBonusGrantTypeModel?> allBonusType = [];

  /// 当前的红利发放方式
  GamingBonusGrantTypeModel? gamingBonusGrantTypeModel;
  late final _curBonusType = gamingBonusGrantTypeModel.obs;
  GamingBonusGrantTypeModel? get curBonusType => _curBonusType.value;

  /// 调账
  /// 所有账户
  List<GamingHistoryAdjustAccount> allAccounts = [];

  /// 当前账户
  late GamingHistoryAdjustAccount gamingHistoryAdjustAccount;
  late final _curAdjustAccount = gamingHistoryAdjustAccount.obs;
  GamingHistoryAdjustAccount get curAdjustAccount => _curAdjustAccount.value;

  /// Status 全部0 添加 1 扣减 2
  RxInt adjustCurStatus = 0.obs;

  /// 佣金 类型
  List<CommissionType> allCommissionType = [];

  /// 当前佣金类型
  late CommissionType commissionType = CommissionType(
    code: "",
    description: "",
  );
  late final _curCommissionType = commissionType.obs;
  CommissionType get curCommissionType => _curCommissionType.value;
}
